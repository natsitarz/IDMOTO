import { useAuth } from "@/app/parts/AuthProvider";
import { auth, db } from "@/app/parts/firebase";
import { validateContent } from "@/lib/api-client";
import { sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function EditProfileMain() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(true); // <-- loading state
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const fetchProfile = async () => {
        setDisplayName(user.displayName || "");
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCountry(userData.country || "");
          setBio(userData.bio || "");
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [user]);

  const handleSendVerification = async () => {
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
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to send verification email.",
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationWarnings([]);

    let sanitizedBio = bio;

    try {
      // Server-side bio validation
      if (bio.trim()) {
        const validation = await validateContent(bio, "bio");
        if (!validation.isValid) {
          setValidationWarnings(validation.errors);
          setIsValidating(false);
          return;
        }

        if (validation.warnings.length > 0) {
          setValidationWarnings(validation.warnings);
        }

        sanitizedBio = validation.sanitizedContent || bio;
      }

      // Client-side length check (backup)
      if (bio.length > 25) {
        window.dispatchEvent(
          new CustomEvent("show-global-error", {
            detail: "Bio must be 25 characters or less.",
          })
        );
        setIsValidating(false);
        return;
      }

      setSaving(true);
      if (auth.currentUser && user) {
        await updateProfile(auth.currentUser, { displayName });
        await updateDoc(doc(db, "users", user.uid), {
          displayName,
          country,
          bio: sanitizedBio,
        });
        window.dispatchEvent(
          new CustomEvent("show-global-success", { detail: "Profile updated!" })
        );
      }
    } catch (error) {
      console.error("Profile update error:", error);
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update profile.",
        })
      );
    } finally {
      setSaving(false);
      setIsValidating(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 w-full z-10 py-8 animate-fade-in-scale">
        {/* Header skeleton */}
        <div className="flex flex-col items-center gap-2 z-10 w-full">
          <div
            className="h-8 w-48 bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-lg animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="h-4 w-64 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse"
            style={{ animationDelay: "100ms" }}
          />

          {/* Avatar skeleton */}
          <div className="flex flex-col items-center gap-2 w-full mt-4">
            <div
              className="w-24 h-24 bg-gradient-to-br from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-full animate-pulse"
              style={{ animationDelay: "200ms" }}
            />
            <div
              className="h-4 w-32 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div
              className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
              style={{ animationDelay: "400ms" }}
            />
            <div
              className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
              style={{ animationDelay: "450ms" }}
            />
          </div>
          <div className="space-y-2">
            <div
              className="h-4 w-16 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
              style={{ animationDelay: "500ms" }}
            />
            <div
              className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
              style={{ animationDelay: "550ms" }}
            />
          </div>
          <div className="space-y-2">
            <div
              className="h-4 w-24 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse"
              style={{ animationDelay: "600ms" }}
            />
            <div
              className="h-24 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
              style={{ animationDelay: "650ms" }}
            />
          </div>
          <div
            className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse"
            style={{ animationDelay: "700ms" }}
          />
        </div>
      </div>
    );
  }

  return (
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
      {/* BIO FIELD */}
      <div className="w-full flex flex-col gap-2">
        <label
          className="text-xs font-semibold text-zinc-300 ml-1"
          htmlFor="bio"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={25}
          rows={3}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner resize-none"
          placeholder="Tell us something about yourself…"
        />
        <span className="text-xs text-zinc-500 text-right">
          {bio.length}/25
        </span>
      </div>
      {/* Validation warnings */}
      {validationWarnings.length > 0 && (
        <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-yellow-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-yellow-500">
              Content Validation
            </span>
          </div>
          {validationWarnings.map((warning, index) => (
            <p key={index} className="text-sm text-yellow-400">
              {warning}
            </p>
          ))}
        </div>
      )}
      <button
        type="submit"
        disabled={saving || isValidating}
        className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-3 rounded-xl text-sm uppercase text-white font-bold tracking-widest mt-2 shadow-lg transition disabled:opacity-50 antialiased font-sans text-center disabled:cursor-not-allowed"
      >
        {isValidating ? "Validating..." : saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
