import Link from "next/link";
import type { Category } from "@/lib/content";
import { CATEGORY_COLORS } from "@/lib/content";

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  const color = CATEGORY_COLORS[category.number] ?? "#C4852A";
  const firstArticle = category.articles[0];

  return (
    <Link
      href={firstArticle ? `/blog/${firstArticle.slug}/` : `/blog/`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Top color bar */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <div className="p-6">
        {/* Number pill */}
        <span
          className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-3"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 15%, white)`,
            color,
          }}
        >
          {String(category.number).padStart(2, "0")}
        </span>

        <h3 className="font-heading text-lg text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-2">
          {category.title}
        </h3>

        {category.intro && (
          <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2 mb-4">
            {category.intro}
          </p>
        )}

        <span className="text-xs text-[var(--color-mutedLight)]">
          {category.articles.length} άρθρ{category.articles.length === 1 ? "ο" : "α"}
        </span>
      </div>
    </Link>
  );
}
