import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiEdit2, FiImage } from "react-icons/fi";

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
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Prevent scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (user?.uid !== car.userID) return null;

  const modalContent = open ? (
    <>
      {/* Overlay with blur and close on click outside - highest z-index */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999998]"
        onClick={() => setOpen(false)}
        style={{ touchAction: "none" }}
      />

      {/* Modal with proper z-index above overlay */}
      <div
        className="fixed left-1/2 top-1/2 w-[320px] max-w-[90vw] bg-zinc-900/95 rounded-2xl border border-zinc-700/50 flex flex-col overflow-hidden shadow-2xl animate-fade-in-up z-[999999]"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-700/50">
          <h3 className="text-white font-semibold text-lg">Edit Vehicle</h3>
          <p className="text-zinc-400 text-sm">
            Choose an action for your vehicle
          </p>
        </div>

        {/* Edit Car Button */}
        <button
          className="cursor-pointer flex items-center gap-3 px-6 py-4 hover:bg-zinc-800/50 transition-all text-white font-medium text-base border-b border-zinc-700/30 group"
          onClick={() => {
            window.location.href = `/car/edit?id=${car.id}`;
            setOpen(false);
          }}
        >
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
            <FiEdit2 className="text-blue-400" size={18} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold">Edit Details</div>
            <div className="text-zinc-400 text-sm">
              Modify car specifications and info
            </div>
          </div>
        </button>

        {/* Edit Photo Button */}
        <label className="flex items-center gap-3 px-6 py-4 hover:bg-zinc-800/50 transition-all text-white font-medium text-base cursor-pointer group">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
            <FiImage className="text-green-400" size={18} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold">Change Photo</div>
            <div className="text-zinc-400 text-sm">
              Update the main vehicle image
            </div>
          </div>
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

        {/* Cancel Button */}
        <div className="px-6 py-4 border-t border-zinc-700/30">
          <button
            className="cursor-pointer w-full px-4 py-2 bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 hover:text-white font-medium rounded-xl transition-all text-sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Enhanced animation styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </>
  ) : null;

  return (
    <div className="relative">
      <button
        className="cursor-pointer bg-white/90 hover:bg-white text-blue-700 hover:text-blue-800 font-bold px-3 py-1.5 rounded-full shadow-lg transition-all text-xs flex items-center gap-1.5 backdrop-blur-sm border border-white/20"
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

      {/* Use portal to render modal at document body level */}
      {mounted &&
        typeof document !== "undefined" &&
        modalContent &&
        createPortal(modalContent, document.body)}
    </div>
  );
}
