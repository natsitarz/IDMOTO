import { db } from "@/app/parts/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

// Reusable AcceptModal component for confirmations
function AcceptModal({
  open,
  onAccept,
  onCancel,
  title,
  description,
  isLoading = false,
}: {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  isLoading?: boolean;
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-white/20 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        {description && (
          <p className="text-zinc-300 mb-6 leading-relaxed">{description}</p>
        )}

        <div className="flex gap-3">
          <button
            className="cursor-pointer flex-1 px-4 py-3 rounded-2xl bg-zinc-700 text-white hover:bg-zinc-600 font-medium transition-all disabled:opacity-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={onAccept}
            disabled={isLoading}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDeleteCar();
      setShowConfirm(false);
    } catch (error) {
      console.error("Error deleting car:", error);
      // You might want to show an error message here
    } finally {
      setDeleting(false);
    }
  };

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

      {/* Delete Confirmation Modal */}
      <AcceptModal
        open={showConfirm}
        title="Delete Car"
        description="Are you sure you want to delete this car from your collection? This action cannot be undone."
        onAccept={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isLoading={deleting}
      />
    </div>
  );
}
