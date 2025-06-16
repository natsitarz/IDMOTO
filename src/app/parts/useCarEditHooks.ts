import { auth, db } from "@/app/parts/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";


export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);
  return user;
}

function processCarSnapshot(
  carSnap: any,
  setCar: React.Dispatch<React.SetStateAction<any>>,
  setForm: React.Dispatch<React.SetStateAction<any>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  if (carSnap.exists()) {
    const carData = carSnap.data();
    setCar(carData);
    setForm({
      manufacturer: carData.manufacturer || "",
      model: carData.model || "",
      year: carData.year || "",
      engine: carData.engine || "",
      horsepower: carData.horsepower || "",
      transmission: carData.transmission || "",
      description: carData.description || "",
    });
  } else {
    setError("Car not found.");
  }
}

export function useCarData(user: User | null, carId: string) {
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    manufacturer: "",
    model: "",
    year: "",
    engine: "",
    horsepower: "",
    transmission: "",
    description: "",
  });
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!user || !carId) return;
    setLoading(true);
    setError(null);
    getDoc(doc(db, "vehicles", carId))
      .then((carSnap) => {
        processCarSnapshot(carSnap, setCar, setForm, setError);
        const carData = carSnap.data();
        if (carData) {
          setVisibility(carData.visibility || "private");
          setCanEdit(user && carData.ownerId === user.uid);
        }
      })
      .catch(() => setError("Failed to fetch car data."))
      .finally(() => setLoading(false));
  }, [user, carId]);

  const deleteCar = async () => {
    if (!carId) throw new Error("No carId");
    await deleteDoc(doc(db, "vehicles", carId));
  };

  return {
    car,
    loading,
    error,
    form,
    setForm,
    setError,
    visibility,
    setVisibility,
    canEdit,
    deleteCar,
  };
}