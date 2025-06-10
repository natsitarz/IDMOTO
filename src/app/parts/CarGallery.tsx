import SeePhoto from "@/app/parts/see-photo";
import { useState } from "react";
import { FiMoreVertical, FiPlus } from "react-icons/fi";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
    navigator.userAgent
  );
}

function GalleryList({
  gallery,
  userId,
  carUserId,
  handleRemovePhoto,
}: {
  gallery: string[];
  userId: string | undefined;
  carUserId: string;
  handleRemovePhoto: (e: React.MouseEvent, url: string) => void;
}) {
  const [showDeleteIdx, setShowDeleteIdx] = useState<number | null>(null);

  // Sort gallery numerically by filename before displaying
  const getTimestamp = (url: string) => {
    let fileName = url.split("/").pop() || "";
    fileName = fileName.split("?")[0].split("#")[0];
    fileName = decodeURIComponent(fileName);
    // Match 10+ digits at the start (timestamp in seconds)
    const match = fileName.match(/^(\d{10,})-/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const sortedGallery = [...gallery]
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .reverse();

  // --- MOBILE LONG PRESS LOGIC ---
  let longPressTimer: NodeJS.Timeout | null = null;

  const handleTouchStart = (idx: number) => {
    if (!isMobileDevice()) return;
    longPressTimer = setTimeout(() => {
      setShowDeleteIdx(idx);
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (!isMobileDevice()) return;
    if (longPressTimer) clearTimeout(longPressTimer);
  };
  // --- END MOBILE LONG PRESS LOGIC ---

  if (!gallery || gallery.length === 0)
    return (
      <div className="col-span-3 text-center text-gray-400 py-8">
        No photos yet.
      </div>
    );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
      {sortedGallery.map((url: string, idx: number) => (
        <div
          key={idx}
          className="group relative aspect-square rounded-xl overflow-hidden shadow-lg flex flex-col items-center transition-transform hover:scale-105"
          onTouchStart={() => handleTouchStart(idx)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className="w-full h-full flex items-center justify-center">
            <SeePhoto
              src={url}
              alt={`Car photo ${gallery.length - idx}`}
              className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
              thumbWidth={300}
              thumbHeight={300}
            />
          </div>
          {userId === carUserId && (
            <div
              className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2
              ${
                isMobileDevice()
                  ? ""
                  : "opacity-0 group-hover:opacity-100 transition-opacity"
              }`}
            >
              <button
                className="cursor-pointer bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-full shadow border border-zinc-700/40 backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500/40"
                style={{
                  boxShadow:
                    "0 2px 8px 0 rgba(24,24,27,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.10)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteIdx(showDeleteIdx === idx ? null : idx);
                }}
              >
                <FiMoreVertical size={16} />
              </button>
              <button
                type="button"
                aria-label="Remove photo"
                title="Remove photo"
                className={`flex items-center justify-center cursor-pointer bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2 rounded-full shadow-lg border border-red-400/30 transition-all duration-200 w-[32px] h-[32px] ${
                  showDeleteIdx === idx ? "" : "hidden"
                }`}
                onClick={(e) => handleRemovePhoto(e, url)}
              >
                <span className="text-lg font-bold leading-none">×</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function handleFileChangeFactory(
  carId: string | null,
  handleUploadGallery: (file: File) => Promise<void>
) {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValidFile = e.target.files && e.target.files[0] && carId;
    if (isValidFile) {
      if (e.target.files && e.target.files[0]) {
        await handleUploadGallery(e.target.files[0]);
      }
    }
  };
}

function handleRemoveFactory(
  handleRemovePhoto: (url: string) => Promise<void>
) {
  return async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    await handleRemovePhoto(url);
  };
}

export default function CarGallery({
  car,
  user,
  carId,
  handleUploadGallery,
  handleRemovePhoto,
}: {
  car: any;
  user: any;
  carId: string | null;
  handleUploadGallery: (file: File) => Promise<void>;
  handleRemovePhoto: (url: string) => Promise<void>;
}) {
  const gallery = car.gallery || [];
  const handleFileChange = handleFileChangeFactory(carId, handleUploadGallery);
  const handleRemove = handleRemoveFactory(handleRemovePhoto);

  return (
    <div className="w-full flex flex-col gap-6 rounded-2xl">
      <div className="flex w-full justify-between items-center mb-2">
        <span className="block text-base sm:text-lg uppercase text-zinc-300 tracking-widest font-extrabold letter-spacing-wide">
          Gallery
        </span>
        {user?.uid === car.userID && (
          <label className="flex items-center gap-2 cursor-pointer border border-white/30 hover:bg-white/10 transition px-4 py-2 rounded-lg text-xs uppercase text-zinc-100 tracking-widest font-bold">
            <FiPlus size={20} />
            <span className="hidden sm:inline">Add photo</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
      <GalleryList
        gallery={gallery}
        userId={user?.uid}
        carUserId={car.userID}
        handleRemovePhoto={handleRemove}
      />
    </div>
  );
}
