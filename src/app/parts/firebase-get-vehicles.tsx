import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref as storageRef,
} from "firebase/storage";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { db, storage } from "./firebase";

export const firebaseGetVehicles = async (userId: string) => {
  const vehiclesRef = collection(db, "vehicles");
  const q = query(
    vehiclesRef,
    where("userID", "==", userId),
    orderBy("createdAt", "desc")
  );
  const vehiclesSnapshot = await getDocs(q);
  const vehiclesList = vehiclesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return vehiclesList;
};

async function fetchVehiclesForUser(userId: string) {
  const vehiclesRef = collection(db, "vehicles");
  const q = query(
    vehiclesRef,
    where("userID", "==", userId),
    orderBy("createdAt", "desc")
  );
  const vehiclesSnapshot = await getDocs(q);
  return vehiclesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

const deleteVehicle = async (vehicleId: string, onSuccess?: () => void) => {
  try {
    // Delete all files in the vehicle's storage folder FIRST
    const folderRef = storageRef(storage, `vehicles/${vehicleId}`);
    try {
      const listResult = await listAll(folderRef);
      await Promise.all(
        listResult.items.map((itemRef) => deleteObject(itemRef))
      );
    } catch (storageError) {
      if ((storageError as any).code !== "storage/object-not-found") {
        console.error("Error deleting storage files:", storageError);
        // Optionally, you can return here if you want to abort on storage error
      }
    }

    // THEN delete the Firestore document
    await deleteDoc(doc(db, "vehicles", vehicleId));
    if (onSuccess) {
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Vehicle deleted successfully!",
        })
      );
      onSuccess();
    }
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent("show-global-error", {
        detail: "Failed to remove vehicle.",
      })
    );
  }
};

