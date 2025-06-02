"use client";

import { auth, db } from "@/app/parts/firebase";
import { firebaseAddVehiclePublic } from "@/app/parts/firebase-add-vehicle";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(auth.currentUser);
  const [hasCar, setHasCar] = useState<boolean | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
    if (user) {
      document.getElementById("addCar")?.style.setProperty("display", "grid");
      document
        .getElementById("watermark")
        ?.style.setProperty("display", "flex");
      document.getElementById("navbar")?.style.setProperty("display", "flex");

      // Check if user already has a car
      const checkUserCars = async () => {
        const q = query(
          collection(db, "vehicles"),
          where("userID", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        setHasCar(!snapshot.empty);
      };
      checkUserCars();
    }
  }, [user]);

  return (
    <div
      id="addCar"
      className="min-h-[calc(100vh-67px)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 p-4"
    >
      <div className="bg-white/10 dark:bg-zinc-900/80 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md p-8 flex flex-col items-center gap-8 animate-fade-in-scale">
        <div className="flex flex-col items-center gap-2">
          <h1 className="block text-xl uppercase text-zinc-100 tracking-widest font-bold">
            Add vehicle
          </h1>
          <p className="block text-xs uppercase text-zinc-400 tracking-widest">
            {hasCar === null
              ? ""
              : hasCar
              ? "Add another car to your collection!"
              : "It's time to add your first car!"}
          </p>
        </div>
        <form
          className="flex flex-col items-center justify-center gap-4 w-full"
          method="post"
          onSubmit={firebaseAddVehiclePublic}
        >
          <input
            type="text"
            name="manufacturer"
            placeholder="Manufacturer"
            required
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-base"
          />
          <input
            type="text"
            name="model"
            placeholder="Model"
            required
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-base"
          />
          <input
            type="number"
            name="year"
            placeholder="Year"
            required
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-base [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
            style={{ MozAppearance: "textfield" }}
          />
          <input
            type="text"
            name="engine"
            placeholder="Engine"
            required
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-base"
          />
          <input
            type="text"
            name="transmission"
            placeholder="Transmission"
            required
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-base"
          />
          <button
            className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-xs uppercase block text-zinc-100 font-bold tracking-widest mb-1 shadow transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
            type="submit"
          >
            Add it!
          </button>
        </form>
      </div>
    </div>
  );
}
