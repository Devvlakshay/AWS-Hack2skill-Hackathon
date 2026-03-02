import React from "react";

type Variant = "default" | "lg" | "interactive";

const variantClasses: Record<Variant, string> = {
  default: "glass-card",
  lg: "glass-card-lg",
  interactive: "glass-card hover:scale-[1.02] hover:shadow-glass-lg transition-all duration-300 cursor-pointer",
};

type GlassCardProps = React.HTMLAttributes<HTMLElement> & {
  variant?: Variant;
  as?: string;
};

export default function GlassCard({
  variant = "default",
  as: Tag = "div",
  className = "",
  ...props
}: GlassCardProps) {
  const El = Tag as unknown as React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  return <El className={`${variantClasses[variant]} ${className}`} {...props} />;
}
