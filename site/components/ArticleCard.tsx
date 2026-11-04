import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/content";
import { CATEGORY_COLORS } from "@/lib/content";

interface Props {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: Props) {
  const color = CATEGORY_COLORS[article.categoryNumber] ?? "#C4852A";

  return (
    <Link
      href={`/blog/${article.slug}/`}
      className={`group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-[var(--color-sandDark)]/20 ${
        featured ? "md:flex" : ""
      }`}
    >
      {/* Featured / Cover Image */}
      {article.coverImage ? (
        <div
          className={`relative overflow-hidden bg-[var(--color-sand)] ${
            featured
              ? "md:w-5/12 aspect-[16/10] md:aspect-auto flex-shrink-0"
              : "aspect-[16/10] w-full"
          }`}
        >
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div
          className={featured ? "md:w-2 md:flex-shrink-0 h-2 md:h-auto" : "h-1.5"}
          style={{ backgroundColor: color }}
        />
      )}

      <div className={`p-6 flex flex-col gap-3 ${featured ? "flex-1" : ""}`}>
        {/* Category badge */}
        <span
          className="inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 12%, white)`,
            color,
          }}
        >
          {article.categoryTitle}
        </span>

        {/* Title */}
        <h3
          className={`font-heading text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug ${
            featured ? "text-xl" : "text-lg"
          }`}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-mutedLight)] mt-auto pt-2">
          <Clock size={12} />
          <span>{article.readingTime}</span>
        </div>
      </div>
    </Link>
  );
}
