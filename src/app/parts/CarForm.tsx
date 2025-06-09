import React from "react";

type CarFormProps = {
  form: {
    manufacturer: string;
    model: string;
    year: string;
    engine: string;
    horsepower: string;
    transmission: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
};

export default function CarForm({
  form,
  setForm,
  onSubmit,
  saving,
  error,
}: CarFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center justify-center gap-5 w-full z-10 max-w-lg bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-10 animate-fade-in-scale relative overflow-hidden"
    >
      {/* Decorative gradient circle */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col items-center gap-2 z-10">
        <h1 className="block text-2xl uppercase text-white tracking-widest font-extrabold drop-shadow">
          Edit Car Details
        </h1>
        <p className="block text-xs uppercase text-zinc-400 tracking-widest font-medium">
          Update your car information below
        </p>
      </div>
      <div></div>
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
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
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
  );
}
