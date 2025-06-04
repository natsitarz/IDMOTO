import { useState } from "react";
import { VehiclesListDiv } from "../parts/firebase-get-vehicles";

interface ProfileVehiclesSectionProps {
  uid: string;
  letsAdd?: () => void; // <-- make optional
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
      className="animate-slide-up-fade cursor-pointer rounded-full border border-white/30 hover:bg-white/10 transition-colors flex items-center justify-center font-medium h-10 sm:h-12 px-4 sm:px-5 w-max sm:w-max text-xs uppercase text-zinc-200 tracking-widest mb-1"
      onClick={letsAdd}
    >
      {vehicleCount === 0 ? "Add first vehicle" : "Add another car"}
    </button>
  );
}

export function ProfileVehiclesSection({
  uid,
  letsAdd,
  isOwnProfile, // <-- add this prop
}: ProfileVehiclesSectionProps & { isOwnProfile: boolean }) {
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);

  return (
    <section className="flex flex-col gap-3 sm:justify-start sm:items-start justify-start items-center">
      <p className="block text-xl uppercase text-zinc-100 tracking-widest font-bold">
        {isOwnProfile ? "// My Vehicles" : "// User's Vehicles"}
      </p>
      {letsAdd && <VehiclesMessage vehicleCount={vehicleCount} />}
      <VehiclesAddButton vehicleCount={vehicleCount} letsAdd={letsAdd} />
      <div className="flex items-center justify-center flex-col sm:flex-row text-sm h-max sm:h-max px-4 sm:px-5 w-max sm:w-auto p-2 gap-4 slide-up-fade">
        {uid ? (
          <VehiclesListDiv
            userId={uid}
            onVehicleCount={setVehicleCount}
            isOwnProfile={isOwnProfile} // <-- pass down
          />
        ) : null}
      </div>
    </section>
  );
}
