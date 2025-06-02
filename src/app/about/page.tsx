"use client";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import the useRouter hook

export default function About() {
  const router = useRouter(); // Initialize the router
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 min-h-screen">
      <main className="animate-fade-in-scale flex flex-col gap-[32px] row-start-2 items-center text-center sm:justify-center">
        <Image
          className=""
          src="/logo.png"
          alt="IDMOTO logo"
          width={180}
          height={38}
          priority
        />
        <div className="flex flex-col">
          <p>
            App that lets you create profile for your car so you could show it
            to your friends and family.
          </p>
          <p>IDMOTO 2025©</p>
        </div>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 cursor-pointer"
          rel="noopener noreferrer"
          onClick={() => router.back()}
        >
          {"<"} Back
        </a>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
