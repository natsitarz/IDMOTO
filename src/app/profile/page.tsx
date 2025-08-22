"use client";

import { useAuth } from "@/app/parts/AuthProvider";
import { db } from "@/app/parts/firebase";
import { ProfileHeader } from "@/app/parts/headerSection";
import { useShowMainDom } from "@/app/parts/showMainProf";
import { ProfileVehiclesSection } from "@/app/parts/vehicleSection";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Types for better type safety
interface ProfileData {
  bio: string;
  country: string;
  displayName: string;
  photoURL: string;
  email: string;
  joinedAt?: string;
  lastSeen?: string;
  vehicleCount?: number;
}

interface RecentActivity {
  id: string;
  type: "vehicle_added" | "post_created" | "profile_updated";
  timestamp: string;
  description: string;
  icon: string;
}

// Enhanced loading skeleton with smoother animations
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Smooth hero skeleton with shimmer effect */}
        <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 animate-pulse border border-white/10 overflow-hidden">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
            <div className="w-24 sm:w-28 h-24 sm:h-28 bg-white/10 rounded-full shrink-0 animate-pulse" />
            <div className="flex-1 space-y-3 sm:space-y-4 text-center lg:text-left w-full">
              <div className="h-6 sm:h-8 bg-white/10 rounded-xl w-48 sm:w-60 mx-auto lg:mx-0 animate-pulse" />
              <div className="h-3 sm:h-4 bg-white/10 rounded-lg w-32 sm:w-40 mx-auto lg:mx-0 animate-pulse" />
              <div className="h-10 sm:h-12 bg-white/10 rounded-2xl w-full max-w-sm mx-auto lg:mx-0 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quick overview skeleton with staggered animation */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 mb-8 sm:mb-12 animate-pulse border border-white/10">
          <div className="h-5 sm:h-6 bg-white/10 rounded w-32 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl p-4 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-3 sm:h-4 bg-white/10 rounded w-16 mb-2" />
                <div className="h-5 sm:h-6 bg-white/10 rounded w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Content skeleton with responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="h-32 sm:h-40 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
            <div className="h-64 sm:h-80 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="h-28 sm:h-32 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
            <div className="h-40 sm:h-48 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface Vehicle {
  manufacturer?: string;
  model?: string;
  createdAt?: { toDate?: () => Date };
  userID?: string;
  visibility?: string;
}

