import { db } from "@/app/parts/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export default function CarFormSettings({
  carId,
  visibility: initialVisibility,
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
  const [visibility, setVisibility] = useState<"public" | "private" | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch visibility from Firestore before showing UI
  useEffect(() => {
    let isMounted = true;
    async function fetchVisibility() {
      if (!carId) return;
      const carDoc = await getDoc(doc(db, "vehicles", carId));
      if (carDoc.exists()) {
        const firestoreVisibility = carDoc.data().visibility;
        if (
          firestoreVisibility === "public" ||
          firestoreVisibility === "private"
        ) {
          if (isMounted) {
            setVisibility(firestoreVisibility);
            setLoading(false);
            // Do NOT call onVisibilityChange here, only when user changes select
          }
          return;
        }
      }
      // fallback to initialVisibility if not found
      if (isMounted) {
        setVisibility(initialVisibility);
        setLoading(false);
      }
    }
    fetchVisibility();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId]);

  // Zamykaj dropdown po kliknięciu poza selecta
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

  if (loading || visibility === null) {
    return (
      <div className="flex items-center justify-center w-full h-40 text-zinc-400">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between w-full z-10 max-w-lg relative h-full">
      {/* Tytuł na samej górze */}
      <div className="flex flex-col items-center gap-2 z-10 w-full">
        <h1 className="block text-2xl uppercase text-white tracking-widest font-extrabold drop-shadow">
          Car Settings
        </h1>
        <p className="block text-xs uppercase text-zinc-400 tracking-widest font-medium">
          Manage your car settings below
        </p>
      </div>
      {/* Środek: ustawienia */}
      <div className="flex-1 flex flex-col justify-center w-full gap-6">
        <div className="w-full flex flex-col gap-2">
          <label
            className="text-xs font-semibold text-zinc-300 ml-1"
            htmlFor="visibility"
          >
            Visibility
          </label>
          {/* Custom select */}
          <div ref={selectRef} className="relative" tabIndex={0}>
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
                      setVisibility(option.value as "public" | "private");
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
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-300 ml-1">
            Danger Zone
          </label>
          <button
            type="button"
            className="cursor-pointer w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition"
            onClick={() => setShowConfirm(true)}
          >
            Delete this car
          </button>
        </div>
      </div>
      {/* Potwierdzenie usunięcia */}
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
