"use client";

export default function FeedUnderMaintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-zinc-900 to-zinc-800 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center gap-6 bg-white/10 border border-blue-400/30 rounded-3xl px-10 py-12 shadow-2xl animate-fade-in-scale">
        <span className="inline-flex items-center justify-center rounded-full bg-blue-800/80 p-6 shadow-lg">
          <svg
            className="w-20 h-20 text-blue-300 drop-shadow-lg"
            fill="none"
            viewBox="0 0 64 64"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              className="opacity-30"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M32 18v16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              stroke="currentColor"
            />
            <circle cx="32" cy="44" r="2.5" fill="currentColor" />
            <path
              className="animate-spin origin-center"
              d="M32 8a24 24 0 1 1-17 7"
              stroke="#60a5fa"
              strokeWidth={4}
              strokeLinecap="round"
            />
          </svg>
        </span>
        <h1 className="text-4xl font-extrabold text-blue-300 drop-shadow text-center">
          Under Maintenance
        </h1>
        <p className="text-lg text-zinc-200 text-center max-w-md">
          The feed is currently being upgraded for a better experience.
          <br />
          Please check back soon!
        </p>
        <div className="flex gap-3 mt-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-700/80 text-white font-semibold shadow">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-30"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            We'll be back soon!
          </span>
        </div>
      </div>
    </div>
  );
}
