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
import React, { useEffect, useRef, useState } from "react";

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
            className="cursor-pointer px-4 py-2 rounded bg-zinc-700 text-white hover:bg-zinc-600"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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

    // 1. Check if user can post (one per minute)
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
          detail: `Post delay: ${secondsLeft}s`,
        })
      );
      return;
    }
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
      await updateDoc(postRef, { imageUrl });
    }

    // 4. Update user's postCreatedAt timestamp
    await setDoc(userRef, { postCreatedAt: Date.now() }, { merge: true });

    setText("");
    setImage(null);
    setUploading(false);
    onPost();
    window.dispatchEvent(
      new CustomEvent("show-global-success", {
        detail: `Post added!`,
      })
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto bg-zinc-800/80 rounded-2xl shadow border border-zinc-800 px-2 py-3 sm:px-4 sm:py-4 flex flex-col gap-3 mb-6 sm:mb-8"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Image
          src={currentUser.photoURL || "/logo.png"}
          alt={currentUser.displayName || "User"}
          width={36}
          height={36}
          className="rounded-full object-cover min-w-[36px] min-h-[36px] sm:w-10 sm:h-10"
        />
        <div className="relative w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-700/80 text-white px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner resize-none"
            rows={3}
            placeholder="What's on your mind?"
          />
          <span className="absolute bottom-2 right-4 text-xs text-zinc-400 select-none pointer-events-none">
            {text.length}/200
          </span>
        </div>
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
            className="flex items-center justify-center w-6 h-6 cursor-pointer absolute top-1 right-1 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-full p-1 text-white"
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
          className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium"
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
          className="cursor-pointer ml-auto px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-sm shadow transition"
          disabled={uploading || (!text.trim() && !image)}
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

function AdPostCard() {
  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-800/80 rounded-2xl shadow border border-zinc-800 mb-4 sm:mb-6 px-2 py-3 sm:px-4 sm:py-4 flex flex-col items-center justify-center">
      <span className="text-zinc-400 text-sm mb-2">Sponsored</span>
      <div className="w-full flex justify-center">
        {/* Przykładowy kod reklamy */}
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-1346635526682080"
          data-ad-slot="1287338924"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
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
    <div className="w-full max-w-xl mx-auto bg-zinc-800/80 rounded-2xl shadow border border-zinc-800 mb-4 sm:mb-6 px-2 py-3 sm:px-4 sm:py-4 relative overflow-hidden">
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
              className="cursor-pointer p-2 rounded-full hover:bg-zinc-800 text-zinc-400"
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
                  className="cursor-pointer block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded-t-xl"
                  onClick={() => {
                    setEditing(true);
                    setShowMenu(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="cursor-pointer block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded-b-xl"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 p-6 w-[90vw] max-w-md relative flex flex-col gap-4 animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
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
                    d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6"
                  />
                </svg>
                Edit your post
              </h2>
              <div className="relative w-full">
                <textarea
                  className="w-full bg-zinc-800 text-zinc-100 rounded-xl p-3 border border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none text-base resize-none transition"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={5}
                  maxLength={500}
                  autoFocus
                  style={{ fontSize: "15px" }}
                  placeholder="Edit your post..."
                />
                <span className="absolute bottom-2 right-4 text-xs text-zinc-400 select-none pointer-events-none">
                  {editText.length}/200
                </span>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-700 text-white hover:bg-zinc-600 transition"
                  onClick={() => setEditing(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow transition cursor-pointer"
                  onClick={handleEdit}
                  type="button"
                  disabled={editText.trim().length === 0}
                >
                  Save
                </button>
              </div>
              <button
                className="cursor-pointer absolute top-3 right-3 text-zinc-400 hover:text-zinc-200 text-xl"
                onClick={() => setEditing(false)}
                type="button"
                aria-label="Close edit modal"
              >
                ×
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
              className={`cursor-pointer flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold transition ${
                post.likes?.includes(currentUser?.uid)
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
              }`}
              onClick={onLike}
              style={{ fontSize: "15px" }}
            >
              {/* Heart icon */}
              <svg
                className="w-5 h-4 mr-1"
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
                  d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z"
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
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(
        q,
        (snap) => {
          setPosts(
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
          setPostsLoading(false);
        },
        (error) => {
          setPostsError("Failed to load posts.");
          setPostsLoading(false);
        }
      );
      return unsub;
    } catch (e) {
      setPostsError("Failed to load posts.");
      setPostsLoading(false);
    }
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

  return (
    <div className="min-h-[calc(100dvh-67px)] flex flex-col items-center bg-zinc-900 px-4 py-4 sm:py-8">
      {userLoading ? (
        <div className="text-zinc-400 mb-4">Loading user...</div>
      ) : currentUser ? (
        <PostForm onPost={() => {}} currentUser={currentUser} />
      ) : (
        <div className="text-zinc-400 mb-4">
          Log in to add a post. You can still read posts below!
        </div>
      )}
      <div className="w-full max-w-md sm:max-w-2xl flex flex-col gap-3 sm:gap-4">
        {/* Sponsored ad at the top */}
        <AdPostCard key="ad-top" />
        {postsLoading ? (
          <div className="text-zinc-400">Loading posts...</div>
        ) : postsError ? (
          <div className="text-red-400">{postsError}</div>
        ) : posts.length === 0 ? (
          <div className="text-zinc-400">No posts yet.</div>
        ) : (
          posts.map((item) => (
            <PostCard
              key={item.id}
              post={item}
              onLike={() => handleLike(item)}
              onDelete={() => {}}
              onEdit={handleEdit}
              isOwn={currentUser ? item.userId === currentUser.uid : false}
              currentUser={currentUser}
              showLike={!!currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
}
