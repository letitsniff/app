import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/content";
import { getImageVariants } from "@/lib/images";
import { getUIStrings } from "@/lib/siteContent";

interface Props {
  category: Category;
  showCover?: boolean;
}

export default function CategoryCard({ category, showCover = false }: Props) {
  const color = category.color || "#C4852A";
  const catVariants = showCover && category.coverImage ? getImageVariants(category.coverImage) : null;
  const ui = getUIStrings();

  return (
    <Link
      href={`/blog/enotita/${category.slug}/`}
      className="group flex flex-col justify-between bg-white border border-[var(--color-sandDark)]/60 hover:border-[var(--color-amber)] hover:shadow-md transition-all duration-300 rounded-sm overflow-hidden"
    >
      <div>
        {showCover && category.coverImage && (
          <div className="overflow-hidden bg-[var(--color-sand)] aspect-[16/9] w-full border-b border-[var(--color-sandDark)]/50">
            <picture>
              {catVariants?.card && (
                <source type="image/webp" srcSet={catVariants.card} />
              )}
              <img
                src={category.coverImage}
                alt={category.title}
                width={1376}
                height={768}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </picture>
          </div>
        )}

        <div className="p-6 sm:p-7 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
            <span
              className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded-xs"
              style={{ color: "var(--color-brown)", backgroundColor: `${color}20`, border: `1px solid ${color}45` }}
            >
              {ui.pillarBadge} {String(category.number).padStart(2, "0")}
            </span>
            <span className="text-xs text-[var(--color-muted)] font-medium font-mono">
              {category.articles.length} {category.articles.length === 1 ? ui.articleSingleSuffix : ui.articleCountSuffix}
            </span>
          </div>

          <h3 className="font-heading text-xl sm:text-2xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-3 break-words">
            {category.title}
          </h3>

          {category.intro && (
            <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">
              {category.intro}
            </p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0">
        <div className="pt-4 border-t border-[var(--color-sand)]/70 flex items-center justify-between text-xs font-semibold text-[var(--color-brownMid)] group-hover:text-[var(--color-amber)] transition-colors">
          <span>{ui.exploreCluster}</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
