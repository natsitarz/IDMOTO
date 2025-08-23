"use client";

import CarLogs from "@/app/car/parts/CarLog";
import CarSpecs from "@/app/car/parts/CarSpecs";
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
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiEdit3 } from "react-icons/fi";

// Enhanced Loading Components
function HeroSkeleton() {
  return (
    <div className="relative w-full h-96 max-h-[420px] flex items-end justify-start overflow-hidden rounded-b-3xl shadow-xl mb-4 bg-white/5 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50" />

      {/* Action button skeleton */}
      <div className="absolute top-4 right-6 z-10">
        <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="relative p-8 w-full z-10">
        <div className="space-y-3 mb-4">
          <div className="h-8 bg-white/20 rounded w-64 animate-pulse" />
          <div className="h-4 bg-white/15 rounded w-48 animate-pulse" />
        </div>

        {/* Description skeleton */}
        <div className="mt-4 w-full max-w-lg flex items-center gap-3 bg-gradient-to-r from-gray-900/30 via-blue-800/10 to-zinc-900/30 border-l-4 border-gray-500/70 rounded-2xl px-3 sm:px-6 py-3 shadow-xl backdrop-blur-md">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/20 rounded w-20 animate-pulse" />
            <div className="h-4 bg-white/15 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6 animate-pulse ${className}`}
    >
      {children || (
        <div className="space-y-4">
          <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-white/10 rounded w-24 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-white/10 rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function SpecsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />

      {/* Spec categories */}
      {[...Array(3)].map((_, categoryIndex) => (
        <div key={categoryIndex} className="space-y-4">
          <div className="h-5 bg-white/15 rounded w-28 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, specIndex) => (
              <div
                key={specIndex}
                className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/10 animate-pulse"
                style={{
                  animationDelay: `${(categoryIndex * 6 + specIndex) * 50}ms`,
                }}
              >
                <div className="h-3 bg-white/20 rounded w-16 animate-pulse" />
                <div className="h-4 bg-white/15 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LogsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-white/10 rounded w-24 animate-pulse" />
        <div className="w-24 h-8 bg-white/10 rounded-xl animate-pulse" />
      </div>

      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-white/15 rounded w-32 animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-16 animate-pulse" />
            </div>
            <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-white/10 rounded-full w-12 animate-pulse" />
              <div className="h-6 bg-white/10 rounded-full w-16 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComprehensiveCarLoading() {
  return (
    <div className="relative min-h-[calc(100dvh-67px)] bg-zinc-900 flex flex-col items-center font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section Skeleton */}
      <HeroSkeleton />

      {/* Content Grid Skeleton */}
      <div className="w-full px-4 grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Car Info Skeleton */}
        <CardSkeleton className="animate-fade-in-up" />

        {/* Gallery Skeleton */}
        <CardSkeleton className="animate-fade-in-up">
          <GallerySkeleton />
        </CardSkeleton>

        {/* Specs Skeleton */}
        <CardSkeleton className="animate-fade-in-up col-span-1 md:col-span-2">
          <SpecsSkeleton />
        </CardSkeleton>

        {/* Logs Skeleton */}
        <CardSkeleton className="animate-fade-in-up col-span-1 md:col-span-2 mb-4">
          <LogsSkeleton />
        </CardSkeleton>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-6 right-6 bg-zinc-800/90 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl animate-fade-in z-[50]">
        <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        <span className="text-white text-sm font-medium">
          Loading vehicle...
        </span>
      </div>
    </div>
  );
}

function RetryErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-67px)] bg-zinc-900 px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">
          Unable to Load Vehicle
        </h3>
        <p className="text-zinc-400 mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onRetry}
          className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
}

function PrivateCarMessage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-67px)] bg-zinc-900 px-4">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
          <svg
            className="w-10 h-10 text-amber-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Private Vehicle</h3>
        <p className="text-zinc-400 leading-relaxed">
          This vehicle is set to private and can only be viewed by its owner.
        </p>
      </div>
    </div>
  );
}

