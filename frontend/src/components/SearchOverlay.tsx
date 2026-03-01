"use client";

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative max-w-lg mx-auto mt-20 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-card-lg p-6">
          <div className="relative">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-[rgb(var(--text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Search for shirts, kurtas, dresses..."
              className="glass-input pl-12 text-lg"
            />
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">
              Trending
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="glass-card px-3 py-1.5 text-sm text-[rgb(var(--text-secondary))] hover:text-violet-500 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
