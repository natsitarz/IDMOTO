"use client";

import CarFormHistory from "@/app/car/edit/parts/CarFormHistory";
import CarFormMain from "@/app/car/edit/parts/CarFormMain";
import CarFormSettings from "@/app/car/edit/parts/CarFormSettings";
import CarFormSpecs from "@/app/car/edit/parts/CarFormSpecs";
import { db } from "@/app/parts/firebase";
import { useAuthUser, useCarData } from "@/app/parts/useCarEditHooks";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

function LoadingMessage() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 font-[family-name:var(--font-geist-sans)]"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <div className="bg-white/10 border border-blue-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg
          className="w-10 h-10 text-blue-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-lg font-semibold text-blue-400">
          Loading car data...
        </span>
      </div>
    </div>
  );
}

function NotLoggedInMessage() {
  return (
    <div
      className="bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 flex flex-col items-center justify-center"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg
          className="w-10 h-10 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <span className="text-lg font-semibold text-red-400">
          You must be logged in to edit your car details.
        </span>
        <span className="text-sm text-zinc-400 text-center">
          Please log in to continue.
        </span>
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return <div className="p-8 text-red-500">{error}</div>;
}

function NoEditPermissionMessage() {
  return (
    <div
      className="bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 flex flex-col items-center justify-center"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg
          className="w-10 h-10 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <span className="text-lg font-semibold text-red-400">
          You do not have permission to edit this car.
        </span>
        <span className="text-sm text-zinc-400 text-center">
          Please check if you are logged in with the correct account or if the
          car belongs to you.
        </span>
      </div>
    </div>
  );
}

const MENU = [
  { key: "main", label: "Car Details" },
  { key: "specs", label: "More Specs" },
  { key: "history", label: "History" },
  { key: "settings", label: "Settings" },
];

export default function CarEditPage() {
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const carId = searchParams?.get("id") || "";

  const user = useAuthUser();
  const { car, loading, error, form, setForm, setError } = useCarData(
    user,
    carId
  );

  // If you need visibility, setVisibility, and deleteCar, you must implement and return them from useCarData.
  // For now, you can manage them locally as shown below:

  const [visibility, setVisibility] = useState<"public" | "private">("private");

  const deleteCar = async () => {
    // Implement car deletion logic here or import from elsewhere
    // For now, just a placeholder
    throw new Error("deleteCar not implemented");
  };

  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState("main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !carId) return;
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "vehicles", carId), {
        manufacturer: form.manufacturer,
        model: form.model,
        year: form.year,
        engine: form.engine,
        horsepower: form.horsepower,
        transmission: form.transmission,
        description: form.description,
        version: form.version,
        mileage: form.mileage,
        color: form.color,
        nm: form.nm,
      });
      window.dispatchEvent(
        new CustomEvent("show-global-success", { detail: "Car info updated!" })
      );
      setError(null);
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update car info.",
        })
      );
    }
    setSaving(false);
  };

  const handleVisibilityChange = async (v: "public" | "private") => {
    setVisibility(v);
    try {
      await updateDoc(doc(db, "vehicles", carId), { visibility: v });
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Visibility updated!",
        })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update visibility.",
        })
      );
    }
  };

  const handleDeleteCar = async () => {
    try {
      await deleteCar();
      window.dispatchEvent(
        new CustomEvent("show-global-success", { detail: "Car deleted!" })
      );
      // Optionally redirect user after deletion
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to delete car.",
        })
      );
    }
  };

  if (loading) return <LoadingMessage />;
  if (!user) return <NotLoggedInMessage />;
  if (error && !car) return <ErrorMessage error={error} />;
  // Sprawdzenie uprawnień: tylko właściciel może edytować
  if (car.userID !== user.uid) {
    return <NoEditPermissionMessage />;
  }
  if (!form) return <LoadingMessage />;

  return (
    <div className="min-h-[calc(100dvh-67px)] flex items-center justify-center bg-zinc-900 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-0 flex flex-col md:flex-row items-stretch gap-0 animate-fade-in-scale relative overflow-hidden min-h-[860px]">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none z-0" />
        {/* Mobile menu */}
        <div className="md:hidden w-full border-b border-zinc-800/60 bg-zinc-900/80 z-30 relative">
          <button
            className="cursor-pointer w-full flex items-center justify-between px-4 py-3 text-white font-semibold text-base focus:outline-none"
            onClick={() => setMobileMenuOpen((v) => !v)}
            type="button"
          >
            {MENU.find((m) => m.key === selected)?.label}
            <svg
              className={`ml-2 w-5 h-5 transition-transform ${
                mobileMenuOpen ? "rotate-180" : ""
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
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center"
              style={{ pointerEvents: "auto" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40"
                aria-hidden="true"
              />
              {/* Dropdown */}
              <div
                className="relative w-full mx-auto bg-zinc-900/95 border border-zinc-800/60 shadow-xl flex flex-col overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {MENU.map((item) => (
                  <button
                    key={item.key}
                    className={`w-full text-left px-4 py-3 font-semibold transition cursor-pointer
              ${
                selected === item.key
                  ? "bg-blue-600/80 text-white"
                  : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
              }`}
                    onClick={() => {
                      setSelected(item.key);
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Sidebar/Menu */}
        <aside className="hidden md:flex flex-col gap-2 bg-zinc-900/80 border-r border-zinc-800/60 min-w-[160px] max-w-[180px] py-10 px-4 z-10">
          <h2 className="text-xs uppercase text-zinc-400 font-bold mb-2 tracking-widest pl-1">
            Car Menu
          </h2>
          {MENU.map((item) => (
            <button
              key={item.key}
              className={`cursor-pointer w-full text-left px-3 py-2 rounded-lg font-semibold transition-all text-sm
        ${
          selected === item.key
            ? "bg-blue-600/80 text-white shadow"
            : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
        }`}
              style={{ minWidth: 0 }} // Zapobiega rozszerzaniu przez długi tekst
              onClick={() => setSelected(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10">
          {selected === "main" && (
            <CarFormMain
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              saving={saving}
              error={error}
            />
          )}
          {selected === "history" && <CarFormHistory />}
          {selected === "specs" && (
            <CarFormSpecs
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              saving={saving}
              error={error}
              carId={carId}
              userId={user?.uid}
            />
          )}
          {selected === "settings" && (
            <CarFormSettings
              carId={carId}
              visibility={visibility}
              onVisibilityChange={handleVisibilityChange}
              onDeleteCar={handleDeleteCar}
            />
          )}
        </main>
      </div>
    </div>
  );
}
