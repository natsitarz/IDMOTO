"use client";

import { db, storage } from "@/app/parts/firebase";
import SeePhoto from "@/app/parts/see-photo";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);
  return { user, loading };
}

// Enhanced Modal with smooth animations
function AcceptModal({
  open,
  onAccept,
  onCancel,
  title,
  description,
  isLoading = false,
}: {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  isLoading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-white/20 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        {description && (
          <p className="text-zinc-300 mb-6 leading-relaxed">{description}</p>
        )}

        <div className="flex gap-3">
          <button
            className="cursor-pointer flex-1 px-4 py-3 rounded-2xl bg-zinc-700 text-white hover:bg-zinc-600 font-medium transition-all disabled:opacity-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={onAccept}
            disabled={isLoading}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Post Form with better loading states
function PostForm({
  onPost,
  currentUser,
}: {
  onPost: () => void;
  currentUser: User;
}) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // Rate limiting check
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const now = Date.now();
        let lastPost = 0;
        if (userSnap.exists() && userSnap.data().postCreatedAt) {
          lastPost = userSnap.data().postCreatedAt;
        }
        const diff = now - lastPost;
        if (diff < 60 * 1000) {
          const secondsLeft = Math.ceil((60 * 1000 - diff) / 1000);
          window.dispatchEvent(
            new CustomEvent("show-global-error", {
              detail: `Please wait ${secondsLeft}s before posting again`,
            })
          );
          return;
        }

        if (!text.trim() && !image) return;

        setUploading(true);
        setUploadProgress(20);

        // Add post to Firestore
        const postRef = await addDoc(collection(db, "posts"), {
          text: text.trim(),
          userId: currentUser.uid,
          userName: currentUser.displayName || "User",
          userPhoto: currentUser.photoURL || "/logo.png",
          createdAt: serverTimestamp(),
          imageUrl: "",
          likes: [],
        });

        setUploadProgress(60);

        let imageUrl = "";
        // Upload image if provided
        if (image) {
          const imgRef = storageRef(storage, `posts/${postRef.id}/image`);
          await uploadBytes(imgRef, image);
          imageUrl = await getDownloadURL(imgRef);
          await updateDoc(postRef, { imageUrl });
        }

        setUploadProgress(90);

        // Update user's last post timestamp
        await setDoc(userRef, { postCreatedAt: Date.now() }, { merge: true });

        setUploadProgress(100);

        // Reset form
        setText("");
        setImage(null);
        onPost();

        window.dispatchEvent(
          new CustomEvent("show-global-success", {
            detail: "Post shared successfully!",
          })
        );
      } catch (error) {
        console.error("Error creating post:", error);
        window.dispatchEvent(
          new CustomEvent("show-global-error", {
            detail: "Failed to create post. Please try again.",
          })
        );
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [text, image, currentUser, onPost]
  );

  const isDisabled = uploading || (!text.trim() && !image);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-300 hover:border-white/20 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <div className="relative">
          <Image
            src={currentUser.photoURL || "/logo.png"}
            alt={currentUser.displayName || "User"}
            width={48}
            height={48}
            className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12 border-2 border-white/20"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm sm:text-base">
            Share your thoughts
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm truncate">
            What&apos;s happening in your automotive world?
          </p>
        </div>
      </div>

      {/* Text Input */}
      <div className="relative mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="w-full rounded-2xl border border-white/20 bg-white/5 text-white px-4 py-3 sm:py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-500 resize-none text-sm sm:text-base"
          rows={3}
          placeholder="Share your car experiences, tips, or just say hello..."
          disabled={uploading}
        />
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          <span className="text-xs text-zinc-400 select-none">
            {text.length}/500
          </span>
          {text.length > 450 && (
            <div className="w-6 h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all"
                style={{ width: `${((text.length - 450) / 50) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {image && (
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 group">
          <Image
            src={URL.createObjectURL(image)}
            alt="Preview"
            fill
            className="object-cover rounded-2xl border border-white/20"
          />
          <button
            type="button"
            className="cursor-pointer absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-lg opacity-0 group-hover:opacity-100"
            onClick={() => setImage(null)}
            aria-label="Remove image"
            disabled={uploading}
          >
            ×
          </button>
          <div className="cursor-pointer absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Uploading...</span>
            <span className="text-sm text-blue-400">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">
            Add Photo
          </span>
          <span className="text-sm font-medium sm:hidden">Photo</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) setImage(e.target.files[0]);
          }}
          disabled={uploading}
        />

        <button
          type="submit"
          className="cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          disabled={isDisabled}
        >
          {uploading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <span className="text-sm sm:text-base">
            {uploading ? "Posting..." : "Share"}
          </span>
        </button>
      </div>
    </form>
  );
}

// Enhanced skeleton loading for posts with staggered animations
function PostSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-4 sm:p-6 mb-4 sm:mb-6 animate-pulse">
      {/* Header skeleton with staggered animation */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div
            className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-24 animate-pulse"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="h-3 bg-gradient-to-r from-white/10 to-white/5 rounded w-16 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>

      {/* Content skeleton with staggered lines */}
      <div className="space-y-2 mb-4">
        <div
          className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-full animate-pulse"
          style={{ animationDelay: "0.3s" }}
        />
        <div
          className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-3/4 animate-pulse"
          style={{ animationDelay: "0.4s" }}
        />
        <div
          className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded w-1/2 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Actions skeleton with final delay */}
      <div className="flex items-center gap-2">
        <div
          className="w-16 h-8 bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse"
          style={{ animationDelay: "0.7s" }}
        />
      </div>
    </div>
  );
}

// Extend Window type for adsbygoogle
declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

// Fixed Ad Component with proper client-side rendering
function AdPostCard() {
  const [mounted, setMounted] = useState(false);
  const adRef = useRef<HTMLElementTagNameMap["ins"] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      // Load AdSense script dynamically
      const script = document.createElement("script");
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1346635526682080";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      // Initialize ad after script loads
      script.onload = () => {
        try {
          if (window.adsbygoogle && adRef.current) {
            window.adsbygoogle.push({});
          }
        } catch (e) {
          console.log("AdSense error:", e);
        }
      };

      return () => {
        // Cleanup script if component unmounts
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [mounted]);

  // Don't render ads on server side
  if (!mounted) {
    return (
      <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-3xl border border-white/20 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <span className="text-emerald-400 text-xs">✨</span>
          </div>
          <span className="text-zinc-400 text-sm font-medium">Sponsored</span>
        </div>
        <div className="w-full h-24 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="hidden w-full max-w-xl mx-auto bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-3xl border border-white/20 p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <span className="text-emerald-400 text-xs">✨</span>
        </div>
        <span className="text-zinc-400 text-sm font-medium">Sponsored</span>
      </div>
      <div className="w-full flex justify-center min-h-[100px]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", minHeight: "100px" }}
          data-ad-client="ca-pub-1346635526682080"
          data-ad-slot="1287338924"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

// Enhanced Post Card with better interactions
function PostCard({
  post,
  onLike,
  onDelete,
  onEdit,
  isOwn,
  currentUser,
  showLike,
}: {
  post: any;
  onLike: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isOwn: boolean;
  currentUser: User | null;
  showLike: boolean;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const handleEdit = useCallback(async () => {
    setEditSaving(true);
    try {
      await updateDoc(doc(db, "posts", post.id), { text: editText.trim() });
      setEditing(false);
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Post updated successfully!",
        })
      );
      onEdit();
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update post",
        })
      );
    } finally {
      setEditSaving(false);
    }
  }, [editText, post.id, onEdit]);

  const handleLike = useCallback(async () => {
    if (!currentUser || liking) return;

    setLiking(true);
    try {
      await onLike();
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to update like",
        })
      );
    } finally {
      setLiking(false);
    }
  }, [currentUser, liking, onLike]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      if (post.imageUrl) {
        try {
          const imgRef = storageRef(storage, `posts/${post.id}/image`);
          await deleteObject(imgRef);
        } catch {
          console.log("Image already deleted or doesn't exist");
        }
      }

      await deleteDoc(doc(db, "posts", post.id));

      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Post deleted successfully!",
        })
      );

      onDelete();
      setShowDeleteModal(false);
    } catch {
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to delete post",
        })
      );
    } finally {
      setDeleting(false);
    }
  }, [post, onDelete]);

  const navigateToProfile = useCallback(() => {
    router.push(`/profile?uid=${post.userId}`);
  }, [router, post.userId]);

  const formatDate = useCallback((timestamp: any) => {
    if (!timestamp?.toDate) return "Recently";

    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }, []);

  const isLiked = post.likes?.includes(currentUser?.uid);
  const likeCount = post.likes?.length || 0;

  return (
    <article className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 p-4 sm:p-6 mb-4 sm:mb-6 group animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 sm:gap-4 mb-4">
        <button
          onClick={navigateToProfile}
          className="cursor-pointer relative group/avatar transition-transform hover:scale-105"
        >
          <Image
            src={post.userPhoto || "/logo.png"}
            alt={post.userName}
            width={48}
            height={48}
            className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12 border-2 border-white/20 group-hover/avatar:border-white/40 transition-colors"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
        </button>

        <div className="flex-1 min-w-0">
          <button
            onClick={navigateToProfile}
            className="cursor-pointer font-semibold text-white hover:text-blue-400 transition-colors truncate text-sm sm:text-base block text-left"
          >
            {post.userName}
          </button>
          <time className="text-xs sm:text-sm text-zinc-400 block">
            {formatDate(post.createdAt)}
          </time>
        </div>

        {isOwn && showLike && (
          <div className="relative">
            <button
              className="cursor-pointer p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-zinc-800/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl z-20 min-w-[140px] py-2 animate-scale-in">
                <button
                  className="cursor-pointer block w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                  onClick={() => {
                    setEditing(true);
                    setShowMenu(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                    Edit
                  </span>
                </button>
                <button
                  className="cursor-pointer block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    Delete
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="mb-4">
        {editing ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
            <div className="bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 w-full max-w-md animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Edit Post</h2>
              </div>

              <div className="relative mb-6">
                <textarea
                  className="w-full bg-white/5 text-white rounded-2xl p-4 border border-white/20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none transition-all backdrop-blur-sm"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={5}
                  maxLength={500}
                  autoFocus
                  placeholder="Edit your post..."
                  disabled={editSaving}
                />
                <span className="absolute bottom-3 right-4 text-xs text-zinc-400 select-none">
                  {editText.length}/500
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  className="cursor-pointer flex-1 px-4 py-3 rounded-2xl bg-zinc-700 text-white hover:bg-zinc-600 font-medium transition-all disabled:opacity-50"
                  onClick={() => setEditing(false)}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  className="cursor-pointer flex-1 px-4 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={handleEdit}
                  disabled={editSaving || editText.trim().length === 0}
                >
                  {editSaving && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white leading-relaxed whitespace-pre-line break-words text-sm sm:text-base">
            {post.text}
          </p>
        )}

        {post.imageUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
            <SeePhoto src={post.imageUrl} alt="Post image" />
          </div>
        )}
      </div>

      {/* Actions */}
      {showLike && (
        <footer className="flex items-center gap-4 pt-4 border-t border-white/10">
          <button
            className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-medium transition-all disabled:opacity-50 ${
              isLiked
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/20 hover:border-white/30"
            }`}
            onClick={handleLike}
            disabled={liking}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            {liking ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            )}
            <span>{isLiked ? "Liked" : "Like"}</span>
            {likeCount > 0 && (
              <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                {likeCount}
              </span>
            )}
          </button>
        </footer>
      )}

      {/* Delete Modal */}
      <AcceptModal
        open={showDeleteModal}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        onAccept={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={deleting}
      />
    </article>
  );
}

