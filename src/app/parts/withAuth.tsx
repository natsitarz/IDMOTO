"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface WithAuthProps {
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  const { fallback, redirectTo = "/" } = options;

  return function WithAuthComponent(props: P) {
    const { user, loading, initialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (initialized && !user) {
        router.push(redirectTo);
      }
    }, [user, initialized, router]);

    // Show loading while auth is initializing
    if (loading || !initialized) {
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center bg-zinc-900">
            <div className="flex flex-col items-center gap-4">
              <Image
                src="/logo.png"
                alt="IDMOTO"
                width={200}
                height={24}
                priority
                className="animate-pulse"
              />
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">Loading...</p>
            </div>
          </div>
        )
      );
    }

    // Show loading while redirecting unauthenticated users
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/logo.png"
              alt="IDMOTO"
              width={200}
              height={24}
              priority
              className="animate-pulse"
            />
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Redirecting...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook version for use in components
export function useAuthRequired(redirectTo: string = "/") {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.push(redirectTo);
    }
  }, [user, initialized, router, redirectTo]);

  return {
    user,
    loading: loading || !initialized,
    isAuthenticated: !!user && initialized,
  };
}
