import { db, storage } from "@/app/parts/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ProfileHeaderProps {
  displayName: string;
  photoURL: string;
  email: string;
  uid: string;
  country: string;
  bio: string;
  currentUserUid: string;
  onEdit?: () => void;
  onSaveBio?: (newBio: string) => Promise<void>;
  isOwnProfile: boolean;
  backgroundPicUrl?: string;
}

export function ProfileHeader({
  displayName,
  photoURL,
  uid,
  country,
  bio,
  onEdit,
  onSaveBio,
  isOwnProfile,
}: ProfileHeaderProps) {
  const [editingBio, setEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState(bio || "");
  const [savingBio, setSavingBio] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAlignModal, setShowAlignModal] = useState(false);
  const [bgAlign, setBgAlign] = useState<number>(50); // 0 = top, 100 = bottom, 50 = center
  const [bgUrl, setBgUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // Fallbacks for displayName and photoURL
  const safeDisplayName =
    displayName && displayName !== "Loading…" ? displayName : "No name";
  const safePhotoURL =
    photoURL && photoURL !== "/logo.png" ? photoURL : "/logo.png";

  useEffect(() => {
    setBioValue(bio || "");
  }, [bio]);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists() && typeof snap.data().bgAlign === "number") {
        setBgAlign(snap.data().bgAlign);
      }
    });
  }, [uid]);

  // Always try to fetch background photo from storage, not from Firestore/doc
  useEffect(() => {
    if (uid) {
      getDownloadURL(ref(storage, `users/${uid}/backgroundpic`))
        .then(setBgUrl)
        .catch(() => setBgUrl(undefined));
    }
  }, [uid]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        editButtonRef.current &&
        !editButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleSave = async () => {
    if (!onSaveBio) return;
    if (bioValue.length > 25) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Bio must be 25 characters or less.",
        })
      );
      return;
    }
    setSavingBio(true);
    try {
      await onSaveBio(bioValue);
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Bio saved successfully!",
        })
      );
      setEditingBio(false);
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to save bio. Please try again.",
        })
      );
    }
    setSavingBio(false);
  };

  // Handle background photo upload
  const handleBgPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `users/${uid}/backgroundpic`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setBgUrl(url);
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Background photo updated!",
        })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to upload background photo.",
        })
      );
    }
    setUploading(false);
    setMenuOpen(false);
  };

  return (
    <section className="w-full relative mx-auto">
      <div
        className="relative h-45 sm:h-84 w-full rounded-3xl shadow-lg flex items-end px-6 pb-6 overflow-hidden"
        style={{
          backgroundImage: bgUrl
            ? `url(${bgUrl})`
            : "linear-gradient(135deg, #1e3a8a 0%, #2563eb 30%, #334155 100%)",
          backgroundPosition: `center ${bgAlign}%`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        {/* Gradient overlay for clarity */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(20,20,30,1) 0%, rgba(20,20,30,0.7) 40%, rgba(20,20,30,0.0) 100%)",
          }}
        />
        {isOwnProfile && (
          <button
            ref={editButtonRef}
            className="absolute top-4 right-4 z-30 cursor-pointer bg-white/80 hover:bg-white text-blue-700 font-bold px-3 py-1 rounded-full shadow transition text-xs flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            type="button"
            disabled={uploading}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
              />
            </svg>
            Edit
          </button>
        )}
        {/* Avatar */}
        <div className="relative z-10">
          <Image
            className="rounded-full border-4 border-white shadow-xl bg-white"
            src={safePhotoURL}
            alt="Profile photo"
            width={96}
            height={96}
            priority
          />
          <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow"></span>
        </div>
        {/* Info next to avatar */}
        <div className="ml-5 flex flex-col justify-end z-10">
          <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
            {safeDisplayName}
          </span>
          <span className="block text-xs uppercase text-zinc-400 tracking-widest">
            {country ? (
              <span className="text-zinc-200">{country}</span>
            ) : (
              <span className="italic text-zinc-500">No country set</span>
            )}
          </span>
          {/* Bio */}
          <div className="w-full max-w-xl mt-2">
            <span className="text-xs text-zinc-400 font-semibold mb-1 block">
              Bio
            </span>
            {isOwnProfile && editingBio ? (
              <div className="relative w-max">
                <input
                  type="text"
                  className="rounded-xl px-2 py-1 sm:px-3 sm:py-2 pr-16 bg-zinc-900/80 text-white border-2 border-blue-500/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40 placeholder:text-zinc-400 font-medium text-xs shadow-inner transition sm:w-60"
                  value={bioValue}
                  onChange={(e) => setBioValue(e.target.value)}
                  maxLength={40}
                  disabled={savingBio}
                  autoFocus
                  placeholder="Add a short bio"
                />
                <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                  <button
                    type="button"
                    className={`cursor-pointer p-1 rounded hover:bg-blue-700 transition ${
                      savingBio ? "opacity-50 pointer-events-none" : ""
                    }`}
                    disabled={savingBio}
                    onClick={handleSave}
                    tabIndex={savingBio ? -1 : 0}
                    aria-label="Save"
                  >
                    {/* Checkmark icon */}
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`cursor-pointer p-1 rounded hover:bg-zinc-700 transition ${
                      savingBio ? "opacity-50 pointer-events-none" : ""
                    }`}
                    disabled={savingBio}
                    onClick={() => {
                      setEditingBio(false);
                      setBioValue(bio || "");
                    }}
                    tabIndex={savingBio ? -1 : 0}
                    aria-label="Cancel"
                  >
                    {/* X icon */}
                    <svg
                      className="w-4 h-4 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <span className="text-zinc-200 text-xs truncate flex-1">
                  {bio || (
                    <span className="italic text-zinc-500">No bio set</span>
                  )}
                </span>
                {isOwnProfile && (
                  <button
                    className="cursor-pointer text-blue-400 hover:text-white text-xs underline"
                    onClick={() => setEditingBio(true)}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Edit button with menu */}
        {isOwnProfile && (
          <div className="absolute top-6 right-6 z-30 sm:z-25" ref={menuRef}>
            {menuOpen && (
              <>
                {/* Overlay for mobile */}
                {showAlignModal ? null : (
                  <div
                    className="fixed inset-0 z-40 bg-black/40 sm:hidden backdrop-blur-md"
                    onClick={() => setMenuOpen(false)}
                  />
                )}
                <div
                  className={`
                  h-full
                  rounded-2xl shadow-2xl flex-col animate-fade-in z-60
                  sm:static
                  fixed inset-0 m-0
                  sm:flex-col
                  sm:justify-start
                  sm:items-start
                  sm:py-2
                  sm:z-30
                  sm:bg-gradient-to-br
                  sm:from-zinc-900 sm:via-zinc-800 sm:to-zinc-900
                  sm:border sm:border-zinc-700
                  sm:shadow-2xl
                  sm:backdrop-blur-md
                  sm:rounded-2xl
                  flex items-center justify-center
                `}
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 sm:hidden p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 z-50"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    type="button"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="flex flex-col gap-3 w-full max-w-xs mx-auto sm:max-w-none sm:gap-0">
                    <button
                      className="cursor-pointer flex items-center gap-3 px-5 py-3 text-base text-zinc-100 hover:bg-blue-700/80 hover:text-white rounded-2xl sm:rounded-t-2xl transition font-semibold tracking-wide w-full"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit && onEdit();
                      }}
                    >
                      {/* User icon */}
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z"
                        />
                        <circle
                          cx="12"
                          cy="11"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      Edit profile
                    </button>
                    <button
                      className="cursor-pointer flex items-center gap-3 px-5 py-3 text-base text-zinc-100 hover:bg-blue-700/80 hover:text-white transition font-semibold tracking-wide w-full"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading}
                    >
                      {/* Image icon */}
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="8.5"
                          cy="10.5"
                          r="1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 19l-5.5-7-4.5 6-3-4-4 5"
                        />
                      </svg>
                      {uploading ? "Uploading..." : "Edit background photo"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        await handleBgPhotoChange(e);
                        setMenuOpen(false);
                      }}
                      disabled={uploading}
                    />
                    <button
                      className="cursor-pointer flex items-center gap-3 px-5 py-3 text-base text-zinc-100 hover:bg-blue-700/80 hover:text-white rounded-2xl sm:rounded-b-2xl transition font-semibold tracking-wide w-full"
                      onClick={() => setShowAlignModal(true)}
                    >
                      {/* Align icon */}
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="4"
                          y="10"
                          width="16"
                          height="4"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16"
                        />
                      </svg>
                      Align background photo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {showAlignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-[90vw] max-w-lg relative">
            <h2 className="text-lg font-bold mb-4 text-white">
              Align background photo
            </h2>
            <div
              className="relative w-full h-40 rounded-xl mb-4 overflow-hidden bg-cover bg-center cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
                backgroundPosition: `center ${bgAlign}%`,
              }}
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startAlign = bgAlign;
                let dragging = true;

                const onMouseMove = (moveEvent: MouseEvent) => {
                  if (!dragging) return;
                  const deltaY = moveEvent.clientY - startY;
                  // Przesuwanie: 40px wysokości = 100%
                  const percentDelta = (deltaY / 160) * 100;
                  const newAlign = Math.max(
                    0,
                    Math.min(100, startAlign + percentDelta)
                  );
                  setBgAlign(newAlign);
                };

                const onMouseUp = () => {
                  dragging = false;
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                };

                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            >
              {/* Deadzone overlays */}
              <div className="absolute left-0 top-0 w-full h-5 bg-black/60 pointer-events-none rounded-t-xl" />
              <div className="absolute left-0 bottom-0 w-full h-10 bg-black/60 pointer-events-none rounded-b-xl" />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={bgAlign}
              onChange={(e) => setBgAlign(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="cursor-pointer px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                onClick={() => setShowAlignModal(false)}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  await updateDoc(doc(db, "users", uid), { bgAlign });
                  setShowAlignModal(false);
                  window.dispatchEvent(
                    new CustomEvent("show-global-success", {
                      detail: "Background alignment saved!",
                    })
                  );
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
