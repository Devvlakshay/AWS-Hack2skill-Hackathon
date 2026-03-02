"use client";

import { useRef, type MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

const GLOW: Record<string, string> = {
  violet:  "rgba(139, 92, 246, 0.18)",
  amber:   "rgba(245, 158, 11,  0.15)",
  fuchsia: "rgba(217, 70,  239, 0.15)",
};

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "violet" | "amber" | "fuchsia";
  delay?: number;
}

export default function GlowCard({
  children,
  className = "",
  glowColor = "violet",
  delay = 0,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlightBg = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${GLOW[glowColor]}, transparent 80%)`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`glass-card-mid relative overflow-hidden group ${className}`}
    >
      {/* Mouse-follow spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: spotlightBg }}
      />

      {/* Top highlight line on hover */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: glowColor === "amber"
            ? "linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)"
            : "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
