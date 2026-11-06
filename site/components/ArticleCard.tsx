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

  if (featured) {
    return (
      <Link
        href={`/blog/${article.slug}/`}
        className="group block border-t-2 pt-6 transition-colors"
        style={{ borderColor: color }}
      >
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {article.coverImage && (
            <div className="md:col-span-7 overflow-hidden bg-[var(--color-sand)]">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full aspect-[16/10] object-cover transition-opacity duration-300 group-hover:opacity-90"
              />
            </div>
          )}
          <div className={article.coverImage ? "md:col-span-5 flex flex-col justify-between h-full" : "md:col-span-12"}>
            <div>
              <span
                className="text-xs font-semibold tracking-wider uppercase inline-block mb-3"
                style={{ color }}
              >
                {article.categoryTitle}
              </span>
              <h3 className="font-heading text-2xl md:text-3xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-4">
                {article.title}
              </h3>
              <p className="text-[var(--color-muted)] text-base leading-relaxed line-clamp-3 mb-6">
                {article.excerpt}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-mutedLight)]">
              <Clock size={13} />
              <span>{article.readingTime}</span>
              <span>·</span>
              <span className="text-[var(--color-amber)] group-hover:underline">Διαβάστε το άρθρο →</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${article.slug}/`}
      className="group flex flex-col justify-between border-t border-[var(--color-sandDark)] pt-4 transition-colors"
    >
      <div>
        {article.coverImage && (
          <div className="overflow-hidden bg-[var(--color-sand)] mb-4">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full aspect-[16/10] object-cover transition-opacity duration-300 group-hover:opacity-90"
            />
          </div>
        )}
        <span
          className="text-[11px] font-semibold tracking-wider uppercase block mb-2"
          style={{ color }}
        >
          {article.categoryTitle}
        </span>
        <h3 className="font-heading text-lg md:text-xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2 mb-4">
          {article.excerpt}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[var(--color-mutedLight)] mt-auto pt-2">
        <Clock size={12} />
        <span>{article.readingTime}</span>
      </div>
    </Link>
  );
}
