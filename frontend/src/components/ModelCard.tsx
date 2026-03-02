"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { FashionModel } from "@/lib/api/models";

interface ModelCardProps {
  model: FashionModel;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onSelect?: (model: FashionModel) => void;
  selected?: boolean;
}

const bodyTypeLabels: Record<string, string> = {
  slim: "Slim",
  average: "Average",
  curvy: "Curvy",
  plus_size: "Plus Size",
  athletic: "Athletic",
};

const skinToneLabels: Record<string, string> = {
  fair: "Fair",
  medium: "Medium",
  olive: "Olive",
  brown: "Brown",
  dark: "Dark",
};

// Subtle dot colour for skin tone visual cue
const skinToneColors: Record<string, string> = {
  fair: "#F5CBA7",
  medium: "#D4A574",
  olive: "#B8860B",
  brown: "#8B5E3C",
  dark: "#4A2C17",
};

export default function ModelCard({
  model,
  showActions = false,
  onDelete,
  onSelect,
  selected = false,
}: ModelCardProps) {
  const [hovered, setHovered] = useState(false);
  const imageUrl = model.image_url || "";

  const bodyLabel = bodyTypeLabels[model.body_type] || model.body_type;
  const skinLabel = skinToneLabels[model.skin_tone] || model.skin_tone;
  const skinColor = skinToneColors[model.skin_tone] || "#D4A574";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#FFFFFF",
        border: selected ? "2px solid #B8860B" : "1px solid #E8E8E4",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        boxShadow: selected
          ? "0 0 0 3px rgba(184,134,11,0.15), 0 12px 32px rgba(0,0,0,0.08)"
          : hovered
          ? "0 8px 28px rgba(0,0,0,0.08)"
          : "none",
        transform: hovered && !selected ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* ── Image ──────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          overflow: "hidden",
          backgroundColor: "#F5F0E8",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={model.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              display: "block",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="56"
              height="56"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#C8C8C4"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}

        {/* Body type pill — top left */}
        <span
          style={{
            position: "absolute",
            top: "0.65rem",
            left: "0.65rem",
            backgroundColor: "rgba(184,134,11,0.9)",
            color: "#FFFFFF",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "0.22rem 0.65rem",
            borderRadius: "999px",
            backdropFilter: "blur(4px)",
          }}
        >
          {bodyLabel}
        </span>

        {/* Inactive badge */}
        {!model.is_active && (
          <span
            style={{
              position: "absolute",
              top: "0.65rem",
              right: "0.65rem",
              backgroundColor: "rgba(26,26,26,0.7)",
              color: "rgba(250,250,248,0.8)",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0.22rem 0.6rem",
              borderRadius: "999px",
              backdropFilter: "blur(4px)",
            }}
          >
            Inactive
          </span>
        )}

        {/* Selected checkmark */}
        {selected && (
          <div
            style={{
              position: "absolute",
              top: "0.65rem",
              right: "0.65rem",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#B8860B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(184,134,11,0.4)",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Details ────────────────────────────────────────── */}
      <div style={{ padding: "1rem 1.1rem 1.25rem" }}>
        {/* Name */}
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "#1a1a1a",
            margin: "0 0 0.6rem",
            lineHeight: 1.3,
          }}
        >
          {model.name}
        </p>

        {/* Tags row: skin tone + size */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            flexWrap: "wrap",
            marginBottom: "0.75rem",
          }}
        >
          {/* Skin tone pill */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              border: "1px solid #E8E8E4",
              backgroundColor: "#FAFAF8",
              color: "#555",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              padding: "0.2rem 0.55rem",
              borderRadius: "999px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: skinColor,
                display: "inline-block",
                flexShrink: 0,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
            {skinLabel}
          </span>

          {/* Size pill */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid #E8E8E4",
              backgroundColor: "#FAFAF8",
              color: "#555",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              padding: "0.2rem 0.55rem",
              borderRadius: "999px",
              textTransform: "uppercase",
            }}
          >
            {model.size}
          </span>
        </div>

        {/* Measurements row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.6rem 0",
            borderTop: "1px solid #E8E8E4",
            borderBottom: "1px solid #E8E8E4",
            marginBottom: "0.75rem",
          }}
        >
          {[
            { label: "Bust", value: model.measurements?.bust },
            { label: "Waist", value: model.measurements?.waist },
            { label: "Hip", value: model.measurements?.hip },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: "0.65rem", color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
                {label}
              </p>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a1a1a", margin: "0.15rem 0 0" }}>
                {value ?? "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Meta: height + usage */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#888" }}>
            {model.height_cm} cm
          </span>
          <span style={{ fontSize: "0.75rem", color: "#888" }}>
            Used {model.usage_count ?? 0}×
          </span>
        </div>

        {/* Select button */}
        {onSelect && (
          <button
            onClick={() => onSelect(model)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              backgroundColor: selected ? "#B8860B" : "#1a1a1a",
              color: "#FAFAF8",
              fontWeight: 700,
              fontSize: "0.82rem",
              padding: "0.65rem 0",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "background 0.2s, transform 0.15s",
            }}
          >
            {selected ? "Selected" : "Select Model"}
          </button>
        )}

        {/* Retailer actions */}
        {showActions && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: onSelect ? "0.5rem" : "0",
            }}
          >
            <Link
              href={`/retailer/models/${model._id}/edit`}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.5rem 0",
                borderRadius: "8px",
                border: "1.5px solid #1a1a1a",
                color: "#1a1a1a",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete?.(model._id)}
              style={{
                flex: 1,
                fontSize: "0.82rem",
                fontWeight: 600,
                padding: "0.5rem 0",
                borderRadius: "8px",
                border: "1.5px solid #E53935",
                color: "#E53935",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
