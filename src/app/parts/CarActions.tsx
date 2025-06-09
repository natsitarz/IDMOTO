import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiImage, FiMoreVertical } from "react-icons/fi";

export default function CarActions({
  car,
  user,
  handleUpload,
}: {
  car: any;
  user: any;
  handleUpload: (file: File) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (user?.uid !== car.userID) return null;

  return (
    <div className="absolute top-3 right-3 z-30" ref={menuRef}>
      <button
        className="absolute top-0 right-0 z-30 cursor-pointer bg-white/80 hover:bg-white text-blue-700 font-bold px-3 py-1 rounded-full shadow transition text-xs flex items-center gap-1"
        onClick={() => setOpen((v) => !v)}
        aria-label="Show car actions"
        type="button"
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
        <span>Edit</span>
      </button>
      {open && (
        <>
          {/* Overlay with blur and close on click outside */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
            onClick={() => setOpen(false)}
            style={{ touchAction: "none" }}
          />
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
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <button
              className="cursor-pointer flex items-center gap-3 px-6 py-5 hover:bg-zinc-800 transition text-white font-semibold text-base tracking-wide border-b border-zinc-800"
              onClick={() => {
                window.location.href = `/car/edit?id=${car.id}`;
                setOpen(false);
              }}
            >
              <FiEdit2 className="text-blue-400" size={20} />
              Edit car
            </button>
            <label className="flex items-center gap-3 px-6 py-5 hover:bg-zinc-800 transition text-white font-semibold text-base tracking-wide border-b border-zinc-800 cursor-pointer">
              <FiImage className="text-green-400" size={20} />
              Edit photo
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    await handleUpload(e.target.files[0]);
                    setOpen(false);
                  }
                }}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
