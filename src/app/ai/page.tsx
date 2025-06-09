"use client";

import { useFirebaseUser } from "@/app/parts/firebase-use-user";
import { askChatGPT } from "@/lib/chatgpt-client";
import { askGemini } from "@/lib/gemini";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function NotLoggedInMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-zinc-900 to-zinc-800">
      <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3 animate-fade-in-scale">
        <svg
          className="w-10 h-10 text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
        <span className="text-lg font-semibold text-red-400">
          You must be logged in to use IDMOTO AI.
        </span>
        <span className="text-sm text-zinc-400 text-center">
          Please log in to continue.
        </span>
      </div>
    </div>
  );
}

function AIPageInner() {
  const user = useFirebaseUser();
  const searchParams = useSearchParams();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- 1. Provider & state
  const [aiProvider, setAiProvider] = useState<"gemini" | "chatgpt">("gemini");
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "👋 Welcome to IDMOTO AI! Ask me anything about your car, maintenance, or features.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 2. Wklej parametr question do inputa tylko raz
  useEffect(() => {
    const question = searchParams.get("question");
    if (question) {
      setInput(question);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("question");
        window.history.replaceState({}, document.title, url.pathname);
      }
    }
    // eslint-disable-next-line
  }, []);

  // --- 3. Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 4. Obsługa wysyłania wiadomości
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages((msgs) => [...msgs, { from: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const askAI = aiProvider === "gemini" ? askGemini : askChatGPT;

    try {
      const aiReply = await askAI(userMessage);
      setMessages((msgs) => [
        ...msgs,
        { from: "ai", text: aiReply || "Sorry, I couldn't find an answer." },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        {
          from: "ai",
          text: "Sorry, there was a problem contacting the AI.",
        },
      ]);
    }
    setLoading(false);
  };

  if (!user) return <NotLoggedInMessage />;

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0e1a] via-[#181c24] to-[#23272f] font-[family-name:var(--font-geist-sans)] relative"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 80% 0%, rgba(0,212,255,0.08) 0%, transparent 70%), radial-gradient(ellipse at 20% 100%, rgba(0,255,180,0.08) 0%, transparent 70%)",
      }}
    >
      <header className="w-full max-w-2xl mx-auto pt-10 pb-4 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-cyan-400/80 to-blue-700/80 rounded-full p-2 shadow-lg">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#06b6d4" />
              <text
                x="12"
                y="17"
                textAnchor="middle"
                fontSize="13"
                fill="white"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                AI
              </text>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow">
            IDMOTO AI
          </h1>
        </div>
        <p className="text-zinc-300 text-base text-center max-w-lg mb-2">
          <span className="font-semibold text-cyan-400">
            Futuristic car assistant.
          </span>{" "}
          Ask about your car, maintenance, features, or get tips. Powered by AI.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setAiProvider("gemini")}
            className={`cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 border border-cyan-500/40 shadow-sm
              ${
                aiProvider === "gemini"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-700 text-white shadow-lg"
                  : "bg-zinc-900/60 text-cyan-300 hover:bg-zinc-800"
              }`}
            aria-pressed={aiProvider === "gemini"}
          >
            <span className="inline-flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#06b6d4" />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontFamily="sans-serif"
                >
                  G
                </text>
              </svg>
              Gemini
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAiProvider("chatgpt")}
            className={`hidden cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 border border-blue-500/40 shadow-sm
              ${
                aiProvider === "chatgpt"
                  ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg"
                  : "bg-zinc-900/60 text-blue-300 hover:bg-zinc-800"
              }`}
            aria-pressed={aiProvider === "chatgpt"}
          >
            <span className="inline-flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                <text
                  x="12"
                  y="16"
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontFamily="sans-serif"
                >
                  GPT
                </text>
              </svg>
              ChatGPT
            </span>
          </button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col px-2 sm:px-0">
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gradient-to-br from-zinc-900/80 via-zinc-800/80 to-zinc-900/80 p-4 mb-2 shadow-xl border border-zinc-800 backdrop-blur-xl sm:max-h-[60vh] max-h-[50vh]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm font-medium shadow
                  ${
                    msg.from === "ai"
                      ? "bg-gradient-to-r from-cyan-900 via-zinc-900 to-blue-900 text-cyan-100 border border-cyan-700/30"
                      : "bg-gradient-to-r from-blue-700 via-blue-800 to-zinc-900 text-white border border-blue-700/30"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-2">
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-900 via-zinc-900 to-blue-900 text-cyan-100 opacity-70 animate-pulse max-w-[80%] text-sm font-medium border border-cyan-700/30">
                AI is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form
          onSubmit={handleSend}
          className="flex items-center bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl shadow-lg px-3 py-2 border border-zinc-800"
        >
          <span className="bg-gradient-to-br from-cyan-700 to-blue-800 rounded-full p-1 mr-2 flex items-center justify-center shadow">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#06b6d4" />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="10"
                fill="white"
                fontFamily="sans-serif"
              >
                AI
              </text>
            </svg>
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask IDMOTO AI about your car…"
            className="flex-1 bg-transparent outline-none text-white placeholder-zinc-400 px-2 text-sm"
            autoFocus
          />
          <button
            type="submit"
            className="cursor-pointer ml-2 px-4 py-2 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-800 text-white font-bold text-xs sm:text-sm shadow-lg transition-all duration-150 border border-cyan-700/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            disabled={loading || !input.trim()}
          >
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h8m0 0l-3-3m3 3l-3 3"
                />
              </svg>
              <span className="hidden sm:inline">Ask</span>
            </span>
          </button>
        </form>
      </main>
      <footer className="w-full max-w-2xl mx-auto py-6 flex flex-col items-center text-zinc-500 text-xs opacity-70">
        <div className="flex gap-2 items-center">
          <svg
            className="w-4 h-4 text-cyan-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>
          <span>
            AI answers are for informational purposes only. Always verify with a
            professional.
          </span>
        </div>
        <span className="mt-2">IDMOTO AI &copy; 2025</span>
      </footer>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense>
      <AIPageInner />
    </Suspense>
  );
}
