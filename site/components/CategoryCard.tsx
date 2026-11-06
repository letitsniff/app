import Link from "next/link";
import type { Category } from "@/lib/content";
import { CATEGORY_COLORS } from "@/lib/content";

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  const color = CATEGORY_COLORS[category.number] ?? "#C4852A";

  return (
    <Link
      href={`/blog/#${category.slug}`}
      className="group block bg-white border-l-4 p-5 sm:p-6 transition-colors border-y border-r border-[var(--color-sandDark)]/60 hover:border-r-[var(--color-sandDark)]"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <span
          className="text-xs font-mono font-bold tracking-wider"
          style={{ color }}
        >
          {String(category.number).padStart(2, "0")}
        </span>
        <span className="text-xs text-[var(--color-mutedLight)]">
          {category.articles.length} {category.articles.length === 1 ? "άρθρο" : "άρθρα"}
        </span>
      </div>

      <h3 className="font-heading text-lg text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-2">
        {category.title}
      </h3>

      {category.intro && (
        <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
          {category.intro}
        </p>
      )}
    </Link>
  );
}
