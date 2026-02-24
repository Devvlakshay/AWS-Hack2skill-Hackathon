"use client";

/**
 * Fashion Model Card component for grid display.
 * Phase 2: Product & Model Management.
 */

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={model.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23e5e7eb' viewBox='0 0 24 24'%3E%3Cpath d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
          }}
        />
        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
          {bodyTypeLabels[model.body_type] || model.body_type}
        </span>
        {!model.is_active && (
          <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">
            Inactive
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm">{model.name}</h3>

        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Height</span>
            <span className="font-medium text-gray-700">{model.height_cm} cm</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Size</span>
            <span className="font-medium text-gray-700">{model.size}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Skin Tone</span>
            <span className="font-medium text-gray-700">{skinToneLabels[model.skin_tone] || model.skin_tone}</span>
          </div>
        </div>

        {/* Measurements */}
        <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-400">Bust</p>
            <p className="text-xs font-medium text-gray-700">{model.measurements.bust}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Waist</p>
            <p className="text-xs font-medium text-gray-700">{model.measurements.waist}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Hip</p>
            <p className="text-xs font-medium text-gray-700">{model.measurements.hip}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>Used {model.usage_count} times</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <Link
              href={`/retailer/models/${model._id}/edit`}
              className="flex-1 text-center text-sm py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete?.(model._id)}
              className="flex-1 text-sm py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
