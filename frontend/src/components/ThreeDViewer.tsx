"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

interface ThreeDViewerProps {
  imageUrl: string;
  className?: string;
}

const ThreeDCanvas = dynamic(() => import("./ThreeDCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[320px] glass-card-lg rounded-3xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto mb-3" />
        <p className="text-sm text-[rgb(var(--text-muted))]">Loading 3D viewer...</p>
      </div>
    </div>
  ),
});

export default function ThreeDViewer({ imageUrl, className = "" }: ThreeDViewerProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[320px] glass-card-lg rounded-3xl ${className}`}>
        <div className="text-center p-6">
          <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-violet-400 text-sm hover:text-violet-300 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[400px] glass-card-lg overflow-hidden rounded-3xl ${className}`}>
      <div className="absolute top-3 left-3 z-10 glass-card text-[rgb(var(--text-primary))] text-xs px-2 py-1 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
        3D View
      </div>

      <ThreeDCanvas imageUrl={imageUrl} onError={setError} />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="text-xs text-white/60 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
          Drag to rotate · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
