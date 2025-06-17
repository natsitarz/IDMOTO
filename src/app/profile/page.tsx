"use client";

import { db } from "@/app/parts/firebase";
import { useFirebaseUser } from "@/app/parts/firebase-use-user";
import { ProfileHeader } from "@/app/parts/headerSection";
import { useShowMainDom } from "@/app/parts/showMainProf";
import { ProfileVehiclesSection } from "@/app/parts/vehicleSection";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

const aiCardBgAnimation = (
  <style jsx global>{`
    @keyframes aiCardBgMove {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `}</style>
);

const firebaseAddVehicleRedirect = () => {
  if (typeof window !== "undefined") window.location.href = "/add/";
};

const firebaseEditUserRedirect = () => {
  if (typeof window !== "undefined") window.location.href = "/profile/edit/";
};

function AIAssistantCard({ isOwnProfile }: { isOwnProfile: boolean }) {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      router.push("/ai"); // Allow navigation to /ai without question
      return;
    }
    router.push(`/ai?question=${encodeURIComponent(input)}`);
  };

  if (isOwnProfile) {
    return (
      <>
        {aiCardBgAnimation}
        <form
          onSubmit={handleAsk}
          className="hidden w-full max-w-sm sm:max-w-xl mx-auto my-4 items-center rounded-2xl shadow-lg px-2 py-2 sm:px-4 sm:py-2 gap-2"
          style={{
            background: "linear-gradient(120deg, #23272f 0%, #23272f 100%)",
            border: "1px solid #333843",
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
          }}
        >
          <span className="bg-zinc-800 rounded-full p-1 flex items-center justify-center border border-zinc-700"></span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isOwnProfile
                ? "Ask IDMOTO AI about your car…"
                : "Ask IDMOTO AI about this user's cars"
            }
            className="flex-1 bg-transparent outline-none text-white placeholder-zinc-400 px-2 text-sm sm:text-base"
          />
          <button
            type="submit"
            className="group cursor-pointer ml-1 sm:ml-3 px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-semibold uppercase tracking-widest bg-zinc-900/80 border border-zinc-700 shadow transition-all duration-150 hover:bg-zinc-800 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/40"
            style={{
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.12)",
              letterSpacing: "0.08em",
            }}
          >
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition">
              <svg
                className="w-3 h-3 text-zinc-300 group-hover:text-white transition"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h8m0 0l-3-3m3 3l-3 3"
                />
              </svg>
            </span>
            <span className="tracking-widest">Ask</span>
          </button>
        </form>
      </>
    );
  }
}

// --- Wrap Profile in Suspense for useSearchParams ---
function ProfileInner() {
  const searchParams = useSearchParams();
  const user = useFirebaseUser();
  useShowMainDom(user);
  const profileUid = searchParams.get("uid") || user?.uid || "";
  const isOwnProfile = !!user && user.uid === profileUid;
  const [bio, setBio] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("Loading…");
  const [photoURL, setPhotoURL] = useState<string>("/logo.png");
  const [email, setEmail] = useState<string>("Loading…");
  const [notFound, setNotFound] = useState(false);

  // Show warning if user is on their own profile and email is not verified
  useEffect(() => {
    if (user && isOwnProfile && !user.emailVerified) {
      window.dispatchEvent(
        new CustomEvent("show-global-warning", {
          detail: 'Verify your email in "Edit profile"',
        })
      );
    }
  }, [user, isOwnProfile]);

  useEffect(() => {
    // If no uid in searchParams and user is not logged in, show "Profile not found"
    if (!searchParams.get("uid") && !user) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    if (!profileUid) return;
    async function fetchUserData() {
      const userDoc = await getDoc(doc(db, "users", profileUid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setBio(data.bio || "");
        setCountry(data.country || "");
        setDisplayName(data.displayName || "No name");
        setPhotoURL(data.photoURL || "/logo.png");
        setEmail(data.email || "No email");
      }
    }
    fetchUserData();
  }, [profileUid]);

  async function handleSaveBio(newBio: string) {
    if (!profileUid) return;
    await updateDoc(doc(db, "users", profileUid), { bio: newBio });
    setBio(newBio); // update local state
  }

  if (notFound) {
    return (
      <div
        className="flex flex-grow flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800"
        style={{ minHeight: "calc(100vh - 67px)" }}
      >
        <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
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
              strokeWidth={2}
              stroke="currentColor"
              d="M12 8v4m0 4h.01"
            />
          </svg>
          <span className="text-lg font-semibold text-red-400">
            Profile not found
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-67px)] relative w-full mx-auto flex flex-col gap-8 bg-gradient-to-br from-zinc-950/95 via-zinc-900/90 to-zinc-800/80 shadow-2xl border border-zinc-800/70 items-center overflow-hidden">
      <div
        id="profile"
        className="w-full !flex flex-col font-[family-name:var(--font-geist-sans)] animate-fade-in-scale"
      >
        <ProfileHeader
          displayName={displayName}
          photoURL={photoURL}
          email={email}
          uid={profileUid}
          country={country}
          bio={bio}
          currentUserUid={user?.uid || ""}
          onEdit={isOwnProfile ? firebaseEditUserRedirect : undefined}
          onSaveBio={isOwnProfile ? handleSaveBio : undefined}
          isOwnProfile={isOwnProfile}
        />
        <div className="gap-4 sm:gap-0 flex flex-col flex-grow items-center justify-start sm:justify-start sm:items-start w-full mx-auto">
          <AIAssistantCard isOwnProfile={isOwnProfile} />
          <ProfileVehiclesSection
            uid={profileUid}
            letsAdd={isOwnProfile ? firebaseAddVehicleRedirect : undefined}
            isOwnProfile={isOwnProfile}
          />
        </div>
        <footer className="flex gap-[24px] justify-end w-full px-6 py-4 sm:px-12 sm:py-6">
          <p>IDMOTO 2025©</p>
        </footer>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense>
      <ProfileInner />
    </Suspense>
  );
}
