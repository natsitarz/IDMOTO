import { db } from "@/app/parts/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect } from "react";

export default function CarFormSpecs({
  form,
  setForm,
  onSubmit,
  saving,
  error,
  carId,
  userId,
}: {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  carId: string;
  userId: string;
}) {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fetch specs from Firestore on mount
  useEffect(() => {
    const fetchSpecs = async () => {
      if (!carId) return;
      const docRef = doc(db, "vehicles", carId); // <-- FIXED PATH
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm((prev: any) => ({
          ...prev,
          nm: data.nm || "",
          version: data.version || "",
          mileage: data.mileage || "",
          color: data.color || "",
        }));
      }
    };
    fetchSpecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId, userId]);

  return (
    <div className="flex flex-col items-center justify-between w-full z-10 max-w-lg relative h-full gap-8">
      {/* Tytuł na samej górze */}
      <div className="flex flex-col items-center gap-2 z-10 w-full">
        <h1 className="block text-2xl uppercase text-white tracking-widest font-extrabold drop-shadow">
          Edit Car Specs
        </h1>
        <p className="block text-xs uppercase text-zinc-400 tracking-widest font-medium">
          Update your car specs below
        </p>
      </div>
      {/* Środek: ustawienia */}
      <form
        onSubmit={onSubmit}
        className="flex-1 flex flex-col justify-center w-full gap-6"
      >
        <div className="w-full flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="nm"
            >
              Nm
            </label>
            <input
              type="number"
              name="nm"
              id="nm"
              placeholder="Nm"
              value={form.nm ?? ""}
              onChange={handleChange}
              required
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  ![
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
              style={{ MozAppearance: "textfield" }}
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="version"
            >
              Version
            </label>
            <input
              type="text"
              name="version"
              id="version"
              placeholder="Version"
              value={form.version ?? ""}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="mileage"
            >
              Mileage
            </label>
            <input
              type="number"
              name="mileage"
              id="mileage"
              placeholder="Mileage"
              value={form.mileage ?? ""}
              onChange={handleChange}
              required
              min="0"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              style={{ MozAppearance: "textfield" }}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  ![
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="color"
            >
              Color
            </label>
            <input
              type="text"
              name="color"
              id="color"
              placeholder="Color"
              value={form.color ?? ""}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {error && error === "Car info updated!" && (
          <div className="text-green-400 mt-2 text-center">{error}</div>
        )}
        {error && error !== "Car info updated!" && (
          <div className="text-red-400 mt-2 text-center">{error}</div>
        )}
      </form>
    </div>
  );
}
