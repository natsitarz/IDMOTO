"use client";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { googleSignIn, logOut } from "./firebase-sign";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    if (user) {
      logOut();
    } else {
      googleSignIn();
    }
  };

  return (
    <header
      id="navbar"
      className="flex items-center justify-between sm:p-4 p-2 box-border text-white z-50 w-full font-[family-name:var(--font-geist-sans)] bg-zinc-900/70"
    >
      <div className="items-center">
        <Image
          src="/logo.png"
          alt="IDMOTO logo"
          width={96}
          height={64}
          priority
        />
      </div>
      {/* Desktop nav */}
      <nav className="hidden sm:flex space-x-8">
        {user && (
          <>
            <a
              href="/feed"
              className="hidden hover:text-gray-400 cursor-pointer animate-fade-in-opacity uppercase text-zinc-100 tracking-widest font-bold"
            >
              Feed
            </a>
            <a
              href={`/profile?uid=${user.uid}`}
              className="hover:text-gray-400 cursor-pointer animate-fade-in-opacity block uppercase text-zinc-100 tracking-widest font-bold"
            >
              Profile
            </a>
          </>
        )}
        <button
          onClick={handleLogin}
          className="hover:text-gray-400 cursor-pointer animate-fade-in-opacity block uppercase text-zinc-100 tracking-widest font-bold"
        >
          {user ? "Log Out" : "Log In"}
        </button>
      </nav>
      {/* Mobile nav */}
      <div className="sm:hidden flex items-center">
        <button
          className="p-2 rounded-full hover:bg-zinc-800 transition"
          onClick={() => setMobileMenu((v) => !v)}
          aria-label="Open menu"
        >
          <FiMenu size={28} />
        </button>
        {mobileMenu && (
          <div className="fixed inset-0 z-[999] bg-black/60 flex flex-col items-end">
            <div className="w-2/3 max-w-xs bg-zinc-900 shadow-2xl h-full flex flex-col items-center gap-6 p-6 animate-slide-in-right">
              <button
                className="self-end text-zinc-400 hover:text-white text-2xl"
                onClick={() => setMobileMenu(false)}
                aria-label="Close menu"
              >
                ×
              </button>
              <div className="flex flex-col gap-4 w-full h-full mt-4">
                {user && (
                  <a
                    href={`/profile?uid=${user.uid}`}
                    className="block text-xl uppercase text-zinc-100 tracking-widest font-bold hover:text-gray-400 transition"
                    onClick={() => setMobileMenu(false)}
                  >
                    Profile
                  </a>
                )}
                <button
                  onClick={() => {
                    handleLogin();
                    setMobileMenu(false);
                  }}
                  className="w-full px-5 py-2 rounded-full bg-gradient-to-r from-zinc-700 to-zinc-800 font-semibold shadow hover:from-zinc-800 hover:to-zinc-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 block uppercase text-zinc-100 tracking-widest"
                >
                  {user ? "Log Out" : "Log In"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
