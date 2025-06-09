"use client";
import { auth } from "@/app/parts/firebase";
import {
  addUserToDB,
  googleSignIn,
  redirectResults,
} from "@/app/parts/firebase-sign";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Signup() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);

  // Detect mobile for background video
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    redirectResults();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await addUserToDB(firebaseUser);
        router.replace(`/profile?uid=${firebaseUser.uid}`);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        key={isMobile ? "mobile" : "desktop"}
      >
        <source
          src={isMobile ? "/mobile-bg.mp4" : "/login-bg.mp4"}
          type="video/mp4"
        />
        {/* fallback for browsers that don't support video */}
      </video>
      <div className="absolute inset-0 bg-black/50 z-10" />
      {/* Content */}
      <div className="relative z-20 flex flex-1 items-center justify-center sm:justify-start w-full">
        <aside
          className="
            w-full sm:w-[400px] h-full sm:h-screen
            flex flex-col
            justify-between
            items-center
            sm:bg-zinc-900/80
            bg-zinc-900/70
            border-none
            p-8 sm:p-12
            shadow-none
            transition-all
            sm:mr-0
            mx-auto
            sm:mx-0
            "
          style={{
            minHeight: "100vh",
            maxWidth: "100vw",
            boxSizing: "border-box",
          }}
        >
          {/* Top */}
          <div className="flex flex-col items-center w-full gap-8 mt-4">
            <Image
              src="/logo.png"
              alt="IDMOTO logo"
              width={340}
              height={38}
              priority
              className="mb-2"
            />
            <h1 className="text-xl font-extrabold text-white tracking-tight text-center">
              Show off your ride!
            </h1>
          </div>
          {/* Center */}
          <div className="flex flex-col items-center w-full gap-6 flex-1 justify-center">
            <button
              id="google-sign-in"
              onClick={handleGoogleSignIn}
              className="cursor-pointer w-full flex items-center justify-center gap-3 rounded-full bg-white text-zinc-900 font-semibold text-base h-12 px-4 shadow transition
    hover:bg-zinc-100 hover:shadow-lg hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400/30 active:scale-100"
              rel="noopener noreferrer"
            >
              <Image
                aria-hidden
                className="invert-0"
                src="/google.png"
                alt="Google icon"
                width={22}
                height={22}
              />
              <span>Login with Google</span>
            </button>
          </div>
          {/* Bottom */}
          <footer className="w-full flex gap-6 flex-wrap items-center justify-center text-zinc-400 text-sm border-t border-white/10 pt-6 mt-4">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="./about"
              rel="noopener noreferrer"
            >
              <Image src="/globe.svg" alt="Globe icon" width={16} height={16} />
              About
            </a>
            <span className="">|</span>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://discord.gg/3bh6wuQxNY"
              rel="noopener noreferrer"
            >
              <Image
                className="invert"
                src="/discord.png"
                alt="Discord icon"
                width={16}
                height={16}
              />
              Discord
            </a>
            <span className="inline sm:hidden">|</span>
            <span>IDMOTO 2025©</span>
          </footer>
        </aside>
      </div>
    </div>
  );
}
