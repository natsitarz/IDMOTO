"use client";

import { useFirebaseUser } from "@/app/parts/firebase-use-user";
import { askChatGPT } from "@/lib/chatgpt-client";
import { askGemini } from "@/lib/gemini";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function NotLoggedInMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800">
      <div className="bg-white/10 border border-red-400/30 rounded-2xl px-8 py-6 shadow-lg flex flex-col items-center gap-3 animate-fade-in-scale">
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
      text: "Hi! I'm IDMOTO AI. Ask me anything about your car, maintenance, or features!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 2. Wklej parametr question do inputa tylko raz
  useEffect(() => {
    const question = searchParams.get("question");
    if (question) {
      setInput(question);
      // Usuwamy question z URL, żeby nie wklejało się ponownie przy rerenderze
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
      className="animate-fade-in-scale p-4 flex flex-col bg-gradient-to-br from-gray-900 via-zinc-900 to-zinc-800"
      style={{ minHeight: "calc(100vh - 67px)" }}
    >
      <header className="w-full max-w-2xl mx-auto pt-10 pb-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          IDMOTO AI Assistant
        </h1>
        <p className="text-zinc-300 text-sm text-center max-w-md">
          Ask me anything about your car, maintenance tips, or features. I'm
          here to help!
        </p>
        <div className="mt-4 flex gap-3">
          <div className="flex items-center bg-zinc-800 rounded-full p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setAiProvider("gemini")}
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all duration-150 ${
                aiProvider === "gemini"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-700 text-white shadow"
                  : "text-zinc-300 hover:text-white"
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
              className={`px-4 py-1 rounded-full text-xs font-bold transition-all duration-150 ${
                aiProvider === "chatgpt"
                  ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow"
                  : "text-zinc-300 hover:text-white"
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
        </div>
      </header>
      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col px-2 sm:px-0">
        <div className="flex-1 overflow-y-auto rounded-xl bg-white/5 p-4 mb-2 shadow-inner sm:max-h-160 max-h-120">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  msg.from === "ai"
                    ? "bg-blue-900 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-2">
              <div className="px-4 py-2 rounded-2xl bg-blue-900 text-white opacity-70 animate-pulse max-w-[80%]">
                AI is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form
          onSubmit={handleSend}
          className="flex items-center bg-gradient-to-r from-blue-900 via-blue-800 to-zinc-900 rounded-xl shadow-lg px-4 py-2"
        >
          <span className="bg-blue-700 rounded-full p-1 mr-3 flex items-center justify-center">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#3b82f6" />
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
            className="flex-1 bg-transparent outline-none text-white placeholder-zinc-300 px-2"
            autoFocus
          />
          <button
            type="submit"
            className="ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition"
          >
            Ask
          </button>
        </form>
      </main>
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
