import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Layers } from "lucide-react";
import {
  getAllCategories,
  getCategoryBySlug,
  CATEGORY_COLORS,
  getClusterByPillarNumber,
} from "@/lib/content";
import { getServiceBySlug } from "@/lib/services";
import { getImageVariants } from "@/lib/images";
import ArticleCard from "@/components/ArticleCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((c) => ({
    slug: c.slug,
  }));
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

  const color = CATEGORY_COLORS[category.number] ?? "#C4852A";
  const cluster = getClusterByPillarNumber(category.number);
  const catVariants = getImageVariants(category.coverImage);

  // Connected service if any
  const connectedServices = (category.relatedService || [])
    .map((s) => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="min-h-screen">
      {/* ── Page Header ─────────────────────────────────── */}
      <header className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)] pt-12 pb-10">
        <div className="max-w-4xl mx-auto px-5">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
            <Link href="/" className="hover:text-[var(--color-brown)] transition-colors">
              Αρχική
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[var(--color-brown)] transition-colors">
              Βιβλιοθήκη
            </Link>
            <span>/</span>
            <span className="text-[var(--color-brown)] truncate">
              Ενότητα {String(category.number).padStart(2, "0")}
            </span>
          </nav>

          {/* Pillar badge & cluster */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 bg-white border"
              style={{ color, borderColor: `${color}40` }}
            >
              ΕΝΟΤΗΤΑ {String(category.number).padStart(2, "0")}
            </span>
            {cluster && (
              <span className="text-xs text-[var(--color-muted)] flex items-center gap-1.5">
                <Layers size={13} className="text-[var(--color-mutedLight)]" />
                {cluster.title}
              </span>
            )}
            <span className="text-xs text-[var(--color-mutedLight)]">
              · {category.articles.length} {category.articles.length === 1 ? "οδηγός" : "οδηγοί"}
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--color-brown)] leading-[1.15] mb-5">
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
                Σχετική υπηρεσία εκπαίδευσης στην Αθήνα:
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
                Οδηγοί της Ενότητας
              </h2>
            </div>
            <span className="text-xs text-[var(--color-mutedLight)] font-mono">
              {category.articles.length} άρθρα
            </span>
          </div>

          {category.articles.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-8">
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
              Τα άρθρα αυτής της ενότητας ανανεώνονται σύντομα.
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
                <ArrowLeft size={12} /> Προηγούμενη ενότητα
              </span>
              <p className="font-heading text-sm text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors line-clamp-1">
                {String(prevCategory.number).padStart(2, "0")}. {prevCategory.title}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {nextCategory && (
            <Link
              href={`/blog/enotita/${nextCategory.slug}/`}
              className="group block p-4 bg-white border border-[var(--color-sandDark)]/60 hover:border-[var(--color-sandDark)] transition-colors text-right sm:col-start-2"
            >
              <span className="inline-flex items-center justify-end gap-1 text-xs text-[var(--color-mutedLight)] group-hover:text-[var(--color-amber)] transition-colors mb-1 font-mono">
                Επόμενη ενότητα <ArrowRight size={12} />
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
            ← Επιστροφή σε όλες τις θεματικές ενότητες
          </Link>
        </div>
      </div>
    </div>
  );
}
