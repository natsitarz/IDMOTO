import { useState } from "react";
import { VehiclesListDiv } from "../parts/firebase-get-vehicles";

interface ProfileVehiclesSectionProps {
  uid: string;
  letsAdd?: () => void;
}

function VehiclesMessage({ vehicleCount }: { vehicleCount: number | null }) {
  if (vehicleCount === null) return <p className="fade-in">Please wait...</p>;
  return (
    <p className="animate-slide-up-fade block text-xs uppercase text-zinc-400 tracking-widest mb-1 ">
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
  if (vehicleCount === null || !letsAdd) return null;
  return (
    <button
      className="cursor-pointer flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white-200 hover:text-white font-semibold h-9 px-4 text-xs uppercase shadow-sm border border-zinc-800 transition"
      onClick={letsAdd}
      type="button"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      {vehicleCount === 0 ? "Add first vehicle" : "Add another car"}
    </button>
  );
}

export function ProfileVehiclesSection({
  uid,
  letsAdd,
  isOwnProfile,
}: ProfileVehiclesSectionProps & { isOwnProfile: boolean }) {
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);

  return (
    <section className="flex flex-col gap-4 sm:justify-start sm:items-start justify-start items-center sm:mt-6">
      <p className="block text-xl uppercase text-zinc-100 tracking-widest font-bold">
        {isOwnProfile ? "// My Vehicles" : "// User's Vehicles"}
      </p>
      {letsAdd && <VehiclesMessage vehicleCount={vehicleCount} />}
      <VehiclesAddButton vehicleCount={vehicleCount} letsAdd={letsAdd} />
      <div className="flex flex-wrap items-start justify-start flex-col sm:flex-row text-sm h-max sm:h-max px-4 sm:px-5 w-max sm:w-auto p-2 gap-4 slide-up-fade">
        {uid ? (
          <VehiclesListDiv
            userId={uid}
            onVehicleCount={setVehicleCount}
            isOwnProfile={isOwnProfile}
          />
        ) : null}
      </div>
    </section>
  );
}
