"use client";
import { cn } from "@/lib/utils";
import { User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HiHome, HiLogin, HiLogout, HiMenu, HiUser, HiX } from "react-icons/hi";
import { useAuth } from "./AuthProvider";
import { googleSignIn, logOut } from "./firebase-sign";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

function NavLink({
  href,
  icon,
  label,
  isActive,
  onClick,
  className,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 group relative overflow-hidden",
        "hover:bg-white/10 hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
        isActive && "bg-white/10 text-blue-400",
        className
      )}
    >
      {/* Background animation */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-200",
          "group-hover:opacity-100",
          isActive && "opacity-50"
        )}
      />

      {/* Content */}
      <span
        className={cn(
          "relative z-10 text-lg transition-colors duration-200",
          isActive ? "text-blue-400" : "text-zinc-300 group-hover:text-white"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "relative z-10 font-medium transition-colors duration-200",
          isActive ? "text-blue-400" : "text-zinc-300 group-hover:text-white"
        )}
      >
        {label}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
      )}
    </Link>
  );
}

interface AuthButtonProps {
  user: User | null;
  onAction: () => Promise<void>;
  loading: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

function AuthButton({
  user,
  onAction,
  loading,
  isMobile,
  onClick,
}: AuthButtonProps) {
  const handleClick = useCallback(async () => {
    onClick?.();
    await onAction();
  }, [onAction, onClick]);

  if (user) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
          "bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300",
          "border border-red-500/30 hover:border-red-400/50",
          "focus:outline-none focus:ring-2 focus:ring-red-400/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:scale-105 active:scale-95 cursor-pointer",
          isMobile && "w-full justify-center"
        )}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <HiLogout className="w-5 h-5" />
        )}
        <span className="font-medium">
          {loading ? "Signing out..." : "Log Out"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
        "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
        "text-white font-medium shadow-lg hover:shadow-xl",
        "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:scale-105 active:scale-95 cursor-pointer",
        isMobile && "w-full justify-center"
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <HiLogin className="w-5 h-5" />
      )}
      <span>{loading ? "Signing in..." : "Log In"}</span>
    </button>
  );
}

function UserAvatar({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
      <div className="relative">
        <Image
          src={user.photoURL || "/logo.png"}
          alt={user.displayName || "User"}
          width={32}
          height={32}
          className="rounded-full object-cover border-2 border-white/20"
        />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
      </div>
      <div className="block">
        <p className="text-sm font-medium text-white truncate max-w-24">
          {user.displayName || "User"}
        </p>
        <p className="text-xs text-zinc-400">Online</p>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenu(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenu]);

  const handleAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      if (user) {
        await logOut();
        router.push("/");
      } else {
        await googleSignIn();
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setAuthLoading(false);
    }
  }, [user, router]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenu(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenu((prev) => !prev);
  }, []);

  return (
    <>
      <header
        id="navbar"
        className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-900/60"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="IDMOTO"
                width={120}
                height={32}
                priority
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                href="/feed"
                icon={<HiHome />}
                label="Feed"
                isActive={pathname === "/feed"}
              />

              {user && (
                <NavLink
                  href={`/profile?uid=${user.uid}`}
                  icon={<HiUser />}
                  label="Profile"
                  isActive={pathname === "/profile"}
                />
              )}
            </nav>

            {/* Desktop Auth & User */}
            <div className="hidden md:flex items-center gap-4">
              <AuthButton
                user={user}
                onAction={handleAuth}
                loading={authLoading}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              aria-label={mobileMenu ? "Close menu" : "Open menu"}
            >
              {mobileMenu ? (
                <HiX className="w-6 h-6 text-zinc-300" />
              ) : (
                <HiMenu className="w-6 h-6 text-zinc-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <Image
                  src="/logo.png"
                  alt="IDMOTO"
                  width={96}
                  height={24}
                  className="h-6 w-auto"
                />
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <HiX className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-white/10">
                  <UserAvatar user={user} />
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                <NavLink
                  href="/feed"
                  icon={<HiHome />}
                  label="Feed"
                  isActive={pathname === "/feed"}
                  onClick={closeMobileMenu}
                  className="w-full"
                />

                {user && (
                  <NavLink
                    href={`/profile?uid=${user.uid}`}
                    icon={<HiUser />}
                    label="Profile"
                    isActive={pathname === "/profile"}
                    onClick={closeMobileMenu}
                    className="w-full"
                  />
                )}
              </nav>

              {/* Auth Button */}
              <div className="p-4 border-t border-white/10">
                <AuthButton
                  user={user}
                  onAction={handleAuth}
                  loading={authLoading}
                  isMobile
                  onClick={closeMobileMenu}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
