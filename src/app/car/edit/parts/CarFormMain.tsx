import { validateContent } from "@/lib/api-client";
import { CarFormData } from "@/types";
import React, { useState } from "react";

export default function CarFormMain({
  form,
  setForm,
  onSubmit,
  saving,
  error,
}: {
  form: CarFormData;
  setForm: React.Dispatch<React.SetStateAction<CarFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
}) {
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

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

    // Validate vehicle data before submission
    const validation = await validateContent("", "vehicle_data", {
      manufacturer: form.manufacturer,
      model: form.model,
      year: form.year,
      engine: form.engine,
      horsepower: form.horsepower,
      transmission: form.transmission,
      description: form.description,
    });

    if (!validation.isValid) {
      // Show validation errors
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail:
            validation.errors[0] || "Please check your vehicle information",
        })
      );
      return;
    }

    // Show warnings (non-blocking)
    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
    }

    // Proceed with original form submission
    onSubmit(e);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full z-10 max-w-lg relative h-full">
      {/* Tytuł na samej górze */}
      <div className="flex flex-col items-center gap-2 z-10 w-full">
        <h1 className="block text-2xl uppercase text-white tracking-widest font-extrabold drop-shadow">
          Edit Car Details
        </h1>
        <p className="block text-xs uppercase text-zinc-400 tracking-widest font-medium">
          Update your car information below
        </p>
      </div>
      {/* Środek: ustawienia */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col justify-center w-full gap-6"
      >
        <div className="w-full flex flex-col gap-2">
          <label
            className="text-xs font-semibold text-zinc-300 ml-1"
            htmlFor="manufacturer"
          >
            Manufacturer
          </label>
          <input
            type="text"
            name="manufacturer"
            id="manufacturer"
            placeholder="Manufacturer"
            value={form.manufacturer}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label
            className="text-xs font-semibold text-zinc-300 ml-1"
            htmlFor="model"
          >
            Model
          </label>
          <input
            type="text"
            name="model"
            id="model"
            placeholder="Model"
            value={form.model}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
          />
        </div>
        <div className="w-full flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="year"
            >
              Year
            </label>
            <input
              type="number"
              name="year"
              id="year"
              placeholder="Year"
              value={form.year}
              onChange={handleChange}
              required
              min="1866"
              max="2100"
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
              htmlFor="engine"
            >
              Engine
            </label>
            <input
              type="text"
              name="engine"
              id="engine"
              placeholder="Engine"
              value={form.engine}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 md:flex-row md:gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="horsepower"
            >
              Horsepower
            </label>
            <input
              type="number"
              name="horsepower"
              id="horsepower"
              placeholder="Horsepower"
              value={form.horsepower}
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
              htmlFor="transmission"
            >
              Transmission
            </label>
            <input
              type="text"
              name="transmission"
              id="transmission"
              placeholder="Transmission"
              value={form.transmission}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <label
            className="text-xs font-semibold text-zinc-300 ml-1"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="Describe your car (optional)"
            value={form.description || ""}
            onChange={handleChange}
            maxLength={25}
            rows={4}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner resize-none"
          />
          <span className="text-xs text-zinc-500 text-right">
            {form.description.length}/25
          </span>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {validationWarnings.map((warning, index) => (
              <div key={index} className="text-yellow-400 text-sm text-center">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}

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
