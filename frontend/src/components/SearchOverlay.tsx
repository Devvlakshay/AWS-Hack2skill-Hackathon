"use client";

/**
 * SearchOverlay component for FitView AI.
 * Modal search with trending terms.
 * Design: Luxury editorial — white panel, gold focus border, ink text.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TRENDING = ["Kurtas", "Sarees", "Formal Shirts", "Ethnic Wear", "Jeans"];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      router.push(`/products?search=${encodeURIComponent(term.trim())}`);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1a1a1a]/40" />

      {/* Panel */}
      <div
        className="relative max-w-lg mx-auto mt-20 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 shadow-xl">
          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4BFB4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Search for shirts, kurtas, sarees\u2026"
              className="w-full bg-[#FAFAF8] border border-[#D4C9B0] text-[#1a1a1a] text-base rounded-xl pl-12 pr-4 py-3 placeholder:text-[#C4BFB4] focus:outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C4BFB4] hover:text-[#1a1a1a] transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Trending */}
          <div className="mt-6">
            <p className="text-[10px] font-medium text-[#9A9A9A] uppercase tracking-[0.15em] mb-3">
              Trending
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="bg-[#FAFAF8] border border-[#E8E4DC] text-[#6B6B6B] text-sm px-3 py-1.5 rounded-lg hover:border-[#B8860B] hover:text-[#B8860B] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Close hint */}
          <p className="mt-5 text-[10px] text-[#C4BFB4] text-right">
            Press <kbd className="font-mono bg-[#F0EDE6] px-1 py-0.5 rounded text-[#9A9A9A]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
