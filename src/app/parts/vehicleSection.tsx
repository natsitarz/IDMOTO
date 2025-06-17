import { useEffect, useState } from "react";
import { VehiclesListDiv } from "../parts/firebase-get-vehicles";

interface ProfileVehiclesSectionProps {
  uid: string;
  letsAdd?: () => void;
  isOwnProfile: boolean;
}

function VehiclesMessage({ vehicleCount }: { vehicleCount: number | null }) {
  if (vehicleCount === null) return <p className="fade-in">Please wait...</p>;
  return (
    <p className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
      {vehicleCount === 0
        ? "It's time to add your first car!"
        : "Maybe it's time to add another car?"}
    </p>
  );
}

function VehiclesAddButton({
  vehicleCount,
  letsAdd,
}: {
  vehicleCount: number | null;
  letsAdd?: () => void;
}) {
  // Mobile detection (Tailwind: sm = 640px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (vehicleCount === null || !letsAdd) return null;

  // Mobile: floating "+" button
  if (isMobile) {
    return (
      <button
        className="absolute right-4 z-20 h-10 w-10 flex items-center justify-center transition-all duration-200 bg-zinc-900/80 hover:bg-zinc-700/90 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-blue-500/70 cursor-pointer"
        onClick={letsAdd}
        type="button"
        aria-label="Add vehicle"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 5v14m7-7H5"
          />
        </svg>
      </button>
    );
  }

  // Desktop: regular button
  return (
    <button
      className="flex items-center justify-center gap-3 bg-zinc-800/80 hover:bg-zinc-700/90 text-white font-semibold rounded-lg px-4 py-2 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer"
      onClick={letsAdd}
      type="button"
      style={{ maxWidth: 260 }}
    >
      <svg
        className="w-5 h-5 text-blue-300"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}

export function ProfileVehiclesSection({
  uid,
  letsAdd,
  isOwnProfile,
}: ProfileVehiclesSectionProps) {
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);

  return (
    <section className="relative w-full mx-auto flex flex-col gap-8 bg-zinc-90 shadow-2xl border border-zinc-800/70 px-6 py-10 sm:px-12 sm:py-14 items-center overflow-hidden">
      <div className="animate-fade-in-up w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 z-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
              {isOwnProfile ? "My Vehicles" : "User's Vehicles"}
            </span>
            <span className="inline-flex items-center justify-center bg-zinc-800/80 text-blue-400 text-xs font-bold rounded-full px-3 py-1 ml-2 shadow-inner border border-blue-700/30">
              {vehicleCount !== null ? vehicleCount : "…"}
            </span>
          </h2>
          {letsAdd && <VehiclesMessage vehicleCount={vehicleCount} />}
        </div>
        <VehiclesAddButton vehicleCount={vehicleCount} letsAdd={letsAdd} />
      </div>
      <div className="w-full flex flex-wrap gap-6 justify-center sm:justify-start items-stretch min-h-[200px] z-10">
        {uid ? (
          <VehiclesListDiv
            userId={uid}
            onVehicleCount={setVehicleCount}
            isOwnProfile={isOwnProfile}
          />
        ) : null}
      </div>
      {/* Designerska linia na dole */}
      <div className="absolute left-8 right-8 bottom-0 h-[2px] bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-blue-600/30 rounded-full pointer-events-none" />
    </section>
  );
}
