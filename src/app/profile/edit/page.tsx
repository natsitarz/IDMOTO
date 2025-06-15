"use client";

import { useState } from "react";
import EditProfileAvatar from "./parts/EditProfileAvatar";
import EditProfileMain from "./parts/EditProfileMain";
import EditProfileSecurity from "./parts/EditProfileSecurity";
import EditProfileSocials from "./parts/EditProfileSocials";

const MENU = [
  { key: "main", label: "Profile" },
  { key: "avatar", label: "Avatar" },
  { key: "socials", label: "Social Links" },
  { key: "security", label: "Security" },
];

export default function EditProfilePage() {
  const [selected, setSelected] = useState("main");

  return (
    <div className="min-h-[calc(100vh-67px)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-4xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-0 flex flex-row items-stretch gap-0 animate-fade-in-scale relative overflow-hidden">
        {/* Decorative gradient circle */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        {/* Sidebar */}
        <aside className="flex flex-col gap-2 bg-zinc-900/80 border-r border-zinc-800/60 min-w-[160px] max-w-[180px] py-10 px-4 z-10">
          <h2 className="text-xs uppercase text-zinc-400 font-bold mb-2 tracking-widest pl-1">
            Edit Menu
          </h2>
          {MENU.map((item) => (
            <button
              key={item.key}
              className={`cursor-pointer text-left px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                selected === item.key
                  ? "bg-blue-600/80 text-white shadow"
                  : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
              }`}
              onClick={() => setSelected(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center p-10">
          {selected === "main" && <EditProfileMain />}
          {selected === "avatar" && <EditProfileAvatar />}
          {selected === "socials" && <EditProfileSocials />}
          {selected === "security" && <EditProfileSecurity />}
        </main>
      </div>
    </div>
  );
}
