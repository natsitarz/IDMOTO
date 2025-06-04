import { useEffect, useState } from "react";

export default function PageLoader({ loading }: { loading: boolean }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Wait for fade-out animation before removing from DOM
      const timeout = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timeout);
    } else {
      setVisible(true);
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800 transition-opacity duration-400 ${
        loading
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-lg font-semibold tracking-wide">
          Loading…
        </span>
      </div>
    </div>
  );
}
