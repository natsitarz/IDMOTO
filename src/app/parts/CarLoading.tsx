"use client";

export default function CarLoading() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <div className="bg-white/10 border border-blue-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg
          className="w-10 h-10 text-blue-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-lg font-semibold text-blue-400">
          Loading car data...
        </span>
      </div>
    </div>
  );
}
