"use client";

import { auth, db } from "@/app/parts/firebase";
import { useFirebaseUser } from "@/app/parts/firebase-use-user";
import { sendEmailVerification, updateProfile } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
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
        style={{ minHeight: "calc(100vh - 72px)" }} // 72px is navbar height
      >
        <div className="p-8 bg-white/10 rounded-xl shadow-xl backdrop-blur-md border border-white/20 text-white">
          You must be logged in to edit your profile.
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/10 dark:bg-zinc-900/80 p-8 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md"
      >
        <div className="flex flex-col items-center mb-4 gap-4">
          <h1 className="block text-xl uppercase text-zinc-100 tracking-widest font-bold">
            Edit Profile
          </h1>
          <p className="block text-xs uppercase text-zinc-400 tracking-widest">
            Update your profile below
          </p>
          <Image
            src={user.photoURL || "/default-avatar.png"}
            width={92}
            height={92}
            priority
            alt="User Avatar"
            className="rounded-full border border-white/20 shadow-lg mb-2"
          />
          {/* Email verification status */}
          {user.emailVerified ? (
            <div className="mt-3 w-full bg-green-400/10 border border-green-400/40 text-green-300 rounded-lg px-4 py-2 text-center text-sm flex items-center justify-center gap-2">
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
            <div className="mt-3 w-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-300 rounded-lg px-4 py-2 text-center text-sm flex flex-col items-center gap-2">
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
        <div>
          <label className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase text-zinc-400 tracking-widest mb-1">
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Country"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-xs uppercase block text-zinc-100 font-bold tracking-widest mb-1 shadow transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
