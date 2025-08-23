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

  // Determine if we should use vertical scroll layout (desktop only, more than 8 photos = third row)
  const useVerticalScroll = gallery.length > 8;

  if (useVerticalScroll) {
    return (
      <div className="w-full">
        {/* Mobile: Enhanced user-friendly grid */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-3 w-full">
            {sortedGallery.map((url: string, idx: number) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg flex flex-col items-center transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-zinc-800/30 border border-zinc-700/30"
                onTouchStart={() => handleTouchStart(idx)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <div className="w-full h-full flex items-center justify-center p-1">
                  <SeePhoto
                    src={url}
                    alt={`Car photo ${gallery.length - idx}`}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 rounded-xl"
                    thumbWidth={400}
                    thumbHeight={400}
                  />
                </div>

                {/* Mobile-optimized controls */}
                {userId === carUserId && (
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {/* Always visible menu button on mobile */}
                    <button
                      className="cursor-pointer bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white p-3 rounded-full shadow-lg border border-zinc-600/40 backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-90"
                      style={{
                        boxShadow:
                          "0 4px 12px 0 rgba(0,0,0,0.3), 0 2px 6px 0 rgba(0,0,0,0.2)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteIdx(showDeleteIdx === idx ? null : idx);
                      }}
                    >
                      <FiMoreVertical size={18} />
                    </button>

                    {/* Delete button - shows when menu is active */}
                    {showDeleteIdx === idx && (
                      <button
                        type="button"
                        aria-label="Remove photo"
                        title="Remove photo"
                        className="cursor-pointer bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-3 rounded-full shadow-lg border border-red-400/30 transition-all duration-200 animate-scale-in active:scale-90"
                        onClick={(e) => handleRemovePhoto(e, url)}
                      >
                        <span className="text-xl font-bold leading-none">
                          ×
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile gallery stats */}
          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-500 font-medium">
              {gallery.length} photo{gallery.length !== 1 ? "s" : ""} in gallery
            </p>
          </div>
        </div>

        {/* Desktop: Fixed height with vertical scroll for 2 rows (4 columns each) */}
        <div className="hidden md:block">
          <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 pr-2">
            <div className="grid grid-cols-4 gap-4 w-full p-2">
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
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
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
                        <span className="text-lg font-bold leading-none">
                          ×
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {sortedGallery.map((url: string, idx: number) => (
        <div
          key={idx}
          className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg flex flex-col items-center transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 active:scale-95 bg-zinc-800/30 border border-zinc-700/30"
          onTouchStart={() => handleTouchStart(idx)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className="w-full h-full flex items-center justify-center p-1 sm:p-0">
            <SeePhoto
              src={url}
              alt={`Car photo ${gallery.length - idx}`}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 sm:group-hover:scale-110 rounded-xl sm:rounded-none"
              thumbWidth={400}
              thumbHeight={400}
            />
          </div>
          {userId === carUserId && (
            <div
              className={`absolute ${
                isMobileDevice()
                  ? "top-2 right-2 flex flex-col gap-2"
                  : "bottom-3 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              }`}
            >
              <button
                className={`cursor-pointer bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full shadow border border-zinc-700/40 backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 ${
                  isMobileDevice() ? "p-2 active:scale-90" : "p-2"
                }`}
                style={{
                  boxShadow: isMobileDevice()
                    ? "0 4px 12px 0 rgba(0,0,0,0.3), 0 2px 6px 0 rgba(0,0,0,0.2)"
                    : "0 2px 8px 0 rgba(24,24,27,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.10)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteIdx(showDeleteIdx === idx ? null : idx);
                }}
              >
                <FiMoreVertical size={isMobileDevice() ? 18 : 16} />
              </button>
              {showDeleteIdx === idx && (
                <button
                  type="button"
                  aria-label="Remove photo"
                  title="Remove photo"
                  className={`flex items-center justify-center cursor-pointer bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full shadow-lg border border-red-400/30 transition-all duration-200 ${
                    isMobileDevice()
                      ? "p-3 animate-scale-in active:scale-90"
                      : "p-2 w-[32px] h-[32px]"
                  }`}
                  onClick={(e) => handleRemovePhoto(e, url)}
                >
                  <span
                    className={`font-bold leading-none ${
                      isMobileDevice() ? "text-xl" : "text-lg"
                    }`}
                  >
                    ×
                  </span>
                </button>
              )}
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
    <main className="w-full flex flex-col gap-2">
      <div className="flex w-full justify-between items-center mb-4">
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
      <div className="w-full flex flex-col gap-6 bg-white/5 rounded-xl p-4 shadow-inner">
        <GalleryList
          gallery={gallery}
          userId={user?.uid}
          carUserId={car.userID}
          handleRemovePhoto={handleRemove}
        />
      </div>
    </main>
  );
}
