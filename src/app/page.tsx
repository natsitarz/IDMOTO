"use client";

import { useAuth } from "@/app/parts/AuthProvider";
import {
  addUserToDB,
  googleSignIn,
  redirectResults,
} from "@/app/parts/firebase-sign";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Handle redirect results on mount
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        await redirectResults();
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };
    handleRedirect();
  }, []);

  // Redirect to feed if user is logged in
  useEffect(() => {
    if (!authLoading && user) {
      const addUserAndRedirect = async () => {
        try {
          await addUserToDB(user);
          router.replace("/feed");
        } catch (error) {
          console.error("Error adding user to DB:", error);
        }
      };
      addUserAndRedirect();
    }
  }, [user, authLoading, router]);

  // Mobile detection with debounced resize
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 100);
    };

    // Initial check
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await googleSignIn();
    } catch (error) {
      console.error("Sign in error:", error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="relative min-h-[calc(100dvh)] w-full flex items-center justify-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 bg-fixed z-0" />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="IDMOTO"
            width={280}
            height={32}
            priority
            className="animate-pulse"
          />
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh)] w-full flex items-center justify-center overflow-hidden bg-zinc-900">
      {/* Video background with fallback */}
      {!videoError ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleVideoError}
          preload="metadata"
        >
          <source
            src={isMobile ? "/mobile-bg.mp4" : "/login-bg.mp4"}
            type="video/mp4"
          />
        </video>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900 via-zinc-900 to-cyan-900 z-0" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-1 items-center justify-center sm:justify-start w-full">
        <main className="w-full sm:w-[400px] min-h-screen sm:h-screen flex flex-col justify-between items-center bg-black/60 sm:bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 shadow-2xl transition-all mx-auto sm:mx-0 relative overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <header className="flex flex-col items-center w-full gap-8 mt-4 relative z-10">
            <Image
              src="/logo.png"
              alt="IDMOTO - Car Social Network"
              width={340}
              height={38}
              priority
              className="mb-2 transition-transform hover:scale-105"
            />
            <h1 className="text-xl font-extrabold text-white tracking-tight text-center bg-gradient-to-r from-white to-zinc-300 bg-clip-text">
              Show off your ride!
            </h1>
            <p className="text-zinc-400 text-center text-sm leading-relaxed">
              Join the ultimate car community. Share your passion, connect with
              enthusiasts, and showcase your automotive journey.
            </p>
          </header>

          {/* Sign in section */}
          <section className="flex flex-col items-center w-full gap-6 flex-1 justify-center relative z-10">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="cursor-pointer w-full flex items-center justify-center gap-3 rounded-full bg-white text-zinc-900 font-semibold text-base h-12 px-4 shadow-lg transition-all duration-200 hover:bg-zinc-100 hover:shadow-xl hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400/50 active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Sign in with Google"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-600 rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Image
                    src="/google.png"
                    alt="Google"
                    width={22}
                    height={22}
                    className="transition-transform group-hover:scale-110"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="text-zinc-400 text-xs text-center">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full flex gap-6 flex-wrap items-center justify-center text-zinc-400 text-sm border-t border-white/10 pt-6 mt-4 relative z-10">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-white transition-colors"
              href="/about"
              rel="noopener noreferrer"
            >
              <Image src="/globe.svg" alt="" width={16} height={16} />
              About
            </a>
            <span className="text-zinc-600">|</span>
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-white transition-colors"
              href="https://discord.gg/3bh6wuQxNY"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="invert"
                src="/discord.png"
                alt=""
                width={16}
                height={16}
              />
              Discord
            </a>
            <span className="text-zinc-500 text-center">
              © 2025 IDMOTO • Building the future of automotive social
              networking
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
