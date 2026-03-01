import { ElementType, ComponentPropsWithoutRef } from "react";

type Variant = "default" | "lg" | "interactive";

type GlassCardProps<T extends ElementType = "div"> = {
  variant?: Variant;
  as?: T;
  className?: string;
} & ComponentPropsWithoutRef<T>;

const variantClasses: Record<Variant, string> = {
  default: "glass-card",
  lg: "glass-card-lg",
  interactive: "glass-card hover:scale-[1.02] hover:shadow-glass-lg transition-all duration-300 cursor-pointer",
};

export default function GlassCard<T extends ElementType = "div">({
  variant = "default",
  as,
  className = "",
  ...props
}: GlassCardProps<T>) {
  const Component = as || "div";
  return <Component className={`${variantClasses[variant]} ${className}`} {...props} />;
}