// Enhanced Profile Overview with better loading states
function ProfileOverview({
  uid,
  isOwnProfile,
}: {
  uid: string;
  isOwnProfile: boolean;
}) {
  const [overview, setOverview] = useState({
    vehicleCount: 0,
    favoriteVehicle: null as Vehicle | null,
    memberSince: "",
    recentActivity: [] as RecentActivity[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);

        // Smoother loading with staggered data fetching
        await new Promise((resolve) => setTimeout(resolve, 100));

        let vehiclesQuery;
        if (isOwnProfile) {
          vehiclesQuery = query(
            collection(db, "vehicles"),
            where("userID", "==", uid),
            orderBy("createdAt", "desc")
          );
        } else {
          vehiclesQuery = query(
            collection(db, "vehicles"),
            where("userID", "==", uid),
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc")
          );
        }

        const vehiclesSnapshot = await getDocs(vehiclesQuery);

        let favoriteVehicle = null;
        if (vehiclesSnapshot.docs.length > 0) {
          favoriteVehicle = vehiclesSnapshot.docs[0].data();
        }

        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();
        const memberSince = userData?.joinedAt;

        const recentActivity: RecentActivity[] = [
          {
            id: "1",
            type: "vehicle_added",
            timestamp: "2 days ago",
            description: "Added a new vehicle to garage",
            icon: "🚗",
          },
          {
            id: "2",
            type: "profile_updated",
            timestamp: "1 week ago",
            description: "Updated profile information",
            icon: "✏️",
          },
        ];

        setOverview({
          vehicleCount: vehiclesSnapshot.size,
          favoriteVehicle,
          memberSince,
          recentActivity,
        });
      } catch (error) {
        console.error("Error fetching overview:", error);
      } finally {
        // Smooth loading state transition
        setTimeout(() => setLoading(false), 300);
      }
    }

    if (uid) {
      fetchOverview();
    }
  }, [uid, isOwnProfile]);

  return (
    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 mb-8 sm:mb-12 border border-white/10 hover:border-white/20 transition-all duration-500">
      <header className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <svg
              className="w-4 sm:w-5 h-4 sm:h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </div>
          Profile Overview
        </h2>
        <p className="text-zinc-400 text-sm">Quick insights and highlights</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Garage Summary with loading state */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 sm:p-5 border border-white/10 transition-all duration-300 hover:border-white/20">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-base sm:text-lg">🏠</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm sm:text-base truncate">
                Garage
              </div>
              <div className="text-zinc-400 text-xs sm:text-sm truncate">
                {isOwnProfile ? "Your collection" : "Public vehicles"}
              </div>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">
            {loading ? (
              <div className="w-8 h-6 bg-blue-400/20 rounded animate-pulse"></div>
            ) : (
              overview.vehicleCount
            )}
          </div>
          <div className="text-zinc-400 text-xs">
            {overview.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
          </div>
        </div>

        {/* Featured Vehicle with loading state */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-4 sm:p-5 border border-white/10 transition-all duration-300 hover:border-white/20">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <span className="text-base sm:text-lg">⭐</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm sm:text-base truncate">
                Featured
              </div>
              <div className="text-zinc-400 text-xs sm:text-sm truncate">
                Latest addition
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-400 mb-1 truncate">
            {loading ? (
              <div className="w-16 h-5 bg-emerald-400/20 rounded animate-pulse"></div>
            ) : (
              overview.favoriteVehicle?.manufacturer || "No vehicles"
            )}
          </div>
          <div className="text-zinc-400 text-xs truncate">
            {loading ? (
              <div className="w-12 h-3 bg-zinc-600 rounded animate-pulse"></div>
            ) : (
              overview.favoriteVehicle?.model ||
              (isOwnProfile ? "Add your first vehicle" : "No public vehicles")
            )}
          </div>
        </div>

        {/* Member Info with loading state */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 sm:p-5 border border-white/10 transition-all duration-300 hover:border-white/20 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-base sm:text-lg">🎖️</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm sm:text-base truncate">
                Member
              </div>
              <div className="text-zinc-400 text-xs sm:text-sm truncate">
                Since
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-purple-400 mb-1">
            {loading ? (
              <div className="w-20 h-5 bg-purple-400/20 rounded animate-pulse"></div>
            ) : (
              overview.memberSince || "Recently"
            )}
          </div>
          <div className="text-zinc-400 text-xs">IDMOTO Community</div>
        </div>
      </div>
    </section>
  );
}

// Enhanced Recent Activity with better mobile layout
function RecentActivityCard({
  uid,
  isOwnProfile,
}: {
  uid: string;
  isOwnProfile: boolean;
}) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true);

        let vehiclesQuery;
        if (isOwnProfile) {
          vehiclesQuery = query(
            collection(db, "vehicles"),
            where("userID", "==", uid),
            orderBy("createdAt", "desc"),
            limit(3)
          );
        } else {
          vehiclesQuery = query(
            collection(db, "vehicles"),
            where("userID", "==", uid),
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc"),
            limit(3)
          );
        }

        const vehiclesSnapshot = await getDocs(vehiclesQuery);

        const recentActivities: RecentActivity[] = vehiclesSnapshot.docs.map(
          (doc) => {
            const data = doc.data();
            const timestamp = data.createdAt?.toDate?.();
            const timeAgo = timestamp ? getTimeAgo(timestamp) : "Recently";

            return {
              id: doc.id,
              type: "vehicle_added",
              timestamp: timeAgo,
              description: `Added ${data.manufacturer} ${data.model}`,
              icon: "🚗",
            };
          }
        );

        setActivities(recentActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
      } finally {
        setTimeout(() => setLoading(false), 200);
      }
    }

    if (uid) {
      fetchActivities();
    }
  }, [uid, isOwnProfile]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-500">
      <header className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
          <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-r from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <svg
              className="w-3 sm:w-4 h-3 sm:h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          Recent Activity
        </h2>
        <p className="text-zinc-400 text-sm">
          {isOwnProfile ? "Your recent updates" : "Latest public activity"}
        </p>
      </header>

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          // Enhanced loading skeleton
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 sm:h-4 bg-white/10 rounded w-3/4" />
                <div className="h-2 sm:h-3 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-white/20 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-base sm:text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm sm:text-base truncate">
                  {activity.description}
                </div>
                <div className="text-zinc-400 text-xs sm:text-sm">
                  {activity.timestamp}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl opacity-50">📝</span>
            </div>
            <div className="text-zinc-400 text-sm">
              {isOwnProfile
                ? "No recent activity"
                : "No public activity to show"}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Enhanced Activity Hub with better mobile UX
