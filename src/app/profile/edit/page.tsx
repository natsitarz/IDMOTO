"use client";

import { useState } from "react";
import EditProfileAvatar from "./parts/EditProfileAvatar";
import EditProfileMain from "./parts/EditProfileMain";
import EditProfileSecurity from "./parts/EditProfileSecurity";
import EditProfileSocials from "./parts/EditProfileSocials";

const PROFILE_MENU = [{ key: "main", label: "Profile" }];

export default function EditProfilePage() {
  const [selected, setSelected] = useState("main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-[calc(100dvh-67px)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-4xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 rounded-3xl shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-0 flex flex-col md:flex-row items-stretch gap-0 animate-fade-in-scale relative overflow-hidden">
        {/* MOBILE MENU */}
        <div className="md:hidden w-full border-b border-zinc-800/60 bg-zinc-900/80 z-30 relative">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-white font-semibold text-base focus:outline-none cursor-pointer"
            onClick={() => setMobileMenuOpen((v) => !v)}
            type="button"
          >
            {PROFILE_MENU.find((m) => m.key === selected)?.label}
            <svg
              className={`ml-2 w-5 h-5 transition-transform ${
                mobileMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center"
              style={{ pointerEvents: "auto" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40"
                aria-hidden="true"
              />
              {/* Dropdown */}
              <div
                className="relative w-full mx-auto bg-zinc-900/95 border border-zinc-800/60 shadow-xl flex flex-col overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {PROFILE_MENU.map((item) => (
                  <button
                    key={item.key}
                    className={`w-full text-left px-4 py-3 font-semibold transition cursor-pointer
                      ${
                        selected === item.key
                          ? "bg-blue-600/80 text-white"
                          : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                      }`}
                    onClick={() => {
                      setSelected(item.key);
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP MENU */}
        <aside className="hidden md:flex flex-col gap-2 bg-zinc-900/80 border-r border-zinc-800/60 min-w-[160px] max-w-[180px] py-10 px-4 z-10">
          <h2 className="text-xs uppercase text-zinc-400 font-bold mb-2 tracking-widest pl-1">
            Profile Menu
          </h2>
          {PROFILE_MENU.map((item) => (
            <button
              key={item.key}
              className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-all text-sm cursor-pointer
                ${
                  selected === item.key
                    ? "bg-blue-600/80 text-white shadow"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                }`}
              style={{ minWidth: 0 }}
              onClick={() => setSelected(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 w-full">
          {selected === "main" && <EditProfileMain />}
          {selected === "avatar" && <EditProfileAvatar />}
          {selected === "socials" && <EditProfileSocials />}
          {selected === "security" && <EditProfileSecurity />}
        </main>
      </div>
    </div>
  );
}
