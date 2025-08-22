import { db, storage } from "@/app/parts/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiEdit3, FiImage, FiMove, FiX } from "react-icons/fi";

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

// Enhanced Background Alignment Modal Component
function BackgroundAlignmentModal({
  isOpen,
  onClose,
  onSave,
  backgroundUrl,
  bgAlign,
  setBgAlign,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  backgroundUrl: string;
  bgAlign: number;
  setBgAlign: (value: number) => void;
  saving: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.classList.add("bg-alignment-modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.classList.remove("bg-alignment-modal-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.classList.remove("bg-alignment-modal-open");
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Ensure we have a portal container
  const portalContainer =
    document.getElementById("modal-root") || document.body;

  const modalContent = (
    <>
      {/* Fullscreen blurred backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[999999] bg-alignment-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-alignment-modal-container">
        <div className="w-full max-w-5xl mx-auto bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FiMove className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Align Background Photo
                </h2>
                <p className="text-sm text-zinc-400">
                  Adjust the vertical position of your background image
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer w-10 h-10 rounded-full bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Header preview - exact same dimensions as real header */}
            <div className="flex justify-center mb-8">
              <div className="relative h-56 sm:h-84 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 group">
                {/* Background image with alignment */}
                <div
                  className="absolute inset-0 bg-cover bg-center cursor-grab active:cursor-grabbing transition-all duration-300 select-none"
                  style={{
                    backgroundImage: `url(${backgroundUrl})`,
                    backgroundPosition: `center ${bgAlign}%`,
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const startY = e.clientY;
                    const startAlign = bgAlign;
                    let dragging = true;

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      if (!dragging) return;
                      const deltaY = moveEvent.clientY - startY;
                      const percentDelta = (deltaY / rect.height) * 100;
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
                />

                {/* Gradient overlay - same as real header */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(20,20,30,1) 0%, rgba(20,20,30,0.7) 40%, rgba(20,20,30,0.0) 100%)",
                  }}
                />

                {/* Sample avatar and content to show positioning context */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center z-10 p-8 select-none">
                  <div className="relative mr-4">
                    <div className="w-[102px] h-[102px] rounded-full border-4 border-white bg-zinc-800 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
                      Preview
                    </span>
                    <div className="w-full max-w-xl mt-2">
                      <span className="text-xs text-zinc-400 font-semibold mb-1 block">
                        Bio
                      </span>
                      <span className="text-zinc-200 text-xs">Lorem ipsum</span>
                    </div>
                  </div>
                </div>

                {/* Alignment indicator */}
                <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-white font-medium border border-white/20 select-none">
                  Position: {Math.round(bgAlign)}%
                </div>

                {/* Hover effect */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/50 transition-all duration-300" />
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center mb-6">
              <p className="text-zinc-300 text-sm">
                <strong>Drag the preview above</strong> or use the slider below
                to adjust the vertical position
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                0% = Top of image • 50% = Center • 100% = Bottom of image
              </p>
            </div>

            {/* Slider control */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-zinc-300">
                  Vertical Position
                </label>
                <span className="text-blue-400 font-medium text-sm">
                  {Math.round(bgAlign)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={bgAlign}
                onChange={(e) => setBgAlign(Number(e.target.value))}
                style={{ "--value": `${bgAlign}%` } as React.CSSProperties}
                className="w-full h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>Top</span>
                <span>Center</span>
                <span>Bottom</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                className="cursor-pointer flex-1 px-6 py-3 rounded-2xl bg-zinc-700 text-white hover:bg-zinc-600 font-medium transition-all disabled:opacity-50"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer flex-1 px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={saving}
                onClick={onSave}
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, portalContainer);
}

export function ProfileHeader({
  displayName,
  photoURL,
  uid,
  bio,
  isOwnProfile,
}: ProfileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAlignModal, setShowAlignModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bgAlign, setBgAlign] = useState<number>(50); // 0 = top, 100 = bottom, 50 = center
  const [originalBgAlign, setOriginalBgAlign] = useState<number>(50); // Store original value for cancel
  const [bgUrl, setBgUrl] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // Fallbacks for displayName and photoURL
  const safeDisplayName =
    displayName && displayName !== "Loading…" ? displayName : "No name";
  const safePhotoURL =
    photoURL && photoURL !== "/logo.png" ? photoURL : "/logo.png";

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists() && typeof snap.data().bgAlign === "number") {
        setBgAlign(snap.data().bgAlign);
      }
    });
  }, [uid]);

  // Cancel function to revert alignment changes
  const handleCancelAlignment = () => {
    setBgAlign(originalBgAlign); // Revert to original value
    setShowAlignModal(false);
  };

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
          detail: "Background photo updated successfully!",
        })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to upload background photo. Please try again.",
        })
      );
    }
    setUploading(false);
    setMenuOpen(false);
  };

  // Handle alignment save
  const handleSaveAlignment = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), { bgAlign });
      setShowAlignModal(false);
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Background alignment saved successfully!",
        })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to save alignment. Please try again.",
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full relative">
      <div className="relative h-56 sm:h-84 w-full shadow-2xl flex px-2 sm:px-4 overflow-hidden rounded-3xl border border-zinc-800/50">
        {/* Background image layer */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <Image
            src={bgUrl || "/background-car-placeholder.png"}
            alt=""
            fill
            className="object-cover transition-all duration-500"
            style={{ objectPosition: `center ${bgAlign}%` }}
            draggable={false}
            priority
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(20,20,30,1) 0%, rgba(20,20,30,0.7) 40%, rgba(20,20,30,0.0) 100%)",
            }}
          />
        </div>

        {/* Edit button - enhanced design */}
        {isOwnProfile && (
          <button
            ref={editButtonRef}
            className="absolute top-4 right-4 z-[40] cursor-pointer bg-white/90 hover:bg-white text-blue-700 hover:text-blue-800 font-bold px-3 py-1.5 rounded-full shadow-lg transition-all text-xs flex items-center gap-1.5 backdrop-blur-sm border border-white/20 hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            type="button"
            disabled={uploading}
          >
            <FiEdit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}

        {/* Avatar and profile info - centered on mobile, bottom-left on desktop */}
        <div className="absolute inset-0 sm:bottom-0 sm:top-auto sm:left-0 sm:right-0 flex items-center sm:items-end justify-center sm:justify-start z-10 p-4 sm:p-8 animate-fade-in-up">
          <div className="relative mr-4">
            <Image
              className="rounded-full border-4 shadow-2xl border-white bg-white transition-all duration-300 hover:scale-105"
              src={safePhotoURL}
              alt="Profile photo"
              width={102}
              height={102}
              priority
            />
          </div>
          {/* Info next to avatar */}
          <div className="flex flex-col justify-center sm:justify-end text-left">
            <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
              {safeDisplayName}
            </span>
            {/* Bio */}
            <div className="w-full max-w-xl mt-2">
              <span className="text-xs text-zinc-400 font-semibold mb-1 block">
                Bio
              </span>
              <span className="text-zinc-200 text-xs">
                {bio || (
                  <span className="italic text-zinc-500">No bio set</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced edit menu as fullscreen modal using portal */}
        {isOwnProfile &&
          menuOpen &&
          mounted &&
          createPortal(
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-[999998] bg-black/50 backdrop-blur-md"
                onClick={() => setMenuOpen(false)}
              />

              {/* Menu */}
              <div
                className="fixed left-1/2 top-1/2 z-[999999] -translate-x-1/2 -translate-y-1/2 w-[320px] max-w-[90vw] bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-700/50 flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-700/50">
                  <h3 className="text-white font-semibold text-lg">
                    Edit Background
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Customize your profile header
                  </p>
                </div>

                {/* Upload Photo Button */}
                <button
                  className="cursor-pointer flex items-center gap-3 px-6 py-4 hover:bg-zinc-800/50 transition-all text-white font-medium text-base border-b border-zinc-700/30 group"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading}
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <FiImage className="text-green-400" size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">
                      {uploading ? "Uploading..." : "Change Photo"}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      Update background image
                    </div>
                  </div>
                  {uploading && (
                    <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBgPhotoChange}
                  disabled={uploading}
                />

                {/* Align Photo Button */}
                <button
                  className={`cursor-pointer flex items-center gap-3 px-6 py-4 hover:bg-zinc-800/50 transition-all text-white font-medium text-base group ${
                    !bgUrl || bgUrl.includes("background-car-placeholder.png")
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    // Only allow alignment if there's an actual uploaded background image
                    if (
                      !bgUrl ||
                      bgUrl.includes("background-car-placeholder.png")
                    ) {
                      window.dispatchEvent(
                        new CustomEvent("show-global-warning", {
                          detail:
                            "Please upload a background photo first before adjusting alignment.",
                        })
                      );
                      setMenuOpen(false);
                      return;
                    }

                    // Additional safety check to prevent conflicts
                    if (showAlignModal) {
                      return;
                    }

                    setMenuOpen(false);
                    setOriginalBgAlign(bgAlign); // Save current value for potential revert
                    setShowAlignModal(true);
                  }}
                  disabled={
                    !bgUrl || bgUrl.includes("background-car-placeholder.png")
                  }
                >
                  <div
                    className={`w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors ${
                      !bgUrl || bgUrl.includes("background-car-placeholder.png")
                        ? "bg-zinc-600/20 group-hover:bg-zinc-600/20"
                        : ""
                    }`}
                  >
                    <FiMove
                      className={`text-blue-400 ${
                        !bgUrl ||
                        bgUrl.includes("background-car-placeholder.png")
                          ? "text-zinc-500"
                          : ""
                      }`}
                      size={18}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Align Photo</div>
                    <div className="text-zinc-400 text-sm">
                      {!bgUrl ||
                      bgUrl.includes("background-car-placeholder.png")
                        ? "Upload a background photo first"
                        : "Adjust image position"}
                    </div>
                  </div>
                </button>

                {/* Cancel Button */}
                <div className="px-6 py-4 border-t border-zinc-700/30">
                  <button
                    className="cursor-pointer w-full px-4 py-2 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 hover:text-white font-medium rounded-xl transition-all text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
      </div>

      {/* Background Alignment Modal */}
      <BackgroundAlignmentModal
        isOpen={showAlignModal}
        onClose={handleCancelAlignment}
        onSave={handleSaveAlignment}
        backgroundUrl={bgUrl || "/background-car-placeholder.png"}
        bgAlign={bgAlign}
        setBgAlign={setBgAlign}
        saving={saving}
      />

      {/* Enhanced Global Styles */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }

        /* Enhanced slider styles */
        .slider {
          background: linear-gradient(
            to right,
            #3b82f6 0%,
            #3b82f6 var(--value, 50%),
            #374151 var(--value, 50%),
            #374151 100%
          );
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4),
            0 6px 16px rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }

        /* Background alignment modal specific styles */
        .bg-alignment-modal-backdrop {
          z-index: 999999 !important;
        }

        .bg-alignment-modal-container {
          z-index: 1000000 !important;
        }

        body.bg-alignment-modal-open {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4),
            0 6px 16px rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }
      `}</style>
    </section>
  );
}