function ActivityHubCard({
  isOwnProfile,
  onEdit,
  onAddVehicle,
}: {
  isOwnProfile: boolean;
  onEdit?: () => void;
  onAddVehicle?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async (action: () => void | undefined) => {
    if (!action) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    action();
    setLoading(false);
  }, []);

  const activities = isOwnProfile
    ? [
        {
          title: "New Vehicle",
          description: "Add to your garage",
          icon: (
            <svg
              className="w-4 sm:w-5 h-4 sm:h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 1-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m6-3V9a2.25 2.25 0 0 1 2.25-2.25h.188a2.25 2.25 0 0 1 1.935 1.088L9.25 7.5m6 0v3.375c0 .621-.504 1.125-1.125 1.125H12.25m0 0a.375.375 0 0 0-.375.375v3m0 0h5.625c.621 0 1.125-.504 1.125-1.125V12m0 0v-.375a.375.375 0 0 0-.375-.375H12"
              />
            </svg>
          ),
          onClick: onAddVehicle,
          gradient: "from-emerald-600 to-green-700",
          hoverShadow: "hover:shadow-lg hover:shadow-emerald-500/25",
        },
        {
          title: "Settings",
          description: "Privacy & account settings",
          icon: (
            <svg
              className="w-4 sm:w-5 h-4 sm:h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          ),
          onClick: onEdit,
          gradient: "from-slate-500 to-gray-500",
          hoverShadow: "hover:shadow-lg hover:shadow-slate-500/25",
        },
      ]
    : [];

  return (
    isOwnProfile && (
      <section
        className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-500"
        aria-labelledby="activity-hub-heading"
      >
        <header className="mb-4 sm:mb-6">
          <h2
            id="activity-hub-heading"
            className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3"
          >
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <svg
                className="w-3 sm:w-4 h-3 sm:h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
            Actions
          </h2>
          <p className="text-zinc-400 text-sm">Manage your profile</p>
        </header>

        <div className="space-y-3 sm:space-y-4">
          {activities.map((activity, index) => (
            <button
              key={index}
              onClick={() => handleAction(activity.onClick ?? (() => {}))}
              disabled={loading}
              className={`cursor-pointer w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r ${activity.gradient} rounded-2xl transition-all duration-300 ${activity.hoverShadow} hover:scale-[1.02] group/action disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center text-white group-hover/action:scale-110 transition-transform backdrop-blur-sm flex-shrink-0">
                {loading ? (
                  <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  activity.icon
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-white font-semibold text-base sm:text-lg truncate">
                  {activity.title}
                </div>
                <div className="text-white/80 text-sm truncate">
                  {activity.description}
                </div>
              </div>
              <svg
                className="w-4 sm:w-5 h-4 sm:h-5 text-white/60 group-hover/action:text-white group-hover/action:translate-x-1 transition-all flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          ))}
        </div>
      </section>
    )
  );
}

// Enhanced Error Component with better mobile design
function ProfileNotFound() {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    action();
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100dvh-67px)] flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 sm:px-6">
      <div className="text-center max-w-md sm:max-w-lg">
        <div className="w-20 sm:w-28 h-20 sm:h-28 mx-auto mb-6 sm:mb-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 backdrop-blur-sm">
          <svg
            className="w-10 sm:w-14 h-10 sm:h-14 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
          Profile Not Found
        </h1>
        <p className="text-zinc-400 mb-8 sm:mb-10 leading-relaxed text-base sm:text-lg px-2">
          The profile you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => handleAction(() => window.history.back())}
            disabled={loading}
            className="cursor-pointer px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-medium transition-all border border-white/20 hover:border-white/30 backdrop-blur-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Go Back"}
          </button>
          <button
            onClick={() => handleAction(() => (window.location.href = "/feed"))}
            disabled={loading}
            className="cursor-pointer px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Loading..." : "Feed"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Profile Component with enhanced loading and responsive design
function ProfileInner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading, initialized } = useAuth();
  useShowMainDom(user);
  const profileUid = searchParams.get("uid") || user?.uid || "";
  const isOwnProfile = !!user && user.uid === profileUid;

  const [profileData, setProfileData] = useState<ProfileData>({
    bio: "",
    country: "",
    displayName: "Loading…",
    photoURL: "/logo.png",
    email: "Loading…",
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const router = useRouter();

  // Memoized page title for SEO
  const pageTitle = useMemo(() => {
    if (loading) return "Loading Profile | IDMOTO";
    if (notFound) return "Profile Not Found | IDMOTO";
    if (isOwnProfile) return "My Profile | IDMOTO";
    return `${profileData.displayName}'s Profile | IDMOTO`;
  }, [loading, notFound, isOwnProfile, profileData.displayName]);

  // Email verification warning
  useEffect(() => {
    if (user && isOwnProfile && !user.emailVerified) {
      window.dispatchEvent(
        new CustomEvent("show-global-warning", {
          detail: 'Please verify your email in "Edit Profile"',
        })
      );
    }
  }, [user, isOwnProfile]);

  // Enhanced profile data fetching with better loading states
  useEffect(() => {
    // If auth is still loading, don't make any decisions yet
    if (!initialized) {
      setLoading(true);
      setNotFound(false);
      return;
    }

    // If user is logged in but no UID in URL, redirect to user's own profile
    if (user && !searchParams.get("uid")) {
      router.replace(`/profile?uid=${user.uid}`);
      return;
    }

    // If no UID in URL and user is null (not logged in), show not found
    if (!searchParams.get("uid") && !user) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (!profileUid) {
      setLoading(false);
      return;
    }

    async function fetchUserData() {
      try {
        setLoading(true);

        // Smoother loading with artificial delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 200));

        const userDoc = await getDoc(doc(db, "users", profileUid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            bio: data.bio || "",
            country: data.country || "",
            displayName: data.displayName || "Anonymous User",
            photoURL: data.photoURL || "/logo.png",
            email: data.email || "No email",
            joinedAt: data.joinedAt,
            lastSeen:
              data.lastSeen?.toDate?.()?.toISOString?.() ||
              new Date().toISOString(),
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setNotFound(true);
      } finally {
        // Smooth transition out of loading state
        setTimeout(() => setLoading(false), 400);
      }
    }

    fetchUserData();
  }, [profileUid, user, searchParams, router, initialized]);

  const handleSaveBio = useCallback(
    async (newBio: string) => {
      if (!profileUid) return;
      try {
        await updateDoc(doc(db, "users", profileUid), { bio: newBio });
        setProfileData((prev) => ({ ...prev, bio: newBio }));
        window.dispatchEvent(
          new CustomEvent("show-global-success", {
            detail: "Bio updated successfully!",
          })
        );
      } catch {
        window.dispatchEvent(
          new CustomEvent("show-global-error", {
            detail: "Failed to update bio",
          })
        );
      }
    },
    [profileUid]
  );

  const handleEditProfile = useCallback(() => {
    router.push("/profile/edit/");
  }, [router]);

  const handleAddVehicle = useCallback(() => {
    router.push("/add/");
  }, [router]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (notFound) {
    return <ProfileNotFound />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profileData.displayName,
      image: profileData.photoURL,
      description: profileData.bio,
      url: `https://idmoto.vercel.app/profile?uid=${profileUid}`,
      sameAs: [`https://idmoto.vercel.app/profile?uid=${profileUid}`],
    },
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={
            profileData.bio ||
            `${profileData.displayName}'s profile on IDMOTO - The ultimate car social network`
          }
        />
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content={
            profileData.bio ||
            `Check out ${profileData.displayName}'s vehicles and automotive journey on IDMOTO`
          }
        />
        <meta property="og:image" content={profileData.photoURL} />
        <meta
          property="og:url"
          content={`https://idmoto.vercel.app/profile?uid=${profileUid}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta
          name="twitter:description"
          content={
            profileData.bio || `${profileData.displayName}'s automotive profile`
          }
        />
        <meta name="twitter:image" content={profileData.photoURL} />
        <link
          rel="canonical"
          href={`https://idmoto.vercel.app/profile?uid=${profileUid}`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 bg-fixed">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Enhanced Profile Header with better mobile spacing */}
          <header className="mb-8 sm:mb-12">
            <div className="animate-fade-in">
              <ProfileHeader
                displayName={profileData.displayName}
                photoURL={profileData.photoURL}
                email={profileData.email}
                uid={profileUid}
                country={profileData.country}
                bio={profileData.bio}
                currentUserUid={user?.uid || ""}
                onEdit={isOwnProfile ? handleEditProfile : undefined}
                onSaveBio={isOwnProfile ? handleSaveBio : undefined}
                isOwnProfile={isOwnProfile}
              />
            </div>
          </header>

          {/* Enhanced Profile Overview with staggered animations */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <ProfileOverview uid={profileUid} isOwnProfile={isOwnProfile} />
          </div>

          {/* Main Content Grid with responsive spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content with animation */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <section
                className="backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <ProfileVehiclesSection
                  uid={profileUid}
                  letsAdd={isOwnProfile ? handleAddVehicle : undefined}
                  isOwnProfile={isOwnProfile}
                />
              </section>
            </div>

            {/* Enhanced Sidebar with staggered animations */}
            <aside className="space-y-4 sm:space-y-6">
              {/* Profile Info Card */}
              <section
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <svg
                      className="w-3 sm:w-4 h-3 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                  </div>
                  Profile Info
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 transition-all hover:border-white/20">
                    <span className="text-base sm:text-lg">📍</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-zinc-400 text-xs">Location</div>
                      <div className="text-white font-medium text-sm truncate">
                        {profileData?.country || "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 transition-all hover:border-white/20">
                    <span className="text-base sm:text-lg">📅</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-zinc-400 text-xs">Member since</div>
                      <div className="text-white font-medium text-sm truncate">
                        {profileData?.joinedAt || "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div
                className="animate-fade-in"
                style={{ animationDelay: "400ms" }}
              >
                <ActivityHubCard
                  isOwnProfile={isOwnProfile}
                  onEdit={handleEditProfile}
                  onAddVehicle={handleAddVehicle}
                />
              </div>

              <div
                className="animate-fade-in"
                style={{ animationDelay: "500ms" }}
              >
                <RecentActivityCard
                  uid={profileUid}
                  isOwnProfile={isOwnProfile}
                />
              </div>
            </aside>
          </div>

          {/* Enhanced Footer */}
          <footer
            className="mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-white/10 text-center animate-fade-in"
            style={{ animationDelay: "600ms" }}
          >
            <p className="text-zinc-500 text-sm">
              © 2025 IDMOTO • Building the future of automotive social
              networking
            </p>
          </footer>
        </div>
      </main>

      {/* Enhanced custom styles for animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-in {
          animation-fill-mode: forwards;
        }

        .fade-in-0 {
          opacity: 0;
        }

        .slide-in-from-bottom-2 {
          transform: translateY(8px);
        }

        /* Enhanced scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(39, 39, 42, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(113, 113, 122, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 113, 122, 0.7);
        }
      `}</style>
    </>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileInner />
    </Suspense>
  );
}
