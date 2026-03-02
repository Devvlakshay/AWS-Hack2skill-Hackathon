"use client";

/**
 * Try-On History Page for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 *
 * Shows past try-on results with favourite toggle and pagination.
 * Design: Luxury editorial — Playfair Display / DM Sans, cream bg, gold accent.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useTryOnStore } from "@/lib/store/tryonStore";

export default function TryOnHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const {
    history,
    historyTotal,
    historyPage,
    historyLoading,
    historyError,
    fetchHistory,
    toggleFavorite,
  } = useTryOnStore();

  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchHistory(1);
  }, [isAuthenticated, router, fetchHistory]);

  const filteredHistory = filterFavorites
    ? history.filter((s) => s.is_favorite)
    : history;

  const totalPages = Math.ceil(historyTotal / 20);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="border-b border-[#E8E4DC] bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/tryon"
                className="text-[#9A9A9A] hover:text-[#1a1a1a] transition-colors"
                aria-label="Back to Try-On"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-[#B8860B] uppercase mb-0.5">
                  Your Archive
                </p>
                <h1
                  className="text-3xl text-[#1a1a1a]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Try-On History
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#9A9A9A]">
                {historyTotal} look{historyTotal !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                  ${filterFavorites
                    ? "bg-rose-50 text-rose-600 border-rose-200"
                    : "bg-white text-[#6B6B6B] border-[#D4C9B0] hover:border-[#B8860B] hover:text-[#B8860B]"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={filterFavorites ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favourites
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {historyLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : historyError ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-sm">{historyError}</p>
            <button
              onClick={() => fetchHistory(1)}
              className="mt-4 text-sm font-medium text-[#B8860B] hover:text-[#9A6C00] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-24">
            {/* Editorial empty state */}
            <div className="w-16 h-16 border border-[#E8E4DC] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-[#C4BFB4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2
              className="text-xl text-[#1a1a1a] mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {filterFavorites ? "No saved favourites yet" : "Your style story begins here"}
            </h2>
            <p className="text-sm text-[#9A9A9A] mb-8 max-w-xs mx-auto">
              {filterFavorites
                ? "Save a try-on to your favourites and it will appear here."
                : "Try on your first garment and it will appear in your archive."}
            </p>
            <Link
              href="/tryon"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-[#2d2d2d] transition-colors"
            >
              Start Your First Try-On
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHistory.map((session) => (
                <div
                  key={session._id}
                  className="group bg-white border border-[#E8E4DC] rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                >
                  {/* Result Image */}
                  <div className="aspect-[3/4] bg-[#F0EDE6] relative">
                    <img
                      src={session.result_url}
                      alt={`${session.model_name} in ${session.product_name}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Favourite button */}
                    <button
                      onClick={() =>
                        toggleFavorite(session._id || session.id, !session.is_favorite)
                      }
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all
                        ${session.is_favorite
                          ? "bg-rose-50 border border-rose-200"
                          : "bg-white/80 border border-[#E8E4DC] hover:border-rose-200 hover:bg-rose-50"
                        }`}
                      aria-label={session.is_favorite ? "Remove from favourites" : "Add to favourites"}
                    >
                      <svg
                        className={`w-4 h-4 ${session.is_favorite ? "text-rose-500" : "text-[#9A9A9A] group-hover:text-rose-400"}`}
                        fill={session.is_favorite ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    {/* Processing time */}
                    <div className="absolute bottom-2.5 left-2.5 bg-[#1a1a1a]/60 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      {session.processing_time_ms}ms
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <p className="text-[#1a1a1a] text-sm font-medium truncate">{session.product_name}</p>
                      <p className="text-[#9A9A9A] text-xs truncate mt-0.5">on {session.model_name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <time className="text-[10px] text-[#C4BFB4]">
                        {new Date(session.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border
                          ${session.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : session.status === "failed"
                            ? "bg-red-50 text-red-500 border-red-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => fetchHistory(historyPage - 1)}
                  disabled={historyPage <= 1}
                  className="text-sm font-medium px-4 py-2 rounded-xl border border-[#D4C9B0] bg-white text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-[#9A9A9A] px-3">
                  {historyPage} / {totalPages}
                </span>
                <button
                  onClick={() => fetchHistory(historyPage + 1)}
                  disabled={historyPage >= totalPages}
                  className="text-sm font-medium px-4 py-2 rounded-xl border border-[#D4C9B0] bg-white text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
