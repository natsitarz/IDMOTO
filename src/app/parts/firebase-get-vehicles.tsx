"use client";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiEdit3, FiMoreVertical } from "react-icons/fi";
import { db, storage } from "./firebase";

// Enhanced function: accepts isOwnProfile and filters visibility
export const firebaseGetVehicles = async (
  userId: string,
  isOwnProfile: boolean
) => {
  const vehiclesRef = collection(db, "vehicles");
  let q;
  if (isOwnProfile) {
    q = query(
      vehiclesRef,
      where("userID", "==", userId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(
      vehiclesRef,
      where("userID", "==", userId),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc")
    );
  }
  const vehiclesSnapshot = await getDocs(q);
  const vehiclesList = vehiclesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return vehiclesList;
};

// Enhanced function: accepts isOwnProfile and filters visibility
async function fetchVehiclesForUser(userId: string, isOwnProfile: boolean) {
  const vehiclesRef = collection(db, "vehicles");
  let q;
  if (isOwnProfile) {
    q = query(
      vehiclesRef,
      where("userID", "==", userId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(
      vehiclesRef,
      where("userID", "==", userId),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc")
    );
  }
  const vehiclesSnapshot = await getDocs(q);
  return vehiclesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Enhanced skeleton loader for vehicle cards
function VehicleCardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl h-72 w-54 bg-zinc-900/50 border border-zinc-800 animate-pulse">
      {/* Background skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50" />

      {/* Content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="space-y-2">
          <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
          <div className="h-5 bg-white/10 rounded w-24 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-40 animate-pulse" />
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
    </div>
  );
}

// Enhanced empty state component
function EmptyVehiclesState({ isOwnProfile }: { isOwnProfile: boolean }) {
  const router = useRouter();

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700">
        <svg
          className="w-10 h-10 text-zinc-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 1-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m6.75 4.5v-3a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3m-6 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m6.75 4.5V21a1.5 1.5 0 0 1-1.5 1.5H9a1.5 1.5 0 0 1-1.5-1.5v-2.25A1.5 1.5 0 0 1 9 17.25h1.5m9-6.75V21a1.5 1.5 0 0 1-1.5 1.5H18a1.5 1.5 0 0 1-1.5-1.5v-3.75m4.5-6H22.5m-9 3.75a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3m-6-3h6"
          />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-white mb-3">
        {isOwnProfile ? "No vehicles yet" : "No public vehicles"}
      </h3>

      <p className="text-zinc-400 text-center max-w-md leading-relaxed mb-6">
        {isOwnProfile
          ? "Start building your automotive collection by adding your first vehicle. Show off your ride to the IDMOTO community!"
          : "This user hasn't shared any public vehicles yet. Check back later or explore other profiles!"}
      </p>

      {isOwnProfile && (
        <button
          onClick={() => router.push("/add-car")}
          className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Your First Vehicle
        </button>
      )}
    </div>
  );
}

// Enhanced Alignment Modal Component
function AlignmentModal({
  isOpen,
  onClose,
  onSave,
  vehicleName,
  imageUrl,
  bgAlignX,
  setBgAlignX,
  savingAlign,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  vehicleName: string;
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
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[999998]"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FiEdit3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Align Vehicle Photo
                </h2>
                <p className="text-sm text-zinc-400">{vehicleName}</p>
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
            {/* Vehicle card preview - exact same dimensions as real card */}
            <div className="flex justify-center mb-8">
              <div
                className="relative rounded-2xl overflow-hidden shadow-xl h-72 w-54 flex items-end cursor-grab active:cursor-grabbing border border-zinc-700 group"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: `${bgAlignX}% center`,
                }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const startX = e.clientX;
                  const startAlign = bgAlignX;
                  let dragging = true;

                  const onMouseMove = (moveEvent: MouseEvent) => {
                    if (!dragging) return;
                    const deltaX = moveEvent.clientX - startX;
                    const percentDelta = (deltaX / rect.width) * 100;
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
                {/* Overlay for readability - same as real card */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/30 to-transparent pointer-events-none transition-all duration-300 group-hover:from-zinc-950/60" />

                {/* Glass reflection effect - same as real card */}
                <div className="absolute left-0 top-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Vehicle information - same as real card */}
                <div className="relative z-10 w-full px-5 pb-5 pt-8 flex flex-col">
                  <h3 className="text-white text-2xl font-black drop-shadow-lg mb-0.5 truncate">
                    {vehicleName.split(" ")[0] || "Unknown"}
                  </h3>
                  <div className="text-zinc-200 text-xl font-semibold truncate drop-shadow">
                    {vehicleName.split(" ")[1] || "Model"}
                  </div>
                  <div className="text-zinc-400 text-sm mt-1.5 drop-shadow">
                    Drag to adjust position
                  </div>
                </div>

                {/* Hover border effect - same as real card */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/50 transition-all duration-300" />

                {/* Hover glow effect - same as real card */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl group-hover:shadow-[0_0_40px_0_rgba(59,130,246,0.2)] transition-all duration-300" />

                {/* Alignment indicator */}
                <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white font-medium border border-white/20">
                  {Math.round(bgAlignX)}%
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center mb-6">
              <p className="text-zinc-300 text-sm">
                <strong>Drag the preview above</strong> or use the slider below
                to adjust the horizontal position
              </p>
            </div>

            {/* Slider control */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Horizontal Position
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
                className="w-full h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>Left</span>
                <span>Center</span>
                <span>Right</span>
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

// Enhanced vehicle card component
function VehicleCard({
  vehicle,
  isOwnProfile,
}: {
  vehicle: any;
  isOwnProfile?: boolean;
}) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [showAlignModal, setShowAlignModal] = useState(false);
  const [bgAlignX, setBgAlignX] = useState<number>(vehicle.bgAlignX ?? 50);
  const [savingAlign, setSavingAlign] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const vehicleName = `${vehicle.manufacturer || "Unknown"} ${
    vehicle.model || "Vehicle"
  }`;

  // Fetch vehicle image
  useEffect(() => {
    let isMounted = true;
    async function fetchImage() {
      try {
        const url = await getDownloadURL(
          storageRef(storage, `vehicles/${vehicle.id}/backgroundPic`)
        );
        if (isMounted) {
          setImageUrl(url);
          setImageLoading(false);
        }
      } catch {
        if (isMounted) {
          setImageUrl("/car-placeholder.png");
          setImageLoading(false);
        }
      }
    }
    fetchImage();
    return () => {
      isMounted = false;
    };
  }, [vehicle.id]);

  // Handle alignment save
  const handleSaveAlignment = useCallback(async () => {
    setSavingAlign(true);
    try {
      await updateDoc(doc(db, "vehicles", vehicle.id), { bgAlignX });
      setShowAlignModal(false);
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Photo alignment saved successfully!",
        })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to save alignment. Please try again.",
        })
      );
    } finally {
      setSavingAlign(false);
    }
  }, [vehicle.id, bgAlignX]);

  const bgImage = imageUrl || "/car-placeholder.png";

  return (
    <>
      <div
        className="relative group rounded-2xl overflow-hidden shadow-xl cursor-pointer h-72 w-54 flex items-end animate-fade-in-up transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950/90 via-zinc-900/80 to-zinc-800/80"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: `${bgAlignX}% center`,
        }}
        onClick={() => router.push(`/car?id=${vehicle.id}`)}
      >
        {/* Image loading overlay */}
        {imageLoading && (
          <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/30 to-transparent pointer-events-none transition-all duration-300 group-hover:from-zinc-950/60" />

        {/* Glass reflection effect */}
        <div className="absolute left-0 top-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Visibility indicator */}
        {isOwnProfile && (
          <div className="absolute top-4 left-4 z-10">
            <div
              className={`px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                vehicle.visibility === "private"
                  ? "bg-red-500/20 border-red-500/40 text-red-300"
                  : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              }`}
            >
              {vehicle.visibility === "private" ? "Private" : "Public"}
            </div>
          </div>
        )}

        {/* Actions button - only for owner */}
        {isOwnProfile && (
          <button
            className="cursor-pointer absolute top-4 right-4 z-10 bg-zinc-900/80 hover:bg-zinc-800/90 text-white rounded-full p-2.5 shadow-lg transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions((prev) => !prev);
            }}
            aria-label="Show vehicle actions"
            type="button"
          >
            <FiMoreVertical size={18} />
          </button>
        )}

        {/* Action buttons - only for owner */}
        {isOwnProfile && showActions && (
          <div className="absolute top-4 right-16 z-20 flex flex-row gap-2 animate-fade-in">
            {/* Align button */}
            <button
              type="button"
              aria-label="Align background"
              title="Align photo"
              className="cursor-pointer flex items-center justify-center bg-blue-600/90 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg border border-blue-400/30 transition-all duration-200 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAlignModal(true);
                setShowActions(false);
              }}
            >
              <FiEdit3 size={16} />
            </button>
          </div>
        )}

        {/* Vehicle information */}
        <div className="relative z-10 w-full px-5 pb-5 pt-8 flex flex-col">
          <h3 className="text-white text-2xl font-black drop-shadow-lg mb-0.5 truncate">
            {vehicle.manufacturer || "Unknown"}
          </h3>
          <div className="text-zinc-200 text-xl font-semibold truncate drop-shadow">
            {vehicle.model || "Model"}
          </div>
          <div className="text-zinc-400 text-sm mt-1.5 drop-shadow">
            {vehicle.year || "Year"} •{" "}
            {vehicle.horsepower ? `${vehicle.horsepower}HP` : "N/A"} •{" "}
            {vehicle.engine || "Engine"}
          </div>
        </div>

        {/* Hover border effect */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/50 transition-all duration-300" />

        {/* Hover glow effect */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl group-hover:shadow-[0_0_40px_0_rgba(59,130,246,0.2)] transition-all duration-300" />
      </div>

      {/* Alignment Modal */}
      <AlignmentModal
        isOpen={showAlignModal}
        onClose={() => setShowAlignModal(false)}
        onSave={handleSaveAlignment}
        vehicleName={vehicleName}
        imageUrl={bgImage}
        bgAlignX={bgAlignX}
        setBgAlignX={setBgAlignX}
        savingAlign={savingAlign}
      />
    </>
  );
}

// Enhanced loading state component
function VehiclesLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {[...Array(8)].map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Main vehicles list component
export const VehiclesListDiv: React.FC<{
  userId: string;
  onVehicleCount?: (count: number) => void;
  isOwnProfile?: boolean;
}> = ({ userId, onVehicleCount, isOwnProfile = false }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch vehicles
  useEffect(() => {
    if (!mounted || !userId) return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVehiclesForUser(userId, isOwnProfile);
        if (isMounted) {
          setVehicles(data);
          onVehicleCount?.(data.length);
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        if (isMounted) {
          setError("Failed to load vehicles. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [userId, isOwnProfile, onVehicleCount, mounted]);

  // Don't render until mounted
  if (!mounted) return null;

  // Loading state
  if (loading) return <VehiclesLoading />;

  // Error state
  if (error) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
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
          Failed to Load Vehicles
        </h3>
        <p className="text-zinc-400 text-center max-w-md leading-relaxed mb-6">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (!vehicles.length) {
    return <EmptyVehiclesState isOwnProfile={isOwnProfile} />;
  }

  // Render vehicles
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {vehicles.map((vehicle, index) => (
        <div
          key={vehicle.id}
          style={{ animationDelay: `${index * 100}ms` }}
          className="animate-fade-in-up"
        >
          <VehicleCard vehicle={vehicle} isOwnProfile={isOwnProfile} />
        </div>
      ))}

      {/* Enhanced Global Styles */}
      <style jsx global>{`
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

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        /* Custom slider styles */
        .slider {
          background: linear-gradient(
            to right,
            #3b82f6 0%,
            #3b82f6 50%,
            #374151 50%,
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
      `}</style>
    </div>
  );
};
