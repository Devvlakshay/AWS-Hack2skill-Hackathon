import React from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({
  title = "Connection Error",
  message = "Unable to load content. Check your internet connection.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`glass-card rounded-xl p-8 text-center ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">{title}</h3>
      <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary px-6 py-2 rounded-xl text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  message = "Check back soon!",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`glass-card rounded-xl p-8 text-center ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">{title}</h3>
      <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary px-6 py-2 rounded-xl text-sm">
          Refresh
        </button>
      )}
    </div>
  );
}

export function RateLimited({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card rounded-xl p-6 text-center border border-amber-500/20 ${className}`}>
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-1">Too many requests</h3>
      <p className="text-sm text-[rgb(var(--text-muted))]">Please wait a moment before trying again.</p>
    </div>
  );
}
