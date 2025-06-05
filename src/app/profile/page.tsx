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
          className="w-full max-w-sm sm:max-w-xl mx-auto my-4 flex items-center rounded-2xl shadow-lg px-2 py-2 sm:px-4 sm:py-2 gap-2"
          style={{
            background:
              "linear-gradient(120deg, #1e3a8a 0%, #2563eb 22%, #273c75 48%, #334155 75%, #1e3a8a 100%)",
            backgroundSize: "200% 200%",
            animation: "aiCardBgMove 18s ease-in-out infinite",
          }}
        >
          <span className="bg-blue-300 animate-pulse rounded-full p-1 flex items-center justify-center">
            {/* ...SVG... */}
            <span className="bg-blue-700 rounded-full p-1 flex items-center justify-center">
              {/* ...SVG... */}
            </span>
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isOwnProfile
                ? "Ask IDMOTO AI about your car…"
                : "Ask IDMOTO AI about this user's cars"
            }
            className="flex-1 bg-transparent outline-none text-white placeholder-zinc-300 px-2 text-sm sm:text-base"
          />
          <button
            type="submit"
            className="cursor-pointer ml-1 sm:ml-3 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg block text-xs sm:text-xs uppercase text-zinc-100 tracking-widest font-semibold transition"
          >
            Ask
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
    <div className="w-full flex items-start bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800">
      <div
        id="profile"
        className="w-full flex flex-col min-h-[calc(100vh-67px)] p-3 sm:gap-8 sm:p-8 font-[family-name:var(--font-geist-sans)] animate-fade-in-scale"
        style={{ display: "flex" }}
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
        <div className="flex flex-col flex-grow gap-6 sm:gap-0">
          <AIAssistantCard isOwnProfile={isOwnProfile} />
          <ProfileVehiclesSection
            uid={profileUid}
            letsAdd={isOwnProfile ? firebaseAddVehicleRedirect : undefined}
            isOwnProfile={isOwnProfile}
          />
        </div>
        <footer className="flex gap-[24px] flex-wrap items-center justify-center mt-8">
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
