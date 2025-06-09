"use client";

import CarForm from "@/app/parts/CarForm";
import { db } from "@/app/parts/firebase";
import { useAuthUser, useCarData } from "@/app/parts/useCarEditHooks";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

function LoadingMessage() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 font-[family-name:var(--font-geist-sans)]"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <div className="bg-white/10 border border-blue-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg
          className="w-10 h-10 text-blue-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-lg font-semibold text-blue-400">
          Loading car data...
        </span>
      </div>
    </div>
  );
}

function NotLoggedInMessage() {
  return (
    <div
      className="bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 flex flex-col items-center justify-center"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg
          className="w-10 h-10 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <span className="text-lg font-semibold text-red-400">
          You must be logged in to edit your car details.
        </span>
        <span className="text-sm text-zinc-400 text-center">
          Please log in to continue.
        </span>
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return <div className="p-8 text-red-500">{error}</div>;
}

function CarEditContent({
  form,
  setForm,
  handleSubmit,
  saving,
  error,
}: {
  form: any;
  setForm: any;
  handleSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <div className="animate-fade-in-scale p-8">
      <CarForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
      />
    </div>
  );
}

function useCarEditPageLogic() {
  const [authTimeout, setAuthTimeout] = useState(false);
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const carId = searchParams?.get("id") || "";

  const user = useAuthUser();
  useEffect(() => {
    if (user) {
      setAuthTimeout(false);
      return;
    }
    const timeout = setTimeout(() => setAuthTimeout(true), 4000);
    return () => clearTimeout(timeout);
  }, [user]);

  const { car, loading, error, form, setForm, setError } = useCarData(
    user,
    carId
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !carId) return;
    setSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "vehicles", carId), {
        manufacturer: form.manufacturer,
        model: form.model,
        year: form.year,
        engine: form.engine,
        horsepower: form.horsepower,
        transmission: form.transmission,
      });
      window.dispatchEvent(
        new CustomEvent("show-global-success", { detail: "Car info updated!" })
      );
      setError(null); // Optionally clear local error
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update car info.",
        })
      );
    }
    setSaving(false);
  };

  return {
    user,
    car,
    loading,
    error,
    form,
    setForm,
    setError,
    saving,
    handleSubmit,
    authTimeout,
  };
}

function NoEditPermissionMessage() {
  return (
    <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
      <svg
        className="w-10 h-10 text-red-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4m0 4h.01"
        />
      </svg>
      <span className="text-lg font-semibold text-red-400">
        You do not have permission to edit this car.
      </span>
      <span className="text-sm text-zinc-400 text-center">
        Please check if you are logged in with the correct account or if the car
        belongs to you.
      </span>
    </div>
  );
}

function shouldShowNotLoggedIn(
  loading: boolean,
  user: any,
  authTimeout: boolean
) {
  return (loading && !user && authTimeout) || (!user && !loading);
}

function shouldShowLoading(loading: boolean, user: any, authTimeout: boolean) {
  return loading && (!authTimeout || !!user);
}

function shouldShowError(error: string | null, car: any) {
  return error && !car;
}

function shouldShowNoEditPermission(car: any, user: any) {
  return !car || car.userID !== user?.uid;
}

function renderCarEditPageContent({
  user,
  car,
  loading,
  error,
  form,
  setForm,
  saving,
  handleSubmit,
  authTimeout,
}: {
  user: any;
  car: any;
  loading: boolean;
  error: string | null;
  form: any;
  setForm: any;
  saving: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  authTimeout: boolean;
}) {
  if (shouldShowNotLoggedIn(loading, user, authTimeout))
    return <NotLoggedInMessage />;
  if (shouldShowLoading(loading, user, authTimeout)) return <LoadingMessage />;
  if (shouldShowError(error, car)) return <ErrorMessage error={error!} />;
  if (shouldShowNoEditPermission(car, user)) return <NoEditPermissionMessage />;
  return (
    <CarEditContent
      form={form}
      setForm={setForm}
      handleSubmit={handleSubmit}
      saving={saving}
      error={error}
    />
  );
}

export default function CarEditPage() {
  const {
    user,
    car,
    loading,
    error,
    form,
    setForm,
    setError,
    saving,
    handleSubmit,
    authTimeout,
  } = useCarEditPageLogic();

  return (
    <div
      className="min-h-[calc(100vh-67px)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 font-[family-name:var(--font-geist-sans)]"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      {renderCarEditPageContent({
        user,
        car,
        loading,
        error,
        form,
        setForm,
        saving,
        handleSubmit,
        authTimeout,
      })}
    </div>
  );
}
