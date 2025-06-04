"use client";

export default function CarError({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            stroke="currentColor"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <span className="text-lg font-semibold text-red-400">{message}</span>
      </div>
    </div>
  );
}
