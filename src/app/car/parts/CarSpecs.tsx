import { Vehicle } from "@/types";
import React from "react";

export default function CarSpecs({ car }: { car: Vehicle }) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-zinc-400 font-semibold">
          More specs of{" "}
          <span className="text-white font-bold">
            {car.manufacturer} {car.model}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-4 items-center bg-white/5 rounded-xl p-4 shadow-inner w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 w-full max-w-lg">
          <SpecRow label="Nm" value={car.nm ? `${car.nm} Nm` : ""} />
          <SpecRow label="Version" value={car.version} />
          <SpecRow
            label="Mileage"
            value={car.mileage ? `${car.mileage} km` : ""}
          />
          <SpecRow label="Color" value={car.color} />
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-400 w-28 font-semibold">{label}:</span>
      <span className="text-sm text-zinc-200 font-medium">
        {value || <span className="text-zinc-500">—</span>}
      </span>
    </div>
  );
}
