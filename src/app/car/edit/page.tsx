"use client";

import CarFormHistory from "@/app/car/edit/parts/CarFormHistory";
import CarFormMain from "@/app/car/edit/parts/CarFormMain";
import CarFormSettings from "@/app/car/edit/parts/CarFormSettings";
import CarFormSpecs from "@/app/car/edit/parts/CarFormSpecs";
import { useAuth } from "@/app/parts/AuthProvider";
import { db } from "@/app/parts/firebase";
import { useCarData } from "@/app/parts/useCarEditHooks";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const carId = searchParams?.get("id") || "";

  const {
    car,
    loading: carLoading,
    error,
    form,
    setForm,
    setError,
  } = useCarData(user, carId);

  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState("main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const deleteCar = async () => {
    if (!carId) throw new Error("Car ID is required to delete a car.");
    await deleteDoc(doc(db, "vehicles", carId));
  };

  // Handle menu selection with smooth transition
  const handleMenuSelect = (key: string) => {
    if (key === selected) return;

    setIsTransitioning(true);

    // Small delay to show transition effect
    setTimeout(() => {
      setSelected(key);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Show loading while auth is being checked or car data is loading
  if (loading || carLoading || !form) {
    return (
      <div className="min-h-[calc(100dvh-67px)] flex items-center justify-center bg-zinc-900 font-[family-name:var(--font-geist-sans)]">
        <div className="w-full max-w-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-0 flex flex-col md:flex-row items-stretch gap-0 animate-fade-in-scale relative overflow-hidden min-h-[860px]">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none z-0" />

          {/* Sidebar skeleton */}
          <aside className="hidden md:flex flex-col gap-2 bg-zinc-900/80 border-r border-zinc-800/60 min-w-[160px] max-w-[180px] py-10 px-4 z-10">
            <div
              className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse mb-2"
              style={{ animationDelay: "0ms" }}
            />
            <div className="space-y-2">
              <div
                className="h-8 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-lg animate-pulse"
                style={{ animationDelay: "100ms" }}
              />
              <div
                className="h-8 w-full bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-8 w-full bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse"
                style={{ animationDelay: "200ms" }}
              />
              <div
                className="h-8 w-full bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse"
                style={{ animationDelay: "250ms" }}
              />
            </div>
          </aside>

          {/* Mobile menu skeleton */}
          <div className="md:hidden w-full border-b border-zinc-800/60 bg-zinc-900/80 z-30 relative">
            <div
              className="h-12 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
          </div>

          {/* Main content skeleton */}
          <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10">
            <div className="w-full max-w-lg space-y-6">
              {/* Title skeleton */}
              <div className="text-center space-y-2">
                <div
                  className="h-8 w-48 bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-lg animate-pulse mx-auto"
                  style={{ animationDelay: "300ms" }}
                />
                <div
                  className="h-4 w-64 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse mx-auto"
                  style={{ animationDelay: "350ms" }}
                />
              </div>

              {/* Form fields skeleton */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div
                      className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
                      style={{ animationDelay: "400ms" }}
                    />
                    <div
                      className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
                      style={{ animationDelay: "450ms" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-4 w-16 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
                      style={{ animationDelay: "500ms" }}
                    />
                    <div
                      className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
                      style={{ animationDelay: "550ms" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-4 w-12 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
                    style={{ animationDelay: "600ms" }}
                  />
                  <div
                    className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
                    style={{ animationDelay: "650ms" }}
                  />
                </div>
                <div className="space-y-2">
                  <div
                    className="h-4 w-16 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
                    style={{ animationDelay: "700ms" }}
                  />
                  <div
                    className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
                    style={{ animationDelay: "750ms" }}
                  />
                </div>
                <div className="space-y-2">
                  <div
                    className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
                    style={{ animationDelay: "800ms" }}
                  />
                  <div
                    className="h-24 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
                    style={{ animationDelay: "850ms" }}
                  />
                </div>
                <div
                  className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
                  style={{ animationDelay: "900ms" }}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (error && !car) return <ErrorMessage error={error} />;
  // Sprawdzenie uprawnień: tylko właściciel może edytować
  if (car && car.userID !== user.uid) {
    return <NoEditPermissionMessage />;
  }

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
                      handleMenuSelect(item.key);
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
              onClick={() => handleMenuSelect(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 relative">
          {isTransitioning ? (
            // Transition loading state that matches the content structure
            <div className="w-full max-w-lg space-y-6 animate-fade-in-scale">
              {/* Title skeleton */}
              <div className="text-center space-y-2">
                <div className="h-8 w-48 bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-lg animate-pulse mx-auto" />
                <div className="h-4 w-64 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse mx-auto" />
              </div>

              {/* Content skeleton - adaptive to menu type */}
              {selected === "main" || selected === "specs" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                      <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                      <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                    <div className="h-24 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                </div>
              ) : selected === "settings" ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-10 w-20 bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-lg animate-pulse" />
                      <div className="h-10 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse" />
                    </div>
                  </div>
                  <div className="h-12 w-full bg-gradient-to-r from-red-800/40 via-red-700/60 to-red-800/40 rounded-xl animate-pulse" />
                </div>
              ) : (
                // History placeholder
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full animate-fade-in-scale">
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
