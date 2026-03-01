"use client";

import React from "react";
import Link from "next/link";
import type { FashionModel } from "@/lib/api/models";

interface ModelCardProps {
  model: FashionModel;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const bodyTypeLabels: Record<string, string> = {
  slim: "Slim",
  average: "Average",
  curvy: "Curvy",
  plus_size: "Plus Size",
};

const skinToneLabels: Record<string, string> = {
  fair: "Fair",
  medium: "Medium",
  olive: "Olive",
  brown: "Brown",
  dark: "Dark",
};

export default function ModelCard({ model, showActions = false, onDelete }: ModelCardProps) {
  const imageUrl = model.image_url || "/placeholder-model.png";

  return (
    <div className="glass-card overflow-hidden hover:scale-[1.02] hover:shadow-glass-lg transition-all duration-300">
      {/* Image */}
      <div className="aspect-[3/4] bg-[rgb(var(--bg-secondary))] relative overflow-hidden">
        <img
          src={imageUrl}
          alt={model.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%234b5563' viewBox='0 0 24 24'%3E%3Cpath d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
          }}
        />
        <span className="absolute top-2 left-2 bg-amber-500/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
          {bodyTypeLabels[model.body_type] || model.body_type}
        </span>
        {!model.is_active && (
          <span className="absolute top-2 right-2 glass-card text-[rgb(var(--text-muted))] text-xs px-2 py-0.5">
            Inactive
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-[rgb(var(--text-primary))] text-sm">{model.name}</h3>

        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs text-[rgb(var(--text-muted))]">
            <span>Height</span>
            <span className="font-medium text-[rgb(var(--text-secondary))]">{model.height_cm} cm</span>
          </div>
          <div className="flex justify-between text-xs text-[rgb(var(--text-muted))]">
            <span>Size</span>
            <span className="font-medium text-[rgb(var(--text-secondary))]">{model.size}</span>
          </div>
          <div className="flex justify-between text-xs text-[rgb(var(--text-muted))]">
            <span>Skin Tone</span>
            <span className="font-medium text-[rgb(var(--text-secondary))]">{skinToneLabels[model.skin_tone] || model.skin_tone}</span>
          </div>
        </div>

        {/* Measurements */}
        <div className="flex justify-between mt-3 pt-2 border-t border-[rgba(var(--glass-border))]">
          <div className="text-center">
            <p className="text-xs text-[rgb(var(--text-muted))]">Bust</p>
            <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">{model.measurements.bust}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[rgb(var(--text-muted))]">Waist</p>
            <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">{model.measurements.waist}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[rgb(var(--text-muted))]">Hip</p>
            <p className="text-xs font-medium text-[rgb(var(--text-secondary))]">{model.measurements.hip}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-[rgb(var(--text-muted))]">
          <span>Used {model.usage_count} times</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-[rgba(var(--glass-border))]">
            <Link
              href={`/retailer/models/${model._id}/edit`}
              className="flex-1 text-center text-sm py-1.5 glass-card text-violet-500 hover:shadow-glow-violet transition-all"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete?.(model._id)}
              className="flex-1 text-sm py-1.5 glass-card text-red-400 hover:bg-red-500/10 transition-all"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
