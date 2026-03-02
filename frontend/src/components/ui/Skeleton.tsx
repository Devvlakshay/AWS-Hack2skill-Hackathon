import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-white/10 rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-white/10 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export function ModelCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-white/10 rounded-t-xl" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}

export function TryOnCardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/10 rounded-t-xl" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-4 rounded-xl">
            <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
            <div className="h-8 bg-white/10 rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="h-4 bg-white/10 rounded w-1/4 mb-4" />
        <div className="h-48 bg-white/10 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card p-4 rounded-xl">
            <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-8 bg-white/10 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
      <div className="aspect-square bg-white/10 rounded-2xl" />
      <div className="space-y-4">
        <div className="h-8 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
        <div className="h-6 bg-white/10 rounded w-1/4" />
        <div className="space-y-2 pt-4">
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
          <div className="h-4 bg-white/10 rounded w-4/6" />
        </div>
        <div className="flex gap-3 pt-4">
          <div className="h-12 bg-white/10 rounded-xl flex-1" />
          <div className="h-12 bg-white/10 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}
