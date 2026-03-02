"use client";

import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () => import("@/components/ParticleBackground"),
  { ssr: false, loading: () => null }
);

export default function ParticleBackgroundClient({
  variant,
  particleCount,
}: {
  variant?: "hero" | "subtle";
  particleCount?: number;
}) {
  return <ParticleBackground variant={variant} particleCount={particleCount} />;
}
