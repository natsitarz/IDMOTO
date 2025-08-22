import { db } from "@/app/parts/firebase";
import { validateContent } from "@/lib/api-client";
import { CarFormData } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

export default function CarFormSpecs({
  form,
  setForm,
  onSubmit,
  saving,
  error,
  carId,
  userId,
}: {
  form: CarFormData;
  setForm: React.Dispatch<React.SetStateAction<CarFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  carId: string;
  userId: string;
}) {
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev: CarFormData) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Enhanced form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationWarnings([]);

    try {
      // Validate vehicle specs data
      const specsData = {
        nm: form.nm,
        version: form.version,
        mileage: form.mileage,
        color: form.color,
      };

      const validation = await validateContent(
        JSON.stringify(specsData),
        "vehicle_data",
        { section: "specifications" }
      );

      if (!validation.isValid) {
        setValidationWarnings(validation.errors);
        setIsValidating(false);
        return;
      }

      if (validation.warnings.length > 0) {
        setValidationWarnings(validation.warnings);
      }

      // Proceed with original submission
      onSubmit(e);
    } catch (error) {
      console.error("Validation error:", error);
      setValidationWarnings([
        "Validation service temporarily unavailable. Please try again.",
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  // Fetch specs from Firestore on mount
  useEffect(() => {
    const fetchSpecs = async () => {
      if (!carId) return;
      const docRef = doc(db, "vehicles", carId); // <-- FIXED PATH
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm((prev: CarFormData) => ({
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
      {/* Validation warnings */}
      {validationWarnings.length > 0 && (
        <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-yellow-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-yellow-500">
              Validation Warnings
            </span>
          </div>
          {validationWarnings.map((warning, index) => (
            <p key={index} className="text-sm text-yellow-400">
              {warning}
            </p>
          ))}
        </div>
      )}
      {/* Środek: ustawienia */}
      <form
        onSubmit={handleSubmit}
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
          disabled={saving || isValidating}
          className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
        >
          {isValidating
            ? "Validating..."
            : saving
            ? "Saving..."
            : "Save Changes"}
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
