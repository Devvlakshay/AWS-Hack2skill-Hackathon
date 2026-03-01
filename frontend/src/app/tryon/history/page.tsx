"use client";

/**
 * Try-On History Page for FitView AI.
 * Phase 3: Core Virtual Try-On Engine.
 *
 * Shows past try-on results with favorite toggle and pagination.
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

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      {/* Header */}
      <div className="glass-card border-b border-[rgba(var(--glass-border))] rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/tryon"
                className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Try-On History</h1>
                <p className="text-[rgb(var(--text-muted))] text-sm mt-1">
                  {historyTotal} total try-on{historyTotal !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                filterFavorites
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                  : "glass-card text-[rgb(var(--text-secondary))] hover:bg-white/10"
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
              Favorites
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {historyLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : historyError ? (
          <div className="text-center py-16">
            <p className="text-red-400">{historyError}</p>
            <button
              onClick={() => fetchHistory(1)}
              className="mt-4 text-violet-400 hover:text-violet-300 text-sm"
            >
              Retry
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-[rgb(var(--text-muted))] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-[rgb(var(--text-secondary))] text-lg">
              {filterFavorites ? "No favorite try-ons yet" : "No try-on history yet"}
            </p>
            <Link
              href="/tryon"
              className="btn-primary inline-block mt-4 px-6 py-2 rounded-lg font-medium"
            >
              Start Your First Try-On
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHistory.map((session) => (
                <div
                  key={session._id}
                  className="glass-card rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-glow-violet transition-all duration-300"
                >
                  {/* Result Image */}
                  <div className="aspect-[3/4] bg-[rgb(var(--bg-secondary))] relative">
                    <img
                      src={session.result_url}
                      alt={`${session.model_name} in ${session.product_name}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Favorite Button */}
                    <button
                      onClick={() =>
                        toggleFavorite(session._id || session.id, !session.is_favorite)
                      }
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 ${session.is_favorite ? "text-pink-500" : "text-white"}`}
                        fill={session.is_favorite ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    {/* Processing Time Badge */}
                    <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-white/10">
                      {session.processing_time_ms}ms
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[rgb(var(--text-primary))] font-medium truncate">{session.product_name}</p>
                        <p className="text-[rgb(var(--text-muted))] text-sm truncate">on {session.model_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <time className="text-[rgb(var(--text-muted))] text-xs">
                        {new Date(session.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full backdrop-blur-sm border ${
                          session.status === "completed"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : session.status === "failed"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
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
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => fetchHistory(historyPage - 1)}
                  disabled={historyPage <= 1}
                  className="btn-secondary px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-[rgb(var(--text-muted))] text-sm px-4 glass-card rounded-lg py-2">
                  Page {historyPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchHistory(historyPage + 1)}
                  disabled={historyPage >= totalPages}
                  className="btn-secondary px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
