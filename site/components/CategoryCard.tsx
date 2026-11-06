import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/content";
import { CATEGORY_COLORS } from "@/lib/content";
import { getImageVariants } from "@/lib/images";

interface Props {
  category: Category;
  showCover?: boolean;
}

export default function CategoryCard({ category, showCover = false }: Props) {
  const color = CATEGORY_COLORS[category.number] ?? "#C4852A";
  const catVariants = showCover && category.coverImage ? getImageVariants(category.coverImage) : null;

  return (
    <Link
      href={`/blog/enotita/${category.slug}/`}
      className="group flex flex-col justify-between bg-white border-l-4 transition-colors border-y border-r border-[var(--color-sandDark)]/60 hover:border-r-[var(--color-sandDark)]"
      style={{ borderLeftColor: color }}
    >
      <div>
        {showCover && category.coverImage && (
          <div className="overflow-hidden bg-[var(--color-sand)] aspect-[16/9] w-full border-b border-[var(--color-sand)]">
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
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
              />
            </picture>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <span
              className="text-xs font-mono font-bold tracking-wider"
              style={{ color }}
            >
              ΕΝΟΤΗΤΑ {String(category.number).padStart(2, "0")}
            </span>
            <span className="text-xs text-[var(--color-mutedLight)] font-medium">
              {category.articles.length} {category.articles.length === 1 ? "άρθρο" : "άρθρα"}
            </span>
          </div>

          <h3 className="font-heading text-lg sm:text-xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug mb-2">
            {category.title}
          </h3>

          {category.intro && (
            <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2">
              {category.intro}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 pt-0">
        <div className="pt-3 border-t border-[var(--color-sand)] flex items-center justify-between text-xs font-semibold text-[var(--color-brownMid)] group-hover:text-[var(--color-amber)] transition-colors">
          <span>Εξερεύνηση Ενότητας</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
