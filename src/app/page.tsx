"use client";
import { auth } from "@/app/parts/firebase";
import {
  addUserToDB,
  checkUser,
  googleSignIn,
  redirectResults,
} from "@/app/parts/firebase-sign";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

checkUser();

export default function Signup() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    redirectResults();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Dodaj do bazy, jeśli trzeba
        await addUserToDB(firebaseUser);
        // Teraz przekieruj
        router.replace(`/profile?uid=${firebaseUser.uid}`);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 min-h-screen">
      <div className="animate-fade-in-scale">
        <main className="flex flex-col gap-8 items-center text-center justify-center bg-zinc-900/80 p-10 rounded-2xl shadow-2xl backdrop-blur-md">
          <Image
            src="/logo.png"
            alt="IDMOTO logo"
            width={180}
            height={38}
            priority
          />
          <p className="mb-2 tracking-[-.01em] text-white text-lg">
            Let's show the world your dream car!
          </p>
          <button
            id="google-sign-in"
            onClick={handleGoogleSignIn}
            className="cursor-pointer rounded-full border border-transparent transition-colors flex items-center justify-center bg-white text-zinc-900 gap-2 hover:bg-blue-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 font-semibold text-base h-12 px-6 shadow-lg"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              className="invert"
              src="/google.png"
              alt="Google icon"
              width={20}
              height={20}
            />
            Login with Google
          </button>
        </main>
        <footer className="flex gap-6 flex-wrap items-center justify-center mt-8 text-white">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="./about"
            rel="noopener noreferrer"
          >
            <Image src="/globe.svg" alt="Globe icon" width={16} height={16} />
            About
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://trello.com/invite/b/656277cfd965ba8603417a98/ATTI7564ed4eb22d52d71ffa754f87b1679e5EBFC037/idmoto"
            rel="noopener noreferrer"
          >
            <Image
              className="invert"
              src="/trello.png"
              alt="Trello icon"
              width={16}
              height={16}
            />
            Trello
          </a>
          <p>IDMOTO 2025©</p>
        </footer>
      </div>
    </div>
  );
}
