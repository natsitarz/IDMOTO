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
        .catch(() => setBgUrl("/background-car-placeholder.png")); // Fallback if no photo
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
    <section className="w-full relative">
      <div className="relative h-56 sm:h-84 w-full shadow-lg flex items-center justify-center px-2 sm:px-4 overflow-hidden rounded-3xl">
        {/* Background image layer */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <img
            src={bgUrl || "/background-car-placeholder.png"}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: `center ${bgAlign}%` }}
            draggable={false}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(20,20,30,1) 0%, rgba(20,20,30,0.7) 40%, rgba(20,20,30,0.0) 100%)",
            }}
          />
        </div>
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
        <div className="flex items-center z-10 relative animate-fade-in-up">
          <div className="relative z-10 mr-4">
            <Image
              className="rounded-full border-4 shadow-xl border-white bg-white"
              src={safePhotoURL}
              alt="Profile photo"
              width={102}
              height={102}
              priority
            />
          </div>
          {/* Info next to avatar */}
          <div className="flex flex-col justify-end z-10">
            <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
              {safeDisplayName}
            </span>
            {/* Bio */}
            <div className="w-full max-w-xl mt-2">
              <span className="text-xs text-zinc-400 font-semibold mb-1 block">
                Bio
              </span>
              <div className="flex items-center gap-2 w-full">
                <span className="text-zinc-200 text-xs truncate flex-1">
                  {bio || (
                    <span className="italic text-zinc-500">No bio set</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Edit button with menu */}
        {isOwnProfile && (
          <>
            {menuOpen && (
              <>
                {/* Overlay for mobile */}
                {!showAlignModal && (
                  <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
                    onClick={() => setMenuOpen(false)}
                  />
                )}
                <div
                  className={`
                    fixed left-1/2 top-1/2 z-50
                    -translate-x-1/2 -translate-y-1/2
                    w-[320px] max-w-[90vw]
                    bg-zinc-900/95
                    rounded-2xl
                    border border-zinc-800
                    flex flex-col
                    overflow-hidden
                    shadow-xl
                    animate-fade-in-up
                  `}
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="cursor-pointer flex items-center gap-3 px-6 py-5 hover:bg-zinc-800 transition text-white font-semibold text-base tracking-wide border-b border-zinc-800"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                  >
                    <svg
                      className="w-5 h-5 text-green-400"
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
                    className="cursor-pointer flex items-center gap-3 px-6 py-5 hover:bg-zinc-800 transition text-white font-semibold text-base tracking-wide"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowAlignModal(true);
                    }}
                  >
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
              </>
            )}
          </>
        )}
      </div>
      {showAlignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-[90vw] max-w-lg relative">
            <h2 className="text-lg font-bold mb-4 text-white">
              Align background photo
            </h2>
            <div
              className="relative w-full h-25 rounded-xl mb-4 overflow-hidden bg-cover bg-center cursor-grab active:cursor-grabbing"
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
            ></div>
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
