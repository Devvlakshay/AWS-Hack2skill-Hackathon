"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUICK_REPLIES = [
  "Show me party dresses",
  "Help with sizing",
  "How does try-on work?",
  "New arrivals",
];

export default function ChatBot() {
  const { token, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your FitView AI Style Assistant. I can help you find the perfect outfit, suggest sizes, and guide you through virtual try-ons. How can I help today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please log in to chat with the style assistant!",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/chatbot/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();

      if (data.session_id && !sessionId) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again in a moment!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-24 sm:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 text-white"
        aria-label={isOpen ? "Close style assistant" : "Open AI style assistant"}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-40 sm:bottom-24 right-4 z-50 flex flex-col shadow-2xl"
          style={{
            width: "min(calc(100vw - 2rem), 24rem)",
            maxHeight: "70vh",
            background: "rgba(20, 16, 56, 0.95)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            borderRadius: "1rem",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 p-4 border-b"
            style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white">Style Assistant</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white/70 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-sm"
                      : "text-white/90 rounded-bl-sm"
                  }`}
                  style={
                    msg.role === "assistant"
                      ? { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }
                      : {}
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies — shown only on first message */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors text-violet-300 hover:text-violet-200"
                  style={{ border: "1px solid rgba(139, 92, 246, 0.4)", background: "rgba(139, 92, 246, 0.08)" }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about styles, sizes, products..."
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="rounded-xl px-3 py-2 text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
