"use client";

import CarActions from "@/app/parts/CarActions";
import CarGallery from "@/app/parts/CarGallery";
import CarInfo from "@/app/parts/CarInfo";
import CarMeta from "@/app/parts/CarMeta";
import { auth, db, storage } from "@/app/parts/firebase";
import {
  letsAddPhoto,
  uploadPhoto,
} from "@/app/parts/firebase-customize-vehicle";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref as storageRef,
} from "firebase/storage";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function CarPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const carId = searchParams.get("id");
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  async function fetchGallery(carId: string): Promise<string[]> {
    const folderRef = storageRef(storage, `vehicles/${carId}/`);
    const listResult = await listAll(folderRef);
    // Only include files that start with a timestamp and a dash (e.g. 1717091234567-uuid.jpg)
    const galleryItems = listResult.items.filter((item) =>
      /^\d+-.*\.\w+$/.test(item.name)
    );
    const urls = await Promise.all(
      galleryItems.map((item) => getDownloadURL(item))
    );
    return urls;
  }

  const fetchCar = async (carId: string) => {
    setLoading(true);
    setError(null);
    try {
      const carRef = doc(db, "vehicles", carId);
      const carSnap = await getDoc(carRef);
      if (carSnap.exists()) {
        const carData: any = { id: carSnap.id, ...carSnap.data() };
        // Try to fetch backgroundPic from storage
        try {
          const url = await getDownloadURL(
            storageRef(storage, `vehicles/${carId}/backgroundPic`)
          );
          carData.image = url;
        } catch (e) {
          carData.image = "/logo.png";
        }
        // Fetch gallery images
        carData.gallery = await fetchGallery(carId);
        setCar(carData);
        document.title = `IDMOTO | ${carData.manufacturer} ${carData.model}`;
      } else {
        window.dispatchEvent(
          new CustomEvent("show-global-error", {
            detail: "Car not found.",
          })
        );
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to fetch car.",
        })
      );
    }
    setLoading(false);
  };

  // Generalized upload handler to avoid code duplication
  const handlePhotoUpload = async (
    file: File,
    uploadFn: (file: File, user: User, carId: string) => Promise<any>
  ) => {
    if (!user) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "You must be logged in!",
        })
      );
      return;
    }
    if (!carId) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "There is no carID!.",
        })
      );
      return;
    }
    await uploadFn(file, user, carId);
    await fetchCar(carId);
  };

  const handleUpload = async (file: File) => {
    await handlePhotoUpload(file, uploadPhoto);
  };

  const handleUploadGallery = async (file: File) => {
    await handlePhotoUpload(file, letsAddPhoto);
  };

  const handleSaveDescription = async () => {
    if (descValue.length > 20) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Description should be no longer than 20 characters.",
        })
      );
      return;
    }
    setSavingDesc(true);
    try {
      await updateDoc(doc(db, "vehicles", car.id), { description: descValue });
      setCar({ ...car, description: descValue });
      setEditingDesc(false);
    } catch (e) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update description.",
        })
      );
    }
    setSavingDesc(false);
  };

  const handleRemovePhoto = async (url: string) => {
    try {
      // Parse the path from the URL
      const u = new URL(url);
      const pathEncoded = u.pathname.split("/o/")[1];
      if (!pathEncoded) throw new Error("Invalid photo URL");
      const path = decodeURIComponent(pathEncoded);

      const photoRef = storageRef(storage, path);
      await deleteObject(photoRef);

      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Photo removed successfully!",
        })
      );

      // Fetch updated gallery and update car state
      if (carId) {
        const updatedGallery = await fetchGallery(carId);
        setCar((prev: any) => ({ ...prev, gallery: updatedGallery }));
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to remove photo.",
        })
      );
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    if (carId) {
      fetchCar(carId);
    }
  }, [user, carId, hasMounted]);

  useEffect(() => {
    if (car && typeof car.description === "string") {
      setDescValue(car.description);
    }
  }, [car]);

  if (!hasMounted) return null;

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800"
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

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!car) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-67px)]">
        No car data found.
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-67px)] bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 flex flex-col items-center">
      {/* Hero Section */}
      <div className="animate-fade-in-opacity relative w-full h-96 max-h-[420px] flex items-end justify-start overflow-hidden rounded-b-3xl shadow-xl mb-8">
        <Image
          src={car.image}
          alt={`${car.manufacturer} ${car.model}`}
          className="absolute inset-0 w-full h-full object-cover blur-none"
          width={1920}
          height={420}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
        {/* Edit button in top-right */}
        <div className="absolute top-4 right-6 z-20">
          <CarActions car={car} user={user} handleUpload={handleUpload} />
        </div>
        <div className="relative z-10 p-8">
          <h1 className="text-3xl font-black text-white drop-shadow">
            {car.manufacturer} <span className="font-black">{car.model}</span>
          </h1>
          <p className="block text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">
            {car.year} • {car.engine}
          </p>
          {editingDesc ? (
            <div className="mt-4 w-full max-w-lg flex flex-col gap-2 bg-gradient-to-r from-gray-900/30 via-blue-800/10 to-zinc-900/30 border-l-4 border-gray-500/70 rounded-2xl px-3 sm:px-6 py-3 shadow-xl backdrop-blur-md min-w-0 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                {/* Input */}
                <input
                  type="text"
                  className="flex-1 min-w-0 h-11 rounded-xl px-4 py-2 bg-zinc-900/80 text-white border-2 border-blue-500/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40 placeholder:text-zinc-400 font-medium text-base shadow-inner transition"
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  disabled={savingDesc}
                  maxLength={120}
                  placeholder="Add a short description…"
                  autoFocus
                />
                {/* Buttons */}
                <div className="flex sm:flex-row flex-col gap-2 mt-2 sm:mt-0 sm:ml-2">
                  <button
                    className="cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                    onClick={handleSaveDescription}
                    disabled={savingDesc}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {savingDesc ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold bg-zinc-800/90 text-zinc-200 px-4 py-2 rounded-xl shadow-md hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-60"
                    onClick={() => {
                      setEditingDesc(false);
                      setDescValue(car.description || "");
                    }}
                    disabled={savingDesc}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {car.description && (
                <div className="mt-4 w-full max-w-lg flex items-center gap-3 bg-gradient-to-r from-gray-900/30 via-blue-800/10 to-zinc-900/30 border-l-4 border-gray-500/70 rounded-2xl px-3 sm:px-6 py-3 shadow-xl backdrop-blur-md min-w-0 transition-all duration-300">
                  <div className="flex-1 min-w-0">
                    <div className="uppercase text-xs text-zinc-400 font-semibold tracking-widest leading-tight mb-0.5">
                      Description
                    </div>
                    <span className="block text-zinc-100 text-base font-medium tracking-tight leading-snug truncate">
                      {car.description}
                    </span>
                  </div>
                  {user?.uid === car.userID && (
                    <button
                      className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-white px-4 py-2 rounded-xl transition"
                      onClick={() => setEditingDesc(true)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z"
                        />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
              )}
              {!car.description && user?.uid === car.userID && (
                <button
                  className="cursor-pointer mt-2 flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-white hover:bg-blue-500/70 px-4 py-2 rounded-xl transition shadow"
                  onClick={() => setEditingDesc(true)}
                >
                  <svg
                    className="w-5 h-5 text-blue-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 8h10M7 12h4m1 8H6a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                    />
                  </svg>
                  Add description
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="animate-fade-in-scale w-full px-4 grid gap-8 grid-cols-1 md:grid-cols-2">
        <div className="rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6">
          <CarInfo car={car} />
          <CarMeta car={car} user={user} />
        </div>
        <div className="animate-fade-in-scale rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6">
          <CarGallery
            car={car}
            user={user}
            carId={carId}
            handleUploadGallery={handleUploadGallery}
            handleRemovePhoto={handleRemovePhoto}
          />
        </div>
      </div>
    </div>
  );
}
