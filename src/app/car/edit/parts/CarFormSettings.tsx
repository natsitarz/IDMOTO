import { useEffect, useRef, useState } from "react";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export default function CarFormSettings({
  carId,
  visibility,
  onVisibilityChange,
  onDeleteCar,
}: {
  carId: string;
  visibility: "public" | "private";
  onVisibilityChange: (v: "public" | "private") => void;
  onDeleteCar: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <h2 className="text-xl font-bold text-white">Settings</h2>
      <div className="w-full max-w-xs flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            Visibility
          </label>
          {/* Custom select */}
          <div
            ref={selectRef}
            className="relative"
            tabIndex={0}
            // USUŃ onBlur, bo to powoduje problem z klikaniem
          >
            <button
              type="button"
              className={`w-full flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base shadow-inner cursor-pointer ${
                open ? "ring-2 ring-blue-500/70" : ""
              }`}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              {VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.label}
              <svg
                className={`ml-2 w-4 h-4 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {open && (
              <ul
                className="absolute left-0 z-20 mt-2 w-full rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-xl overflow-hidden"
                style={{ minWidth: "100%" }}
                role="listbox"
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <li
                    key={option.value}
                    className={`px-4 py-3 cursor-pointer transition text-base ${
                      visibility === option.value
                        ? "bg-blue-600/80 text-white font-semibold"
                        : "text-zinc-200 hover:bg-zinc-800/80"
                    }`}
                    onClick={() => {
                      onVisibilityChange(option.value as "public" | "private");
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={visibility === option.value}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <button
            type="button"
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition"
            onClick={() => setShowConfirm(true)}
          >
            Delete this car
          </button>
        </div>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-[90vw] max-w-xs relative flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-zinc-300 mb-6 text-center">
              Are you sure you want to delete this car from your collection?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setShowConfirm(false);
                  onDeleteCar();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
