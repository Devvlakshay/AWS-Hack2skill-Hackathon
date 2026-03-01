"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  "All",
  "Shirts",
  "Kurtas",
  "Sarees",
  "T-Shirts",
  "Jeans",
  "Dresses",
  "Ethnic Wear",
  "Trousers",
  "Jackets",
  "Activewear",
];

export default function CategoryBar({ active = "All" }: { active?: string }) {
  const router = useRouter();

  const handleClick = (cat: string) => {
    if (cat === "All") {
      router.push("/products");
    } else {
      router.push(`/products?category=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === cat
              ? "bg-violet-600 text-white shadow-glow-violet"
              : "glass-card text-[rgb(var(--text-secondary))] hover:text-violet-500"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
