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
import CarError from "./CarError";
import CarLoading from "./CarLoading";

export default function CarPageInner() {
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
        try {
          const url = await getDownloadURL(
            storageRef(storage, `vehicles/${carId}/backgroundPic`)
          );
          carData.image = url;
        } catch (e) {
          carData.image = "/background-car-placeholder.png";
        }
        carData.gallery = await fetchGallery(carId);
        setCar(carData);
        document.title = `IDMOTO | ${carData.manufacturer} ${carData.model}`;
      } else {
        setError("Couldn't find car. Check ID");
      }
    } catch (err) {
      setError("Couldn't find car. Check ID");
    }
    setLoading(false);
  };

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
    window.dispatchEvent(
      new CustomEvent("show-global-success", {
        detail: "Description updated successfully!",
      })
    );
    setSavingDesc(false);
  };

  const handleRemovePhoto = async (url: string) => {
    try {
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

  // --- Timeout loading after 5 seconds ---
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("Couldn't find car. Check ID");
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  if (!hasMounted) return null;

  if (loading) return <CarLoading />;
  if (error) return <CarError message={error} />;

  if (!car) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-67px)]">
        No car data found.
      </div>
    );
  }

  if (
    !user ||
    (user && user.uid !== car.userID && car.visibility === "private")
  ) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-67px)]">
        This car is private. You can't view it.
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-67px)] bg-zinc-900 flex flex-col items-center font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section */}
      <div className="animate-fade-in-opacity relative w-full h-96 max-h-[420px] flex items-end justify-start overflow-hidden rounded-b-3xl shadow-xl mb-4">
        <Image
          src={car.image}
          alt={`${car.manufacturer} ${car.model}`}
          className="absolute inset-0 w-full h-full object-cover blur-none"
          width={1920}
          height={420}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
        {/* Edit button in top-right */}
        <div className="absolute top-4 right-6">
          <CarActions car={car} user={user} handleUpload={handleUpload} />
        </div>
        <div className="relative p-8">
          <h1 className="text-3xl font-black text-white drop-shadow">
            {car.manufacturer} <span className="font-black">{car.model}</span>
          </h1>
          <p className="block text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">
            {car.year} • {car.engine} • {car.horsepower + "HP"}
          </p>
          {/* Tylko wyświetlanie opisu */}
          {car.description && (
            <div className="mt-4 w-full max-w-lg flex items-center gap-3 bg-gradient-to-r from-gray-900/30 via-blue-800/10 to-zinc-900/30 border-l-4 border-gray-500/70 rounded-2xl px-3 sm:px-6 py-3 shadow-xl backdrop-blur-md min-w-0">
              <div className="flex-1 min-w-0">
                <div className="uppercase text-xs text-zinc-400 font-semibold tracking-widest leading-tight mb-0.5">
                  Description
                </div>
                <span className="block text-zinc-100 text-base font-medium tracking-tight leading-snug truncate">
                  {car.description}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="animate-fade-in-up w-full px-4 grid gap-8 grid-cols-1 md:grid-cols-2">
        <div className="rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6">
          <CarInfo car={car} />
          <CarMeta car={car} user={user} />
        </div>
        <div className="animate-fade-in-up rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6">
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
