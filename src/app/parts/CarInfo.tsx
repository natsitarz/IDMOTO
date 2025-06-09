export default function CarInfo({ car }: { car: any }) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Manufacturer
          </span>
          <span className="text-lg font-semibold text-white">
            {car.manufacturer || "—"}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Model
          </span>
          <span className="text-lg font-semibold text-white">
            {car.model || "—"}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Engine
          </span>
          <span className="text-lg font-semibold text-white">
            {car.engine || "—"}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Horsepower
          </span>
          <span className="text-lg font-semibold text-white">
            {car.horsepower + "HP" || "—"}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Transmission
          </span>
          <span className="text-lg font-semibold text-white">
            {car.transmission || "—"}
          </span>
        </div>
        <div>
          <span className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Year
          </span>
          <span className="text-lg font-semibold text-white">
            {car.year || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
