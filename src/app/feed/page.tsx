"use client";

import { db, storage } from "@/app/parts/firebase";
import SeePhoto from "@/app/parts/see-photo";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
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
import React, { useEffect, useRef, useState } from "react";
import AdSenseFeedCard from "./parts/adSenseFeedCard";

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);
  return user;
}

function AcceptModal({
  open,
  onAccept,
  onCancel,
  title,
  description,
}: {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-[90vw] max-w-xs relative border border-zinc-700">
        <h2 className="text-lg font-bold mb-2 text-white">{title}</h2>
        {description && (
          <p className="text-zinc-300 mb-4 text-sm">{description}</p>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={onAccept}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setUploading(true);

    // 1. Add post to Firestore (get id)
    const postRef = await addDoc(collection(db, "posts"), {
      text,
      userId: currentUser.uid,
      userName: currentUser.displayName || "User",
      userPhoto: currentUser.photoURL || "/logo.png",
      createdAt: serverTimestamp(),
      imageUrl: "",
      likes: [],
    });

    let imageUrl = "";
    // 2. Upload image to Storage (if any)
    if (image) {
      const imgRef = storageRef(storage, `posts/${postRef.id}/image`);
      await uploadBytes(imgRef, image);
      imageUrl = await getDownloadURL(imgRef);
      // 3. Update Firestore post with imageUrl
      await updateDoc(postRef, { imageUrl });
    }

    setText("");
    setImage(null);
    setUploading(false);
    onPost();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto bg-zinc-900/80 rounded-2xl shadow border border-zinc-800 px-2 py-3 sm:px-4 sm:py-4 flex flex-col gap-3 mb-6 sm:mb-8"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Image
          src={currentUser.photoURL || "/logo.png"}
          alt={currentUser.displayName || "User"}
          width={36}
          height={36}
          className="rounded-full object-cover min-w-[36px] min-h-[36px] sm:w-10 sm:h-10"
        />
        <textarea
          className="flex-1 bg-transparent text-zinc-200 resize-none outline-none border-0 px-2 py-2 text-base placeholder-zinc-400"
          rows={2}
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          style={{ fontSize: "15px" }}
        />
      </div>
      {image && (
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <Image
            src={URL.createObjectURL(image)}
            alt="Preview"
            fill
            className="object-cover rounded-xl"
          />
          <button
            type="button"
            className="absolute top-1 right-1 bg-zinc-800/80 rounded-full p-1 text-white"
            onClick={() => setImage(null)}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 9.828M7 7h.01"
            />
          </svg>
          <span className="hidden xs:inline">Add Photo</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) setImage(e.target.files[0]);
          }}
        />
        <button
          type="submit"
          className="ml-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
          disabled={uploading || (!text.trim() && !image)}
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

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

  const handleEdit = async () => {
    await updateDoc(doc(db, "posts", post.id), { text: editText });
    setEditing(false);
    window.dispatchEvent(
      new CustomEvent("show-global-success", { detail: "Post edited!" })
    );
    onEdit();
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900/80 rounded-2xl shadow border border-zinc-800 mb-4 sm:mb-6 px-2 py-3 sm:px-4 sm:py-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 px-0 sm:px-2 pt-1 pb-2">
        <div
          className="cursor-pointer"
          onClick={() => router.push(`/profile?uid=${post.userId}`)}
        >
          <Image
            src={post.userPhoto || "/logo.png"}
            alt={post.userName}
            width={36}
            height={36}
            className="rounded-full object-cover min-w-[36px] min-h-[36px] sm:w-10 sm:h-10"
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span
            className="font-semibold text-zinc-100 cursor-pointer hover:underline truncate"
            onClick={() => router.push(`/profile?uid=${post.userId}`)}
            style={{ fontSize: "15px" }}
          >
            {post.userName}
          </span>
          <span className="text-xs text-zinc-400">
            {post.createdAt?.toDate
              ? post.createdAt.toDate().toLocaleString()
              : ""}
          </span>
        </div>
        {isOwn && showLike && (
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400"
              onClick={() => setShowMenu((v) => !v)}
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
              <div className="absolute right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg z-20 min-w-[120px]">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded-t-xl"
                  onClick={() => {
                    setEditing(true);
                    setShowMenu(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded-b-xl"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Content */}
      <div className="px-2 sm:px-2 pb-2">
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full bg-zinc-800 text-zinc-100 rounded-lg p-2"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              style={{ fontSize: "15px" }}
            />
            <div className="flex gap-2">
              <button
                className="px-4 py-1 rounded bg-blue-600 text-white font-semibold"
                onClick={handleEdit}
              >
                Save
              </button>
              <button
                className="px-4 py-1 rounded bg-zinc-700 text-zinc-200"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-zinc-100 text-base mb-2 whitespace-pre-line break-words"
            style={{ fontSize: "15px" }}
          >
            {post.text}
          </p>
        )}
        {post.imageUrl && (
          <div className="w-full rounded-xl overflow-hidden mb-2">
            <SeePhoto src={post.imageUrl} alt="Post image" />
          </div>
        )}
        {/* Like button */}
        {showLike && (
          <div className="flex items-center gap-2 mt-2">
            <button
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold transition ${
                post.likes?.includes(currentUser?.uid)
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
              onClick={onLike}
              style={{ fontSize: "15px" }}
            >
              <svg
                className="w-5 h-5"
                fill={
                  post.likes?.includes(currentUser?.uid)
                    ? "currentColor"
                    : "none"
                }
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 9V5a3 3 0 00-6 0v4M5 12h14l-1.34 8.03A2 2 0 0115.7 22H8.3a2 2 0 01-1.96-1.97L5 12z"
                />
              </svg>
              Like
              <span className="ml-1">{post.likes?.length || 0}</span>
            </button>
          </div>
        )}
      </div>
      {/* AcceptModal for delete */}
      {showLike && (
        <AcceptModal
          open={showDeleteModal}
          title="Delete post"
          description="Are you sure you want to delete this post? This action cannot be undone."
          onAccept={async () => {
            setShowDeleteModal(false);
            if (post.imageUrl) {
              try {
                const imgRef = storageRef(storage, `posts/${post.id}/image`);
                await deleteObject(imgRef);
              } catch {}
            }
            await deleteDoc(doc(db, "posts", post.id));
            window.dispatchEvent(
              new CustomEvent("show-global-success", {
                detail: "Post deleted!",
              })
            );
            onDelete();
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

export default function FeedPage() {
  const currentUser = useCurrentUser();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return unsub;
  }, []);

  const handleLike = async (post: any) => {
    if (!currentUser) return;
    const ref = doc(db, "posts", post.id);
    let likes: string[] = Array.isArray(post.likes) ? post.likes : [];
    if (likes.includes(currentUser.uid)) {
      likes = likes.filter((id) => id !== currentUser.uid);
    } else {
      likes = [...likes, currentUser.uid];
    }
    await updateDoc(ref, { likes });
  };

  const handleDelete = async (_post: any) => {};
  const handleEdit = () => {};

  const postsWithAd = [...posts];
  if (postsWithAd.length > 2) {
    // Insert ad after a random post (not first or last)
    const adIndex = Math.floor(Math.random() * (postsWithAd.length - 2)) + 1;
    postsWithAd.splice(adIndex, 0, { isAd: true });
  }

  return (
    <div className="w-full max-w-md sm:max-w-2xl flex flex-col gap-3 sm:gap-4">
      {postsWithAd.map((post, idx) =>
        post.isAd ? (
          <AdSenseFeedCard key={`ad-${idx}`} />
        ) : (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post)}
            onDelete={() => {}}
            onEdit={handleEdit}
            isOwn={currentUser ? post.userId === currentUser.uid : false}
            currentUser={currentUser}
            showLike={!!currentUser}
          />
        )
      )}
    </div>
  );
}
