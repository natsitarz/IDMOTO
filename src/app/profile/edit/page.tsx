"use client";

import { auth, db } from "@/app/parts/firebase";
import { useFirebaseUser } from "@/app/parts/firebase-use-user";
import { sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function EditProfilePage() {
  const user = useFirebaseUser();
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      // Fetch country from Firestore
      const fetchCountry = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCountry(userSnap.data().country || "");
        }
      };
      fetchCountry();
    }
  }, [user]);

  const handleSendVerification = async () => {
    setError(null);
    setSuccess(null);
    setVerificationSent(false);
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        window.dispatchEvent(
          new CustomEvent("show-global-success", {
            detail: "Verification email sent!",
          })
        );
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to send verification email.",
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (auth.currentUser && user) {
        await updateProfile(auth.currentUser, { displayName });
        // Update Firestore with displayName and country
        await updateDoc(doc(db, "users", user.uid), {
          displayName,
          country,
        });
        window.dispatchEvent(
          new CustomEvent("show-global-success", { detail: "Profile updated!" })
        );
      }
    } catch (err: any) {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update profile.",
        })
      );
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >
        <div className="p-8 bg-white/10 rounded-xl shadow-xl backdrop-blur-md border border-white/20 text-white">
          You must be logged in to edit your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-67px)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-lg bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-10 flex flex-col items-center gap-10 animate-fade-in-scale relative overflow-hidden">
        {/* Decorative gradient circle */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center gap-5 w-full z-10"
        >
          <div className="flex flex-col items-center gap-2 z-10 w-full">
            <h1 className="block text-2xl uppercase text-white tracking-widest font-extrabold drop-shadow">
              Edit Profile
            </h1>
            <p className="block text-xs uppercase text-zinc-400 tracking-widest font-medium">
              Update your profile below
            </p>
            <div className="flex flex-col items-center gap-2 w-full mt-2">
              <Image
                src={user.photoURL || "/default-avatar.png"}
                width={92}
                height={92}
                priority
                alt="User Avatar"
                className="rounded-full border-2 border-blue-600/30 shadow-lg mb-2 bg-zinc-800 object-cover"
              />
              {/* Email verification status */}
              {user.emailVerified ? (
                <div className="w-full bg-green-400/10 border border-green-400/40 text-green-300 rounded-lg px-4 py-2 text-center text-xs flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="block text-xs uppercase text-zinc-200 tracking-widest">
                    Your email is verified.
                  </span>
                </div>
              ) : (
                <div className="w-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-300 rounded-lg px-4 py-2 text-center text-xs flex flex-col items-center gap-2">
                  <span className="block text-xs uppercase text-zinc-200 tracking-widest">
                    Your email is not verified.
                  </span>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={verificationSent}
                    className="cursor-pointer mt-1 px-4 py-1 rounded bg-yellow-400/80 text-yellow-900 font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
                  >
                    {verificationSent
                      ? "Verification Sent!"
                      : "Send Verification Email"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="displayName"
            >
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
              required
              placeholder="Display Name"
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <label
              className="text-xs font-semibold text-zinc-300 ml-1"
              htmlFor="country"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner"
              placeholder="Country"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
