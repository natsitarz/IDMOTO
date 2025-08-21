"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function About() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-[calc(100dvh-67px)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 font-[family-name:var(--font-geist-sans)] relative overflow-hidden">
      <main className="relative z-10 flex flex-col gap-8 items-center text-center w-full max-w-lg bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-2xl border border-zinc-800/60 backdrop-blur-lg px-10 py-14 animate-fade-in-scale h-2/3">
        <Image
          className="mx-auto mb-2 drop-shadow-lg"
          src="/logo.png"
          alt="IDMOTO logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase drop-shadow mb-2">
          About IDMOTO
        </h1>
        <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed mb-2">
          <span className="block mb-2">
            <span className="text-blue-400 font-bold">IDMOTO</span> lets you
            create a beautiful, shareable profile for your car.
            <br />
            Show your ride to friends, family, and the world.
          </span>
          <span className="block text-zinc-400 text-sm mt-2">
            Designed for car enthusiasts, by car enthusiasts.
          </span>
        </p>
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="flex items-center justify-center gap-3">
            <a
              href="mailto:idmoto.poland@gmail.com"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-blue-600/80 text-blue-300 hover:text-white font-semibold transition shadow"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 12l-4-4-4 4m8 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
                />
              </svg>
              Contact
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-zinc-500 tracking-widest uppercase">
            IDMOTO 2025©
          </p>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4 cursor-pointer text-blue-400 hover:text-white transition text-xs mt-8"
            rel="noopener noreferrer"
            onClick={() => router.back()}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </a>
        </div>
      </main>
    </div>
  );
}
