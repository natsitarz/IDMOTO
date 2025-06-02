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
        className="cursor-pointer bg-zinc-900/80 border border-gray-600 hover:bg-zinc-800 text-white rounded-full p-3 shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
        onClick={() => setOpen((v) => !v)}
        aria-label="Show car actions"
        type="button"
      >
        <FiMoreVertical size={22} />
      </button>
      {open && (
        <div className="mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 absolute right-0 animate-fade-in-up">
          <button
            className="cursor-pointer w-full flex items-center gap-2 px-5 py-3 hover:bg-blue-50 dark:hover:bg-zinc-800 transition rounded-t-2xl text-zinc-800 dark:text-zinc-100 font-medium group uppercase text-xs tracking-widest"
            onClick={() => {
              window.location.href = `/car/edit?id=${car.id}`;
              setOpen(false);
            }}
          >
            <FiEdit2 className="text-blue-600 group-hover:scale-110 transition-transform" />
            Edit car
          </button>
          <label className="w-full flex items-center gap-2 px-5 py-3 hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-b-2xl cursor-pointer text-zinc-800 dark:text-zinc-100 font-medium group uppercase text-xs tracking-widest">
            <FiImage className="text-green-600 group-hover:scale-110 transition-transform" />
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
      )}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
