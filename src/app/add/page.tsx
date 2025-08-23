"use client";

import { auth, db } from "@/app/parts/firebase";
import { firebaseAddVehiclePublic } from "@/app/parts/firebase-add-vehicle";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export default function Profile() {
  const [hasCar, setHasCar] = useState<boolean | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);

      if (currentUser) {
        document.getElementById("addCar")?.style.setProperty("display", "grid");
        document
          .getElementById("watermark")
          ?.style.setProperty("display", "flex");
        document.getElementById("navbar")?.style.setProperty("display", "flex");

        // Check if user already has a car
        const checkUserCars = async () => {
          const q = query(
            collection(db, "vehicles"),
            where("userID", "==", currentUser.uid)
          );
          const snapshot = await getDocs(q);
          setHasCar(!snapshot.empty);
        };
        checkUserCars();
      } else {
        router.push("/");
        window.dispatchEvent(
          new CustomEvent("show-global-error", {
            detail: "Log in to add a vehicle.",
          })
        );
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Wrap the submit handler to include visibility
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("visibility", visibility);
    await firebaseAddVehiclePublic(formData, router); // <-- passing FormData and router
  };

  if (loading) {
    return <AddCarSkeleton />;
  }

  return (
    <div
      id="addCar"
      className="min-h-[calc(100dvh-67px)] flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 bg-fixed font-[family-name:var(--font-geist-sans)]"
    >
      <div className="w-full max-w-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-10 flex flex-col justify-center items-center gap-10 animate-fade-in-scale relative overflow-hidden min-h-[calc(100dvh-67px)]">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="cursor-pointer absolute top-4 right-4 z-20 p-2 text-zinc-300 hover:text-white transition-all duration-200 group"
          aria-label="Go back"
        >
          <svg
            className="w-5 h-5 transform group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* Decorative gradient circle */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none z-0" />
        <div className="flex flex-col items-center gap-2 z-10">
          <h1 className="block text-2xl uppercase text-white tracking-widest font-extrabold drop-shadow">
            Add vehicle
          </h1>
          <p className="block text-xs uppercase text-zinc-400 tracking-widest font-medium">
            {hasCar === null
              ? ""
              : hasCar
              ? "Add another car to your collection!"
              : "It's time to add your first car!"}
          </p>
        </div>
        <form
          className="flex flex-col items-center justify-center gap-5 w-full z-10"
          method="post"
          onSubmit={handleSubmit}
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
              placeholder="ex. Toyota"
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
              placeholder="ex. Civic Type R"
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
                placeholder="ex. 2004"
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
                placeholder="ex. 1.9 TDI"
                required
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
                placeholder="ex. 192"
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
                placeholder="ex. Manual"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
              />
            </div>
          </div>
          {/* --- Visibility Section --- */}
          <div className="w-full flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="visibility"
            >
              Visibility
            </label>
            <div className="flex gap-4">
              {VISIBILITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition border ${
                    visibility === option.value
                      ? "bg-zinc-600/80 border-zinc-600 text-white"
                      : "bg-zinc-900/80 border-zinc-700 text-zinc-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={() =>
                      setVisibility(option.value as "public" | "private")
                    }
                    className="accent-blue-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
          <button
            className={[
              "cursor-pointer gap-2 px-10 py-2 rounded-xl transition-all duration-200 overflow-hidden flex",
              "hover:bg-white/15 hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
              "bg-white/10 text-white border border-white/20",
            ].join(" ")}
            type="submit"
          >
            Add it!
          </button>
        </form>
      </div>
    </div>
  );
}

// Skeleton loading component for add car page
function AddCarSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-67px)] flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 bg-fixed font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-10 flex flex-col justify-center items-center gap-10 animate-fade-in-scale relative overflow-hidden min-h-[calc(100dvh-67px)]">
        {/* Decorative gradient circle */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header skeleton */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="h-8 bg-white/10 rounded-lg w-48" />
          <div className="h-4 bg-white/10 rounded w-64" />
        </div>

        {/* Form skeleton */}
        <div className="flex flex-col items-center justify-center gap-5 w-full z-10">
          {/* Manufacturer field */}
          <div className="w-full flex flex-col gap-2">
            <div className="h-4 bg-white/10 rounded w-24 ml-1" />
            <div className="h-12 bg-white/10 rounded-xl" />
          </div>

          {/* Model field */}
          <div className="w-full flex flex-col gap-2">
            <div className="h-4 bg-white/10 rounded w-16 ml-1" />
            <div className="h-12 bg-white/10 rounded-xl" />
          </div>

          {/* Year and Engine fields */}
          <div className="w-full flex flex-col gap-2 md:flex-row md:gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-white/10 rounded w-12 ml-1" />
              <div className="h-12 bg-white/10 rounded-xl" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-white/10 rounded w-16 ml-1" />
              <div className="h-12 bg-white/10 rounded-xl" />
            </div>
          </div>

          {/* Horsepower and Transmission fields */}
          <div className="w-full flex flex-col gap-2 md:flex-row md:gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-white/10 rounded w-24 ml-1" />
              <div className="h-12 bg-white/10 rounded-xl" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-white/10 rounded w-28 ml-1" />
              <div className="h-12 bg-white/10 rounded-xl" />
            </div>
          </div>

          {/* Visibility section */}
          <div className="w-full flex flex-col gap-2">
            <div className="h-4 bg-white/10 rounded w-20 ml-1" />
            <div className="flex gap-4">
              <div className="h-10 bg-white/10 rounded-xl w-20" />
              <div className="h-10 bg-white/10 rounded-xl w-20" />
            </div>
          </div>

          {/* Submit button */}
          <div className="w-full h-12 bg-blue-600/20 rounded-xl mt-2" />
        </div>
      </div>
    </div>
  );
}
