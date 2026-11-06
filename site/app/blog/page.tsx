import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import {
  getAllCategories,
  getAllArticles,
  THEMATIC_CLUSTERS,
} from "@/lib/content";
import { getBlogPageContent, getUIStrings } from "@/lib/siteContent";
import CategoryCard from "@/components/CategoryCard";

export function generateMetadata(): Metadata {
  const content = getBlogPageContent();
  return {
    title: content.meta.title,
    description: content.meta.description,
  };
}

export default function BlogPage() {
  const categories = getAllCategories();
  const allArticles = getAllArticles();
  const totalArticles = allArticles.length;
  const content = getBlogPageContent();
  const ui = getUIStrings();

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
      {/* ── Page Header ───────────────────────────────────── */}
      <header className="mb-14 pb-8 border-b border-[var(--color-sandDark)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amber)] mb-2">
          {content.header.kicker} · {categories.length} Θεματικές Ενότητες · {totalArticles} Άρθρα
        </p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] mb-4">
          {content.header.title}
        </h1>
        <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed whitespace-pre-line">
          {content.header.description}
        </p>

        {/* Macro-Category Quick Jump Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--color-sand)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] block mb-3">
            {content.header.jumpBarLabel}
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {THEMATIC_CLUSTERS.map((cluster) => (
              <a
                key={cluster.id}
                href={`#${cluster.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-sandDark)] text-[var(--color-brownMid)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] transition-colors"
              >
                <span className="font-mono font-bold text-[var(--color-amber)]">
                  {String(cluster.number).padStart(2, "0")}.
                </span>
                <span>{cluster.title}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ── Thematic Categories ─────────────────────────────── */}
      <div className="space-y-24">
        {THEMATIC_CLUSTERS.map((cluster) => {
          const clusterCategories = categories.filter((c) => c.macroNumber === cluster.number);

          const clusterArticlesCount = clusterCategories.reduce(
            (sum, c) => sum + c.articles.length,
            0
          );

          return (
            <section
              key={cluster.id}
              id={cluster.id}
              className="scroll-mt-20 pt-2"
            >
              {/* Category Heading */}
              <div className="border-b-2 border-[var(--color-brown)] pb-4 mb-8">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-[var(--color-amber)]" />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--color-amber)]">
                      {`ΘΕΜΑΤΙΚΗ ΕΝΟΤΗΤΑ ${String(cluster.number).padStart(2, "0")}`}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-mutedLight)] font-mono">
                    {clusterCategories.length} {ui.guideCountSuffix === "οδηγοί" ? "πυλώνες" : ui.guideCountSuffix} · {clusterArticlesCount} {ui.guideCountSuffix}
                  </span>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] mb-2">
                  {cluster.title}
                </h2>
                <p className="text-sm text-[var(--color-muted)] max-w-2xl leading-relaxed">
                  {cluster.tagline}
                </p>
              </div>

              {/* Grid of Pillar Cards in this Cluster */}
              <div className="grid sm:grid-cols-2 gap-6">
                {clusterCategories.map((category) => (
                  <CategoryCard
                    key={category.slug}
                    category={category}
                    showCover={true}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Bottom Help & Contact Bar ─────────────────────── */}
      <div className="mt-24 pt-12 border-t border-[var(--color-sandDark)] text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2 font-semibold">
          {content.bottomCallout.kicker}
        </p>
        <h3 className="font-heading text-2xl text-[var(--color-brown)] mb-4">
          {content.bottomCallout.title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] max-w-xl mx-auto mb-6 whitespace-pre-line">
          {content.bottomCallout.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
          <Link
            href={content.bottomCallout.link1}
            className="px-5 py-2.5 bg-[var(--color-brown)] text-white hover:bg-[var(--color-brownLight)] transition-colors"
          >
            {content.bottomCallout.button1}
          </Link>
          <Link
            href={content.bottomCallout.link2}
            className="px-5 py-2.5 bg-white border border-[var(--color-sandDark)] text-[var(--color-brown)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] transition-colors"
          >
            {content.bottomCallout.button2}
          </Link>
        </div>
      </div>
    </div>
  );
}