// Render a single vehicle card
function VehicleCard({
  vehicle,
  onDeleteSuccess,
  isOwnProfile,
}: {
  vehicle: any;
  onDeleteSuccess: () => void;
  isOwnProfile?: boolean;
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showAlignModal, setShowAlignModal] = useState(false);
  const [bgAlignX, setBgAlignX] = useState<number>(vehicle.bgAlignX ?? 50);
  const [savingAlign, setSavingAlign] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchImage() {
      try {
        const url = await getDownloadURL(
          storageRef(storage, `vehicles/${vehicle.id}/backgroundPic`)
        );
        if (isMounted) setImageUrl(url);
      } catch {
        setImageUrl("/car-placeholder.png");
      }
    }
    fetchImage();
    return () => {
      isMounted = false;
    };
  }, [vehicle.id]);

  const bgImage = imageUrl || "/car-placeholder.png";

  return (
    <>
      <div
        className="animate-slide-up-fade relative group rounded-3xl overflow-hidden shadow-2xl cursor-pointer h-72 w-54 flex items-end transition-transform hover:scale-105 border border-zinc-200 dark:border-zinc-800"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: `${bgAlignX}% center`,
        }}
        onClick={() => router.push(`/car?id=${vehicle.id}`)}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 group-hover:bg-gradient-to-t group-hover:from-black/80 group-hover:via-black/40 group-hover:to-transparent z-0 transition" />

        {/* Gear button - only for owner */}
        {isOwnProfile && (
          <button
            className="cursor-pointer absolute top-4 right-4 z-10 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full p-2 shadow-lg transition-all duration-200 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setShowDelete((prev) => !prev);
            }}
            aria-label="Show vehicle actions"
            type="button"
          >
            <FiMoreVertical size={22} />
          </button>
        )}
        {/* Delete button - only for owner */}
        {isOwnProfile && showDelete && (
          <div className="absolute top-4 right-16 z-20 flex flex-row gap-2">
            <button
              type="button"
              aria-label="Delete vehicle"
              title="Delete vehicle"
              className="animate-pulse cursor-pointer flex items-center justify-center bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2 rounded-full shadow-lg border border-red-400/30 transition-all duration-200 w-[40px] h-[40px]"
              onClick={(e) => {
                e.stopPropagation();
                deleteVehicle(vehicle.id, onDeleteSuccess);
              }}
            >
              <span className="text-lg font-bold leading-none">×</span>
            </button>
            {/* --- ALIGN BUTTON --- */}
            <button
              type="button"
              aria-label="Align background"
              title="Align background"
              className="cursor-pointer flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-900 text-white p-2 rounded-full shadow-lg border border-blue-400/30 transition-all duration-200 w-[40px] h-[40px]"
              onClick={(e) => {
                e.stopPropagation();
                setShowAlignModal(true);
                setShowDelete(false);
              }}
            >
              {/* Icon: arrows up/down */}
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M8 7l4-4 4 4M16 17l-4 4-4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Brand & model */}
        <div className="relative z-10 p-6 pb-5">
          <div className="flex flex-col items-start">
            <span className="text-white text-2xl font-black drop-shadow-lg">
              {vehicle.manufacturer || "Brand"}
            </span>
            <span className="text-white text-xl font-semibold drop-shadow-lg opacity-90">
              {vehicle.model || "Model"}
            </span>
            <span className="block text-xs uppercase text-zinc-200/[.8] tracking-widest">
              {vehicle.year || "Year"} | {vehicle.engine || "Engine"}
            </span>
          </div>
        </div>
      </div>
      {/* ALIGN MODAL */}
      {showAlignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-[90vw] max-w-lg relative">
            <h2 className="text-lg font-bold mb-4 text-white">
              Align vehicle photo
            </h2>
            <div
              className="relative w-[216px] h-72 mx-auto rounded-3xl mb-4 overflow-hidden bg-cover bg-center cursor-grab active:cursor-grabbing shadow-lg"
              style={{
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                backgroundPosition: `${bgAlignX}% center`,
                backgroundSize: "cover",
              }}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startAlign = bgAlignX;
                let dragging = true;

                const onMouseMove = (moveEvent: MouseEvent) => {
                  if (!dragging) return;
                  const deltaX = moveEvent.clientX - startX;
                  // 216px szerokości = 100%
                  const percentDelta = (deltaX / 216) * 100;
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
            ></div>
            <input
              type="range"
              min={0}
              max={100}
              value={bgAlignX}
              onChange={(e) => setBgAlignX(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="cursor-pointer px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
                onClick={() => setShowAlignModal(false)}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={savingAlign}
                onClick={async () => {
                  setSavingAlign(true);
                  await updateDoc(doc(db, "vehicles", vehicle.id), {
                    bgAlignX,
                  });
                  setShowAlignModal(false);
                  setSavingAlign(false);
                  window.dispatchEvent(
                    new CustomEvent("show-global-success", {
                      detail: "Vehicle photo alignment saved!",
                    })
                  );
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Main vehicles list component
export const VehiclesListDiv: React.FC<{
  userId: string;
  onVehicleCount?: (count: number) => void;
  isOwnProfile?: boolean; // <-- add this prop
}> = ({ userId, onVehicleCount, isOwnProfile }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchVehiclesForUser(userId);
      if (isMounted) {
        setVehicles(data);
        if (onVehicleCount) onVehicleCount(data.length); // <-- call immediately after fetch
        setFadeLoader(true);
        setTimeout(() => setLoading(false), 400);
      }
    }
    if (userId) load();
    return () => {
      isMounted = false;
    };
  }, [userId, onVehicleCount]);

  if (loading)
    return <div className={fadeLoader ? "fade-out" : ""}>Loading...</div>;
  if (!vehicles.length)
    return <div className="animate-slide-up-fade">No vehicles found.</div>;

  return (
    <>
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onDeleteSuccess={() => {
            setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
            if (onVehicleCount) onVehicleCount(vehicles.length - 1);
          }}
          isOwnProfile={isOwnProfile} // <-- pass down
        />
      ))}
    </>
  );
};
