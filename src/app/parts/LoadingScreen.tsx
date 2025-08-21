import Image from "next/image";

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export default function LoadingScreen({
  message = "Loading...",
  showLogo = true,
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="flex flex-col items-center gap-4">
        {showLogo && (
          <Image
            src="/logo.png"
            alt="IDMOTO"
            width={200}
            height={24}
            priority
            className="animate-pulse"
          />
        )}
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">{message}</p>
      </div>
    </div>
  );
}
