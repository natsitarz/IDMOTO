import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer";
}

export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/10",
        variant === "shimmer" && "relative overflow-hidden",
        className
      )}
      {...props}
    >
      {variant === "shimmer" && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      )}
    </div>
  );
}

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer";
}

export function SkeletonCard({
  className,
  children,
  variant = "default",
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 sm:p-6 animate-pulse relative",
        variant === "shimmer" && "overflow-hidden",
        className
      )}
      {...props}
    >
      {variant === "shimmer" && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      )}
      {children}
    </div>
  );
}

export function SkeletonAvatar({
  size = "md",
  className,
  ...props
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-16 h-16 sm:w-20 sm:h-20",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
  ...props
}: {
  lines?: number;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full",
            i === 0 && lines > 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonButton({
  size = "md",
  className,
  ...props
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton
      className={cn("rounded-2xl", sizeClasses[size], className)}
      {...props}
    />
  );
}

export function SkeletonImage({
  aspect = "video",
  className,
  ...props
}: {
  aspect?: "square" | "video" | "portrait" | "auto";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  return (
    <Skeleton
      className={cn(
        "w-full rounded-2xl",
        aspectClasses[aspect],
        aspect === "auto" && "h-48",
        className
      )}
      {...props}
    />
  );
}

// Vehicle-specific skeleton components
export function VehicleCardSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden shadow-xl h-72 w-54 bg-zinc-900/50 border border-zinc-800 animate-pulse",
        className
      )}
      {...props}
    >
      {/* Background skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50" />

      {/* Content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}

// Post-specific skeleton component
export function PostSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <SkeletonCard
      className={cn("w-full max-w-xl mx-auto mb-4 sm:mb-6", className)}
      {...props}
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Content skeleton */}
      <SkeletonText lines={3} className="mb-4" />

      {/* Image skeleton (random) */}
      {Math.random() > 0.5 && <SkeletonImage className="mb-4" />}

      {/* Actions skeleton */}
      <div className="flex items-center gap-2">
        <SkeletonButton size="sm" />
      </div>
    </SkeletonCard>
  );
}

// Profile-specific skeleton component
export function ProfileSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950",
        className
      )}
      {...props}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero skeleton with shimmer effect */}
        <SkeletonCard
          className="mb-8 sm:mb-10 overflow-hidden"
          variant="shimmer"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
            <SkeletonAvatar size="lg" />
            <div className="flex-1 space-y-3 text-center lg:text-left">
              <Skeleton className="h-6 sm:h-8 w-48 sm:w-60 mx-auto lg:mx-0" />
              <Skeleton className="h-3 sm:h-4 w-32 sm:w-40 mx-auto lg:mx-0" />
              <Skeleton className="h-10 sm:h-12 w-full max-w-sm mx-auto lg:mx-0" />
            </div>
          </div>
        </SkeletonCard>

        {/* Quick overview skeleton */}
        <SkeletonCard className="mb-8 sm:mb-12">
          <Skeleton className="h-5 sm:h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard
                key={i}
                className="bg-white/5 rounded-2xl p-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-10" />
              </SkeletonCard>
            ))}
          </div>
        </SkeletonCard>

        {/* Content grid skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-32 sm:h-40 rounded-3xl" />
            <Skeleton className="h-64 sm:h-80 rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-28 sm:h-32 rounded-2xl" />
            <Skeleton className="h-40 sm:h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Car page skeleton components
export function CarPageSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative min-h-[calc(100dvh-67px)] bg-zinc-900 flex flex-col items-center",
        className
      )}
      {...props}
    >
      {/* Hero Section Skeleton */}
      <div className="relative w-full h-96 max-h-[420px] flex items-end justify-start overflow-hidden rounded-b-3xl shadow-xl mb-4 bg-white/5 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50" />

        {/* Action button skeleton */}
        <div className="absolute top-4 right-6 z-10">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>

        {/* Content skeleton */}
        <div className="relative p-8 w-full z-10">
          <div className="space-y-3 mb-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="w-full px-4 grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Car Info Skeleton */}
        <SkeletonCard className="animate-fade-in-up" />

        {/* Gallery Skeleton */}
        <SkeletonCard className="animate-fade-in-up">
          <div className="space-y-4">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonImage key={i} aspect="square" />
              ))}
            </div>
          </div>
        </SkeletonCard>

        {/* Specs Skeleton */}
        <SkeletonCard className="animate-fade-in-up col-span-1 md:col-span-2">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Logs Skeleton */}
        <SkeletonCard className="animate-fade-in-up col-span-1 md:col-span-2 mb-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-24" />
            <SkeletonButton size="sm" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard
                key={i}
                className="bg-white/5 rounded-xl p-4 space-y-3"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </SkeletonCard>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-6 right-6 bg-zinc-800/90 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl animate-fade-in z-[50]">
        <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        <span className="text-white text-sm font-medium">
          Loading vehicle...
        </span>
      </div>
    </div>
  );
}