// Enhanced Empty State
function EmptyState({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="text-center py-16 sm:py-24">
      <div className="w-20 sm:w-28 h-20 sm:h-28 mx-auto mb-6 sm:mb-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
        <svg
          className="w-10 sm:w-14 h-10 sm:h-14 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
          />
        </svg>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
        No posts yet
      </h2>
      <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
        {isLoggedIn
          ? "Be the first to share something with the community! Start a conversation about cars, share your experiences, or just say hello."
          : "The community is just getting started. Log in to join the conversation and share your automotive passion."}
      </p>
    </div>
  );
}

// Main Feed Page Component
export default function FeedPage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadPosts = useCallback(() => {
    setPostsLoading(true);
    setPostsError(null);

    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          setPosts(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
          setPostsLoading(false);
        },
        (error) => {
          console.error("Error loading posts:", error);
          setPostsError("Failed to load posts. Please check your connection.");
          setPostsLoading(false);
        }
      );
      return unsub;
    } catch (error) {
      console.error("Error setting up posts listener:", error);
      setPostsError("Failed to load posts. Please try again.");
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const unsubscribe = loadPosts();
      return unsubscribe;
    }
  }, [loadPosts, mounted]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loadPosts();
    setRetrying(false);
  }, [loadPosts]);

  const handleLike = useCallback(
    async (post: any) => {
      if (!currentUser) return;

      const ref = doc(db, "posts", post.id);
      let likes: string[] = Array.isArray(post.likes) ? post.likes : [];

      if (likes.includes(currentUser.uid)) {
        likes = likes.filter((id) => id !== currentUser.uid);
      } else {
        likes = [...likes, currentUser.uid];
      }

      await updateDoc(ref, { likes });
    },
    [currentUser]
  );

  // Prepare feed items with ads (only on client side)
  const feedItems = React.useMemo(() => {
    if (!mounted || posts.length === 0) return [];

    const items: any[] = [];

    if (posts.length < 5) {
      // One ad at the top for small feeds
      items.push({ isAd: true, id: "ad-top" });
      items.push(...posts);
    } else {
      // Ad every 5 posts for larger feeds
      for (let i = 0; i < posts.length; i++) {
        if (i % 5 === 0) {
          items.push({ isAd: true, id: `ad-${i}` });
        }
        items.push(posts[i]);
      }
    }

    return items;
  }, [posts, mounted]);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <main className="min-h-[calc(100dvh-67px)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Community Feed
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Loading...
            </p>
          </header>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-67px)] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Post Form or Login Prompt */}
        {userLoading ? (
          <div className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 mb-8 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-32" />
                <div className="h-3 bg-white/10 rounded w-24" />
              </div>
            </div>
            <div className="h-20 bg-white/10 rounded-2xl mb-4" />
            <div className="flex justify-between">
              <div className="w-24 h-10 bg-white/10 rounded-2xl" />
              <div className="w-16 h-10 bg-white/10 rounded-2xl" />
            </div>
          </div>
        ) : currentUser ? (
          <PostForm onPost={() => {}} currentUser={currentUser} />
        ) : (
          <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl border border-blue-500/20 p-6 sm:p-8 mb-8 sm:mb-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Join the Conversation
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              Sign in to share your automotive stories, connect with
              enthusiasts, and be part of our growing community.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Sign In to Post
            </button>
          </div>
        )}

        {/* Posts Section */}
        <section className="w-full max-w-2xl mx-auto">
          {postsLoading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : postsError ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Oops! Something went wrong
              </h3>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                {postsError}
              </p>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {retrying && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {retrying ? "Retrying..." : "Try Again"}
              </button>
            </div>
          ) : feedItems.length === 0 ? (
            <EmptyState isLoggedIn={!!currentUser} />
          ) : (
            <div className="space-y-6">
              {feedItems.map((item, index) =>
                item.isAd ? (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <AdPostCard />
                  </div>
                ) : (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PostCard
                      post={item}
                      onLike={() => handleLike(item)}
                      onDelete={() => {}}
                      onEdit={() => {}}
                      isOwn={
                        currentUser ? item.userId === currentUser.uid : false
                      }
                      currentUser={currentUser}
                      showLike={!!currentUser}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 sm:mt-20 pt-8 border-t border-white/10">
          <p className="text-zinc-500 text-sm">
            © 2025 IDMOTO • Building the future of automotive social networking
          </p>
        </footer>
      </div>
      <style jsx global>{`
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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        /* Custom scrollbar */
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

        /* Focus styles for accessibility */
        .focus-visible\:ring-2:focus-visible {
          outline: 2px solid transparent;
          outline-offset: 2px;
          box-shadow: 0 0 0 2px rgb(59 130 246 / 0.5);
        }
      `}</style>
      ;
    </main>
  );
}
