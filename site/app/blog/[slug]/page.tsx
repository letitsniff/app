import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import {
  getAllArticles,
  getArticleBySlug,
  getCategoryBySlug,
  CATEGORY_COLORS,
} from "@/lib/content";
import { getServiceBySlug } from "@/lib/services";
import Prose from "@/components/Prose";
import ArticleCard from "@/components/ArticleCard";
import ReadingProgress from "@/components/ReadingProgress";

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
  const color = CATEGORY_COLORS[article.categoryNumber] ?? "#C4852A";

  // Related articles (same category, excluding current)
  const related = (category?.articles ?? [])
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // Related service
  const relatedService =
    article.relatedService[0]
      ? getServiceBySlug(article.relatedService[0])
      : undefined;

  return (
    <>
      <ReadingProgress color={color} />

      <article className="min-h-screen">
        {/* ── Editorial Header ────────────────────────────── */}
        <header className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)] pt-12 pb-10">
          <div className="max-w-4xl mx-auto px-5">
            {/* Breadcrumb navigation */}
            <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
              <Link href="/blog" className="hover:text-[var(--color-brown)] transition-colors">
                Βιβλιοθήκη
              </Link>
              <span>/</span>
              {category && (
                <Link
                  href={`/blog#${category.slug}`}
                  className="hover:text-[var(--color-brown)] transition-colors line-clamp-1"
                >
                  {category.title}
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color }}
              >
                {article.categoryTitle}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--color-brown)] leading-[1.15] mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)] pt-4 border-t border-[var(--color-sand)]">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={13} /> {article.readingTime}
              </span>
              <span>·</span>
              <span>Κείμενο: Αλέξανδρος</span>
              <span>·</span>
              <span>Let It Sniff</span>
            </div>
          </div>
        </header>

        {/* ── Cover Image (Full Width Editorial) ───────────── */}
        {article.coverImage && (
          <div className="max-w-4xl mx-auto px-5 pt-8">
            <div className="overflow-hidden bg-[var(--color-sand)] border border-[var(--color-sandDark)]/60">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full aspect-[16/9] md:aspect-[21/10] object-cover"
              />
            </div>
          </div>
        )}

        {/* ── Content & Editorial Sidebar ─────────────────── */}
        <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-16 items-start">
            {/* Article Prose */}
            <main>
              <Prose html={article.htmlContent} />
            </main>

            {/* Sticky Sidebar */}
            <aside className="mt-14 lg:mt-0 space-y-8 lg:sticky lg:top-20">
              {/* Contextual Consultation Box */}
              <div
                className="bg-white border-l-4 p-6 border-y border-r border-[var(--color-sandDark)]/70"
                style={{ borderLeftColor: color }}
              >
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-2">
                  Εξατομικευμένη Καθοδήγηση
                </p>
                <h3 className="font-heading text-lg text-[var(--color-brown)] mb-3">
                  Αντιμετωπίζετε παρόμοια πρόκληση;
                </h3>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-5">
                  Κάθε σκύλος και κάθε σπίτι στην πόλη είναι μοναδικά. Μπορούμε να δουλέψουμε μαζί
                  με εξατομικευμένο πλάνο θετικής εκπαίδευσης.
                </p>
                <Link
                  href="/o-alexandros#epikoinonia"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
                >
                  Επικοινωνία με τον Αλέξανδρο <ArrowRight size={13} />
                </Link>
              </div>

              {/* Related Service */}
              {relatedService && (
                <div className="bg-[var(--color-sand)]/40 border border-[var(--color-sandDark)] p-6">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-3">
                    Σχετική Υπηρεσία
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
                    Μάθετε περισσότερα <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              {/* In the same category */}
              {category && category.articles.length > 1 && (
                <div className="pt-6 border-t border-[var(--color-sandDark)]">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-3">
                    Περισσότερα στην ενότητα
                  </p>
                  <h4 className="font-heading text-sm text-[var(--color-brown)] mb-3">
                    {category.title}
                  </h4>
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
            <section className="mt-20 pt-10 border-t border-[var(--color-sandDark)]">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
                  Συνέχεια Ανάγνωσης
                </p>
                <h3 className="font-heading text-2xl text-[var(--color-brown)]">
                  Σχετικά Άρθρα
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
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
