"use client";

import { db } from "@/app/parts/firebase";
import { useFirebaseUser } from "@/app/parts/firebase-use-user";
import { useShowMainDom } from "@/app/parts/showMainProf";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { ProfileHeader } from "./headerSection";
import { ProfileVehiclesSection } from "./vehicleSection";

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

  useEffect(() => {
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

  return (
    <div className="min-h-screen w-full flex items-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800">
      <div
        id="profile"
        className="w-full grid grid-rows-[auto,1fr,auto] min-h-screen p-8 gap-4 sm:p-8 font-[family-name:var(--font-geist-sans)] animate-fade-in-scale"
        style={{ minHeight: "100vh" }}
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
        <div>
          <AIAssistantCard isOwnProfile={isOwnProfile} />
          <ProfileVehiclesSection
            uid={profileUid}
            letsAdd={isOwnProfile ? firebaseAddVehicleRedirect : undefined}
            isOwnProfile={isOwnProfile}
          />
        </div>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
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
