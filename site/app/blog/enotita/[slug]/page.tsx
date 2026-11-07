import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Layers } from "lucide-react";
import {
  getAllCategories,
  getCategoryBySlug,
  THEMATIC_CATEGORIES,
} from "@/lib/content";
import { getServiceBySlug } from "@/lib/services";
import { getImageVariants } from "@/lib/images";
import { getUIStrings } from "@/lib/siteContent";
import ArticleCard from "@/components/ArticleCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = getAllCategories();
  const params: { slug: string }[] = [];
  const seen = new Set<string>();

  for (const c of categories) {
    const candidates = [
      c.slug,
      c.slug.replace(/^i-/, ""),
      `pillar-${String(c.number).padStart(2, "0")}`,
      `enotita-${c.macroNumber}-${c.number}`,
    ];
    for (const s of candidates) {
      if (s && !seen.has(s)) {
        seen.add(s);
        params.push({ slug: s });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.title} — Οδηγοί & Άρθρα`,
    description:
      category.intro ||
      `Οδηγοί και άρθρα θετικής εκπαίδευσης για ${category.title} από το Let It Sniff στην Αθήνα.`,
    openGraph: {
      title: `${category.title} | Let It Sniff`,
      description: category.intro,
      images: category.coverImage ? [{ url: category.coverImage }] : undefined,
    },
  };
}

export default async function EnotitaPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const allCategories = getAllCategories();
  const currentIndex = allCategories.findIndex((c) => c.slug === slug);
  const prevCategory = currentIndex > 0 ? allCategories[currentIndex - 1] : undefined;
  const nextCategory =
    currentIndex < allCategories.length - 1 ? allCategories[currentIndex + 1] : undefined;

  const color = category.color || "#C4852A";
  const cluster = THEMATIC_CATEGORIES.find((c) => c.number === category.macroNumber);
  const catVariants = getImageVariants(category.coverImage);
  const ui = getUIStrings();

  // Connected service if any
  const connectedServices = (category.relatedService || [])
    .map((s) => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="min-h-screen">
      {/* ── Page Header ─────────────────────────────────── */}
      <header className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)] pt-8 pb-8 sm:pt-12 sm:pb-10">
        <div className="max-w-4xl mx-auto px-5">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6 min-w-0">
            <Link href="/" className="hover:text-[var(--color-brown)] transition-colors shrink-0">
              Αρχική
            </Link>
            <span className="shrink-0">/</span>
            <Link href="/blog" className="hover:text-[var(--color-brown)] transition-colors shrink-0">
              Βιβλιοθήκη
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-[var(--color-brown)] truncate min-w-0">
              {ui.pillarBreadcrumb} {String(category.number).padStart(2, "0")}
            </span>
          </nav>

          {/* Pillar badge & cluster */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4">
            <span
              className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 bg-white border"
              style={{ color, borderColor: `${color}40` }}
            >
              {ui.pillarBadge} {String(category.number).padStart(2, "0")}
            </span>
            {cluster && (
              <span className="text-xs text-[var(--color-muted)] flex items-center gap-1.5">
                <Layers size={13} className="text-[var(--color-mutedLight)]" />
                {cluster.title}
              </span>
            )}
            <span className="text-xs text-[var(--color-mutedLight)]">
              · {category.articles.length} {category.articles.length === 1 ? ui.guideSingleSuffix : ui.guideCountSuffix}
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl text-[var(--color-brown)] leading-[1.2] sm:leading-[1.15] mb-5 break-words">
            {category.title}
          </h1>

          {category.intro && (
            <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed max-w-2xl mb-6">
              {category.intro}
            </p>
          )}

          {/* Connected Service Box */}
          {connectedServices.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[var(--color-sandDark)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[var(--color-muted)] font-medium">
                {ui.connectedServiceLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {connectedServices.map((srv) => (
                  <Link
                    key={srv.slug}
                    href={`/ypiresies/${srv.slug}/`}
                    className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-amber)] hover:text-[var(--color-brown)] bg-white px-3 py-1.5 border border-[var(--color-sandDark)] transition-colors"
                  >
                    <span>{srv.title}</span>
                    <ArrowRight size={12} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Content Container ───────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Cover Image */}
        {category.coverImage && (
          <div className="mb-14 overflow-hidden bg-[var(--color-sand)] border border-[var(--color-sandDark)] aspect-[16/9] w-full">
            <picture>
              {catVariants?.card && (
                <source type="image/webp" srcSet={catVariants.card} />
              )}
              <img
                src={category.coverImage}
                alt={category.title}
                width={1376}
                height={768}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </picture>
          </div>
        )}

        {/* Articles Section */}
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-8 pb-3 border-b border-[var(--color-sandDark)]">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[var(--color-amber)]" />
              <h2 className="font-heading text-2xl text-[var(--color-brown)]">
                {ui.clusterContents}
              </h2>
            </div>
            <span className="text-xs text-[var(--color-mutedLight)] font-mono">
              {category.articles.length} {category.articles.length === 1 ? ui.articleSingleSuffix : ui.articleCountSuffix}
            </span>
          </div>

          {category.articles.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {category.articles.map((article, idx) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  priority={idx < 2}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)] italic py-4">
              {ui.emptyArticles}
            </p>
          )}
        </section>

        {/* ── Pillar Navigation (Prev / Next) ──────────────── */}
        <nav className="pt-10 border-t border-[var(--color-sandDark)] grid sm:grid-cols-2 gap-4">
          {prevCategory ? (
            <Link
              href={`/blog/enotita/${prevCategory.slug}/`}
              className="group block p-4 bg-white border border-[var(--color-sandDark)]/60 hover:border-[var(--color-sandDark)] transition-colors text-left"
            >
              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-mutedLight)] group-hover:text-[var(--color-amber)] transition-colors mb-1 font-mono">
                <ArrowLeft size={12} /> {ui.prevPillar}
              </span>
              <p className="font-heading text-sm text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors line-clamp-1">
                {String(prevCategory.number).padStart(2, "0")}. {prevCategory.title}
              </p>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextCategory && (
            <Link
              href={`/blog/enotita/${nextCategory.slug}/`}
              className="group block p-4 bg-white border border-[var(--color-sandDark)]/60 hover:border-[var(--color-sandDark)] transition-colors text-right sm:col-start-2"
            >
              <span className="inline-flex items-center justify-end gap-1 text-xs text-[var(--color-mutedLight)] group-hover:text-[var(--color-amber)] transition-colors mb-1 font-mono">
                {ui.nextPillar} <ArrowRight size={12} />
              </span>
              <p className="font-heading text-sm text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors line-clamp-1">
                {String(nextCategory.number).padStart(2, "0")}. {nextCategory.title}
              </p>
            </Link>
          )}
        </nav>

        {/* Return to Library Link */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-brown)] transition-colors"
          >
            {ui.backToAllClusters}
          </Link>
        </div>
      </div>
    </div>
  );
}
