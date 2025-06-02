import React from "react";

type CarFormProps = {
  form: {
    manufacturer: string;
    model: string;
    year: string;
    engine: string;
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
      className="space-y-6 bg-white/10 dark:bg-zinc-900/80 p-8 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md"
    >
      <div className="flex flex-col items-center mb-4">
        <h1 className="block text-xl uppercase text-zinc-100 tracking-widest font-bold">
          Edit Car Details
        </h1>
        <p className="block text-xs uppercase text-zinc-400 tracking-widest">
          Update your car information below
        </p>
      </div>
      <div>
        <label className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
          Manufacturer
        </label>
        <input
          name="manufacturer"
          value={form.manufacturer}
          onChange={handleChange}
          className="w-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          required
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
          Model
        </label>
        <input
          name="model"
          value={form.model}
          onChange={handleChange}
          className="w-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          required
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
          Year
        </label>
        <input
          name="year"
          value={form.year}
          onChange={handleChange}
          className="w-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          required
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
          Engine
        </label>
        <input
          name="engine"
          value={form.engine}
          onChange={handleChange}
          className="w-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
          Transmission
        </label>
        <input
          name="transmission"
          value={form.transmission}
          onChange={handleChange}
          className="w-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-xs uppercase block text-zinc-100 font-bold tracking-widest mb-1 shadow transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
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