// Background Alignment Modal Component
function BackgroundAlignmentModal({
  isOpen,
  onClose,
  onSave,
  carName,
  imageUrl,
  bgAlignX,
  setBgAlignX,
  savingAlign,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  carName: string;
  imageUrl: string;
  bgAlignX: number;
  setBgAlignX: (value: number) => void;
  savingAlign: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Fullscreen blurred backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[999990]"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-[999991] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FiEdit3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Align Background Photo
                </h2>
                <p className="text-sm text-zinc-400">{carName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer w-10 h-10 rounded-full bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
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
            </button>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Car hero preview - exact same dimensions as actual hero */}
            <div className="flex justify-center mb-8">
              <div
                className="relative w-full h-96 max-h-[420px] rounded-b-3xl overflow-hidden shadow-xl flex items-end cursor-grab active:cursor-grabbing border border-zinc-700 group select-none"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: `center ${bgAlignX}%`,
                }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const startY = e.clientY;
                  const startAlign = bgAlignX;
                  let dragging = true;

                  const onMouseMove = (moveEvent: MouseEvent) => {
                    if (!dragging) return;
                    const deltaY = moveEvent.clientY - startY;
                    const percentDelta = (deltaY / rect.height) * 100;
                    const newAlign = Math.max(
                      0,
                      Math.min(100, startAlign + percentDelta)
                    );
                    setBgAlignX(newAlign);
                  };

                  const onMouseUp = () => {
                    dragging = false;
                    window.removeEventListener("mousemove", onMouseMove);
                    window.removeEventListener("mouseup", onMouseUp);
                  };

                  window.addEventListener("mousemove", onMouseMove);
                  window.addEventListener("mouseup", onMouseUp);
                }}
              >
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none transition-all duration-300" />

                {/* Car information preview */}
                <div className="relative z-10 w-full px-8 pb-8 pt-8 flex flex-col select-none">
                  <h3 className="text-3xl font-black text-white drop-shadow-lg mb-0.5">
                    {carName.split(" ")[0] || "Unknown"}
                  </h3>
                  <div className="text-zinc-200 text-xl font-semibold drop-shadow">
                    {carName.split(" ")[1] || "Model"}
                  </div>
                  <div className="text-zinc-400 text-sm mt-1.5 drop-shadow">
                    Drag up/down to adjust background position
                  </div>
                </div>

                {/* Alignment indicator */}
                <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-white font-medium border border-white/20 select-none">
                  {Math.round(bgAlignX)}%
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center mb-6">
              <p className="text-zinc-300 text-sm">
                <strong>Drag the preview above vertically</strong> or use the
                slider below to adjust the vertical position
              </p>
            </div>

            {/* Slider control */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Vertical Position
                </label>
                <span className="text-blue-400 font-medium text-sm">
                  {Math.round(bgAlignX)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={bgAlignX}
                onChange={(e) => setBgAlignX(Number(e.target.value))}
                style={{ "--value": `${bgAlignX}%` } as React.CSSProperties}
                className="w-full h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>Top</span>
                <span>Center</span>
                <span>Bottom</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                className="cursor-pointer flex-1 px-6 py-3 rounded-2xl bg-zinc-700 text-white hover:bg-zinc-600 font-medium transition-all disabled:opacity-50"
                onClick={onClose}
                disabled={savingAlign}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer flex-1 px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={savingAlign}
                onClick={onSave}
              >
                {savingAlign && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {savingAlign ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

export default function CarPageInner() {
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const carId = searchParams.get("id");
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [descValue, setDescValue] = useState("");
  const [retrying, setRetrying] = useState(false);

  // Background alignment modal state
  const [showAlignModal, setShowAlignModal] = useState(false);
  const [bgAlignX, setBgAlignX] = useState<number>(50);
  const [originalBgAlignX, setOriginalBgAlignX] = useState<number>(50);
  const [savingAlign, setSavingAlign] = useState(false);

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
      } else {
        setError("Vehicle not found. Please check the ID and try again.");
      }
    } catch (firebaseError: any) {
      // Check if the error is due to missing permissions (private vehicle)
      if (
        firebaseError?.code === "permission-denied" ||
        firebaseError?.message?.includes("Missing or insufficient permissions")
      ) {
        // Set a special car object to trigger the privacy check
        setCar({ visibility: "private", userID: "unknown" });
        setError(null); // Clear any existing error
        setLoading(false); // Important: stop loading state
        return;
      }
      setError(
        "Failed to load vehicle data. Please check your connection and try again."
      );
    }
    setLoading(false);
  };

  const handleRetry = async () => {
    if (!carId) return;
    setRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Show loading for better UX
    await fetchCar(carId);
    setRetrying(false);
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
    window.dispatchEvent(
      new CustomEvent("show-global-success", {
        detail: "Photo uploaded successfully!",
      })
    );
    await fetchCar(carId);
  };

  const handleUpload = async (file: File) => {
    await handlePhotoUpload(file, uploadPhoto);
  };

  const handleUploadGallery = async (file: File) => {
    await handlePhotoUpload(file, letsAddPhoto);
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
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to remove photo.",
        })
      );
    }
  };

  // Handle alignment save
  const handleSaveAlignment = useCallback(async () => {
    if (!carId) return;
    setSavingAlign(true);
    try {
      await updateDoc(doc(db, "vehicles", carId), { bgAlignX });
      setShowAlignModal(false);
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Background alignment saved successfully!",
        })
      );
      // Update the car state with new alignment
      setCar((prev: any) => ({ ...prev, bgAlignX }));
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to save alignment. Please try again.",
        })
      );
    } finally {
      setSavingAlign(false);
    }
  }, [carId, bgAlignX]);

  // Cancel function to revert alignment changes
  const handleCancelAlignment = () => {
    setBgAlignX(originalBgAlignX);
    setShowAlignModal(false);
  };

  // Open alignment modal
  const openAlignmentModal = () => {
    const currentAlign = car?.bgAlignX ?? 50;
    setBgAlignX(currentAlign);
    setOriginalBgAlignX(currentAlign);
    setShowAlignModal(true);
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

  // Timeout loading after 8 seconds
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(
          "Loading timed out. Please check your connection and try again."
        );
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [loading]);

  // Don't render until mounted to prevent hydration issues
  if (!hasMounted) return null;

  // Show comprehensive loading state
  if (loading || retrying) return <ComprehensiveCarLoading />;

  // Show error with retry option
  if (error) return <RetryErrorState message={error} onRetry={handleRetry} />;

  if (!car) {
    return (
      <RetryErrorState message="No vehicle data found." onRetry={handleRetry} />
    );
  }

  // Check privacy permissions - private cars can only be viewed by their owners
  if (car.visibility === "private") {
    // If not logged in or not the owner, show private message
    if (!user || user.uid !== car.userID) {
      return <PrivateCarMessage />;
    }
  }

  // If car has userID 'unknown', it means we got a permission error from Firestore
  // This happens when trying to access a private vehicle without proper permissions
  if (car.userID === "unknown") {
    return <PrivateCarMessage />;
  }

  return (
    <div className="relative min-h-[calc(100dvh-67px)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 bg-fixed flex flex-col items-center font-[family-name:var(--font-geist-sans)] px-4">
      {/* Hero Section */}
      <div
        className="animate-fade-in-opacity relative w-full h-96 max-h-[420px] flex items-end justify-start overflow-hidden rounded-b-3xl shadow-xl mb-4"
        style={{
          backgroundImage: `url(${car.image})`,
          backgroundSize: "cover",
          backgroundPosition: `center ${car.bgAlignX ?? 50}%`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />

        {/* Edit button in top-right with standard z-index */}
        <div className="absolute top-4 right-6 z-[40]">
          <CarActions
            car={car}
            user={user}
            handleUpload={handleUpload}
            onOpenAlignModal={openAlignmentModal}
          />
        </div>

        <div className="relative p-8 z-10">
          <h1 className="text-3xl font-black text-white drop-shadow">
            {car.manufacturer} <span className="font-black">{car.model}</span>
          </h1>
          <p className="block text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">
            {car.year} • {car.engine} • {car.horsepower + "HP"}
          </p>
          {/* Description display */}
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
        <div className="flex flex-col justify-around rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6 z-[10]">
          <CarInfo car={car} />
          <CarMeta car={car} user={user} />
        </div>
        <div className="animate-fade-in-up rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6 z-[10]">
          <CarGallery
            car={car}
            user={user}
            carId={carId}
            handleUploadGallery={handleUploadGallery}
            handleRemovePhoto={handleRemovePhoto}
          />
        </div>
        {/* CarSpecs spans two columns on desktop */}
        <div className="animate-fade-in-up rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6 col-span-1 md:col-span-2 z-[10]">
          <CarSpecs car={car} />
        </div>
        <div className="animate-fade-in-up rounded-2xl bg-zinc-900/80 shadow-2xl border border-white/20 backdrop-blur-md p-6 col-span-1 md:col-span-2 mb-4 z-[10]">
          {carId && (
            <CarLogs carId={carId} isOwner={user?.uid === car.userID} />
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer
        className="mt-8 mb-8 sm:mt-8 sm:mb-8 pt-6 sm:pt-8 border-t border-white/10 text-center animate-fade-in"
        style={{ animationDelay: "600ms" }}
      >
        <p className="text-zinc-500 text-sm">
          © 2025 IDMOTO • Building the future of automotive social networking
        </p>
      </footer>

      {/* Background Alignment Modal */}
      <BackgroundAlignmentModal
        isOpen={showAlignModal}
        onClose={handleCancelAlignment}
        onSave={handleSaveAlignment}
        carName={`${car.manufacturer || "Unknown"} ${car.model || "Model"}`}
        imageUrl={car.image || "/background-car-placeholder.png"}
        bgAlignX={bgAlignX}
        setBgAlignX={setBgAlignX}
        savingAlign={savingAlign}
      />

      {/* Enhanced Global Styles */}
      <style jsx global>{`
        @keyframes fade-in-opacity {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-opacity {
          animation: fade-in-opacity 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        /* Custom slider styles */
        .slider {
          background: linear-gradient(
            to right,
            #3b82f6 0%,
            #3b82f6 var(--value, 50%),
            #374151 var(--value, 50%),
            #374151 100%
          );
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4),
            0 6px 16px rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4),
            0 6px 16px rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }

        /* Custom scrollbar styles for gallery */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #52525b #27272a;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #27272a;
          border-radius: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #52525b;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }
      `}</style>
    </div>
  );
}
