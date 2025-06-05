import React, { useEffect } from "react";

export default function ErrorWrapper({
  message,
  type = "error",
  onClose,
  duration = 4000,
  className = "",
}: {
  message: string | null;
  type?: "error" | "success" | "info" | "warning";
  onClose?: () => void;
  duration?: number;
  className?: string;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bg = "bg-red-500";
  let border = "border-red-700";
  let icon = (
    <svg
      className="w-5 h-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
  if (type === "success") {
    bg = "bg-green-500";
    border = "border-green-700";
    icon = (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === "info") {
    bg = "bg-blue-500";
    border = "border-blue-700";
    icon = (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4m0 4h.01"
        />
      </svg>
    );
  }
  if (type === "warning") {
    bg = "bg-yellow-400";
    border = "border-yellow-600";
    icon = (
      <svg
        className="w-5 h-5 text-yellow-900"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v4m0 4h.01"
        />
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  }

  return (
    <div
      className={`font-[family-name:var(--font-geist-sans)] fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${bg} ${border} text-white animate-fade-in-scale ${
        className || ""
      }`}
    >
      {icon}
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-white/70 hover:text-white transition"
        >
          ×
        </button>
      )}
    </div>
  );
}
