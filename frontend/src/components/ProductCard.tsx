"use client";

/**
 * Product Card component for grid display.
 * Phase 2: Product & Model Management.
 */

import React from "react";
import Link from "next/link";
import type { Product } from "@/lib/api/products";

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export default function ProductCard({ product, showActions = false, onDelete }: ProductCardProps) {
  const imageUrl = product.images?.[0] || "/placeholder-product.png";
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(product.price);

  return (
    <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden hover:shadow-lg hover:border-gray-700 transition-all">
      {/* Image */}
      <div className="aspect-[3/4] bg-gray-800 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%234b5563' viewBox='0 0 24 24'%3E%3Cpath d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E";
          }}
        />
        {product.category && (
          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm truncate">{product.name}</h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-white">{formattedPrice}</span>
          {product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.sizes.map((s, i) => (
              <span
                key={i}
                className={`text-xs px-1.5 py-0.5 rounded border ${
                  s.stock > 0
                    ? "border-gray-700 text-gray-300"
                    : "border-red-900 text-red-500 line-through"
                }`}
              >
                {s.size}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
            <Link
              href={`/retailer/products/${product._id}/edit`}
              className="flex-1 text-center text-sm py-1.5 bg-indigo-900/40 text-indigo-400 rounded-lg hover:bg-indigo-900/60 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete?.(product._id)}
              className="flex-1 text-sm py-1.5 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
