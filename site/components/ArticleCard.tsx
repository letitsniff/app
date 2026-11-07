import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/content";
import { getImageVariants } from "@/lib/images";
import { getUIStrings } from "@/lib/siteContent";

interface Props {
  article: Article;
  featured?: boolean;
  priority?: boolean;
}

export default function ArticleCard({
  article,
  featured = false,
  priority = false,
}: Props) {
  const color = article.categoryColor || "#C4852A";
  const variants = getImageVariants(article.coverImage);
  const ui = getUIStrings();

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
              <picture>
                {variants?.card && (
                  <source type="image/webp" srcSet={variants.card} />
                )}
                <img
                  src={article.coverImage}
                  alt={article.title}
                  width={720}
                  height={450}
                  loading={priority ? "eager" : "lazy"}
                  fetchPriority={priority ? "high" : "low"}
                  decoding="async"
                  className="w-full aspect-[16/10] object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
              </picture>
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
              <h3 className="font-heading text-2xl md:text-3xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-4 break-words">
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
              <span className="text-[var(--color-amber)] group-hover:underline">{ui.readArticle}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${article.slug}/`}
      className="group flex flex-col justify-between border-t border-[var(--color-sandDark)]/60 pt-6 pb-2 transition-all"
    >
      <div>
        {article.coverImage && (
          <div className="overflow-hidden bg-[var(--color-sand)] mb-4 rounded-sm border border-[var(--color-sandDark)]/40">
            <picture>
              {variants?.card && (
                <source type="image/webp" srcSet={variants.card} />
              )}
              <img
                src={article.coverImage}
                alt={article.title}
                width={720}
                height={450}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "low"}
                decoding="async"
                className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </picture>
          </div>
        )}
        <span
          className="text-[11px] font-semibold tracking-wider uppercase block mb-2"
          style={{ color }}
        >
          {article.categoryTitle}
        </span>
        <h3 className="font-heading text-lg md:text-xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-3 break-words">
          {article.title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2 mb-4">
          {article.excerpt}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[var(--color-mutedLight)] mt-auto pt-3 border-t border-[var(--color-sand)]/50">
        <Clock size={12} />
        <span>{article.readingTime}</span>
      </div>
    </Link>
  );
}
