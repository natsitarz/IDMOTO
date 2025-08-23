import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";

interface SeePhotoProps {
  src: string;
  alt?: string;
  className?: string;
  thumbWidth?: number;
  thumbHeight?: number;
}

export default function SeePhoto({
  src,
  alt = "",
  className = "",
  thumbWidth = 840,
  thumbHeight = 840,
}: SeePhotoProps) {
  const [open, setOpen] = useState(false);

  // Prevent background scroll when modal is open
  if (typeof window !== "undefined") {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  const modal = open
    ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div
            className="relative flex items-center justify-center"
            style={{
              minHeight: "100vh",
              minWidth: "100vw",
            }}
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          >
            <button
              className="cursor-pointer absolute top-4 right-4 text-white text-3xl bg-black/60 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/80 z-50"
              onClick={() => setOpen(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <Image
              src={src}
              alt={alt}
              width={900}
              height={700}
              className="rounded max-w-[90vw] max-h-[80vh] object-contain shadow-2xl"
              priority
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={thumbWidth}
        height={thumbHeight}
        className={`w-full h-full rounded cursor-pointer ${className}`}
        onClick={() => setOpen(true)}
        draggable={false}
      />
      {modal}
    </>
  );
}
