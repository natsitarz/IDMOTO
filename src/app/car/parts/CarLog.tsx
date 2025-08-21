import { db } from "@/app/parts/firebase";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function CarLog({
  carId,
  isOwner,
}: {
  carId: string;
  isOwner: boolean;
}) {
  const [logs, setLogs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLog, setNewLog] = useState("");
  const [logDate, setLogDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Disable scroll when modal is open
  useEffect(() => {
    if (showAdd) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAdd]);

  useEffect(() => {
    if (!carId) return;
    const q = query(
      collection(db, "vehicles", carId, "logs"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [carId]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const date = logDate
        ? Timestamp.fromDate(new Date(logDate))
        : serverTimestamp();
      await addDoc(collection(db, "vehicles", carId, "logs"), {
        text: newLog,
        createdAt: date,
        user: user?.displayName || user?.email || "Unknown",
        userId: user?.uid || "",
      });
      setNewLog("");
      setLogDate(new Date().toISOString().slice(0, 10));
      setShowAdd(false);
      // Success toaster
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Log entry added successfully!",
        })
      );
    } catch (error) {
      console.error("Error adding log:", error);
      // Failure toaster
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to add log entry. Please try again.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLog = async (logId: string) => {
    setRemovingId(logId);
    try {
      await deleteDoc(doc(db, "vehicles", carId, "logs", logId));
      // Success toaster
      window.dispatchEvent(
        new CustomEvent("show-global-success", {
          detail: "Log entry removed successfully!",
        })
      );
    } catch (error) {
      console.error("Error removing log:", error);
      // Failure toaster
      window.dispatchEvent(
        new CustomEvent("show-global-error", {
          detail: "Failed to remove log entry. Please try again.",
        })
      );
    } finally {
      setRemovingId(null);
    }
  };

  // Modal content as a separate variable for portal
  const addLogModal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleAddLog}
        className="relative w-full sm:w-[400px] mt-8 bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-700 p-6 flex flex-col gap-4"
        style={{ maxWidth: 400 }}
      >
        <button
          type="button"
          className="cursor-pointer absolute top-3 right-4 text-zinc-400 hover:text-zinc-200 text-xl"
          onClick={() => setShowAdd(false)}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-lg font-bold text-white mb-2">Add Log Entry</h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400 font-semibold mb-1">
            Description
          </label>
          <div className="relative">
            <textarea
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
              maxLength={300}
              rows={4}
              placeholder="Describe maintenance, fix, tuning..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base placeholder:text-zinc-400 shadow-inner resize-none"
              style={{ minHeight: 80 }}
            />
            <span className="absolute bottom-2 right-4 text-xs text-zinc-400 select-none pointer-events-none">
              {newLog.length}/300
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400 font-semibold mb-1">
            Date
          </label>
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition font-medium text-base shadow-inner"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newLog.trim()}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Log"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-zinc-400 font-semibold">
          Car Log &mdash; Maintenance, Fixes, Tunings
        </p>
        {isOwner && (
          <button
            className="flex items-center justify-center gap-3 bg-zinc-800/80 hover:bg-zinc-700/90 text-white font-semibold rounded-lg px-4 py-2 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer"
            onClick={() => setShowAdd(true)}
            type="button"
            style={{ maxWidth: 260 }}
          >
            <svg
              className="w-5 h-5 text-blue-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4 bg-white/5 rounded-xl p-4 shadow-inner">
        <div className="flex flex-col gap-3">
          {logs.length === 0 && (
            <div className="text-zinc-400 text-sm text-center py-4">
              No log entries yet.
            </div>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-zinc-900/80 rounded-lg px-4 py-3 shadow-inner flex flex-col gap-1 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-semibold">
                  {log.user}
                </span>
                <span className="text-xs text-zinc-500">
                  {log.createdAt?.toDate
                    ? log.createdAt.toDate().toLocaleDateString("en-GB")
                    : ""}
                </span>
              </div>
              <div className="text-sm text-zinc-200 whitespace-pre-line">
                {log.text}
              </div>
              {isOwner && (
                <button
                  onClick={() => handleRemoveLog(log.id)}
                  disabled={removingId === log.id}
                  className="cursor-pointer absolute bottom-2 right-2 text-xs text-red-400 hover:text-red-600 bg-zinc-800/70 rounded-full px-2 py-1 transition disabled:opacity-50"
                  title="Remove log"
                >
                  {removingId === log.id ? "..." : "Remove"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Modal rendered in portal */}
      {showAdd &&
        typeof window !== "undefined" &&
        createPortal(addLogModal, document.body)}
    </div>
  );
}
