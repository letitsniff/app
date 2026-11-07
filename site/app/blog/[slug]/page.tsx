import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import {
  getAllArticles,
  getArticleBySlug,
  getCategoryBySlug,
} from "@/lib/content";
import { getServiceBySlug } from "@/lib/services";
import { getGlobalSettings } from "@/lib/siteContent";
import Prose from "@/components/Prose";
import ArticleCard from "@/components/ArticleCard";
import ReadingProgress from "@/components/ReadingProgress";
import { getImageVariants } from "@/lib/images";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: article.coverImage
      ? {
          images: [{ url: article.coverImage }],
        }
      : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryBySlug(article.categorySlug);
  const color = category?.color || article.categoryColor || "#C4852A";

  // Related articles (same category, excluding current)
  const related = (category?.articles ?? [])
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // Related service
  const relatedService =
    article.relatedService[0]
      ? getServiceBySlug(article.relatedService[0])
      : undefined;

  const { siteName, consultationBox, ui } = getGlobalSettings();

  return (
    <>
      <ReadingProgress color={color} />

      <article className="min-h-screen">
        {/* ── Editorial Header ────────────────────────────── */}
        <header className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)] pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="max-w-4xl mx-auto px-5">
            {/* Breadcrumb navigation */}
            <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6 min-w-0">
              <Link href="/blog" className="hover:text-[var(--color-brown)] transition-colors shrink-0">
                Βιβλιοθήκη
              </Link>
              <span className="shrink-0">/</span>
              {category && (
                <Link
                  href={`/blog/enotita/${category.slug}/`}
                  className="hover:text-[var(--color-brown)] transition-colors truncate min-w-0"
                >
                  {category.title}
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs"
                style={{ color, backgroundColor: `${color}15` }}
              >
                {article.categoryTitle}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl text-[var(--color-brown)] leading-[1.2] sm:leading-[1.15] mb-6 break-words">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--color-muted)] pt-5 border-t border-[var(--color-sand)]/70">
              <span className="flex items-center gap-1.5 font-medium shrink-0">
                <Clock size={13} /> {article.readingTime}
              </span>
              <span>·</span>
              <span className="shrink-0">{ui.authorText}</span>
              <span>·</span>
              <span className="shrink-0">{siteName}</span>
            </div>
          </div>
        </header>

        {/* ── Cover Image (Full Width Editorial) ───────────── */}
        {article.coverImage && (() => {
          const variants = getImageVariants(article.coverImage);
          return (
            <div className="max-w-4xl mx-auto px-5 pt-10 sm:pt-12">
              <div className="overflow-hidden bg-[var(--color-sand)] border border-[var(--color-sandDark)]/60 rounded-sm shadow-sm">
                <picture>
                  {variants?.card && variants?.hero && (
                    <source
                      type="image/webp"
                      srcSet={`${variants.card} 720w, ${variants.hero} 1400w`}
                      sizes="(max-width: 768px) 100vw, 896px"
                    />
                  )}
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    width={1400}
                    height={788}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full aspect-[16/9] object-cover"
                  />
                </picture>
              </div>
            </div>
          );
        })()}

        {/* ── Content & Editorial Sidebar ─────────────────── */}
        <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-24">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-16 items-start">
            {/* Article Prose */}
            <main className="min-w-0 w-full">
              <Prose html={article.htmlContent} />
            </main>

            {/* Sticky Sidebar */}
            <aside className="mt-16 lg:mt-0 space-y-8 lg:sticky lg:top-20">
              {/* Contextual Consultation Box */}
              <div className="bg-white border border-[var(--color-sandDark)]/60 p-6 sm:p-7 rounded-sm shadow-xs">
                <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-semibold mb-2">
                  {consultationBox.kicker}
                </p>
                <h3 className="font-heading text-lg text-[var(--color-brown)] mb-3">
                  {consultationBox.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed mb-5">
                  {consultationBox.text}
                </p>
                <Link
                  href={consultationBox.buttonLink}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
                >
                  {consultationBox.buttonText} <ArrowRight size={13} />
                </Link>
              </div>

              {/* Related Service */}
              {relatedService && (
                <div className="bg-[var(--color-sand)]/30 border border-[var(--color-sandDark)]/60 p-6 sm:p-7 rounded-sm">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-3">
                    {ui.relatedService}
                  </p>
                  <div className="text-2xl mb-2">{relatedService.icon}</div>
                  <h4 className="font-heading text-base text-[var(--color-brown)] mb-2">
                    {relatedService.title}
                  </h4>
                  <p className="text-xs text-[var(--color-muted)] mb-4 leading-relaxed">
                    {relatedService.tagline}
                  </p>
                  <Link
                    href={`/ypiresies/${relatedService.slug}/`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors"
                  >
                    {ui.learnMore} <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              {/* In the same category */}
              {category && category.articles.length > 1 && (
                <div className="pt-8 border-t border-[var(--color-sandDark)]/60">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-3">
                    {ui.moreInCategory}
                  </p>
                  <Link
                    href={`/blog/enotita/${category.slug}/`}
                    className="font-heading text-sm text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors block mb-4"
                  >
                    {category.title} →
                  </Link>
                  <ul className="space-y-3 text-xs">
                    {category.articles.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/blog/${a.slug}/`}
                          className={`block transition-colors ${
                            a.slug === article.slug
                              ? "font-semibold text-[var(--color-amber)] border-l-2 pl-2 border-[var(--color-amber)]"
                              : "text-[var(--color-muted)] hover:text-[var(--color-brown)]"
                          }`}
                        >
                          {a.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>

          {/* Related articles at bottom */}
          {related.length > 0 && (
            <section className="mt-24 pt-14 border-t border-[var(--color-sandDark)]/60">
              <div className="mb-10">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
                  {ui.continueReading}
                </p>
                <h3 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
                  {ui.relatedArticles}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
                {related.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
