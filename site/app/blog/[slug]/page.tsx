import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import {
  getAllArticles,
  getArticleBySlug,
  getCategoryBySlug,
  CATEGORY_COLORS,
} from "@/lib/content";
import { getServiceBySlug } from "@/lib/services";
import Prose from "@/components/Prose";
import ArticleCard from "@/components/ArticleCard";

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
    <div>
      {/* ── Article header ──────────────────────────────── */}
      <div
        className="pt-12 pb-10"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${color} 8%, var(--color-cream)), var(--color-cream))`,
        }}
      >
        <div className="max-w-4xl mx-auto px-5">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-amber)] transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Πίσω στη Βιβλιοθήκη
          </Link>

          {/* Category badge */}
          <span
            className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 15%, white)`,
              color,
            }}
          >
            {article.categoryTitle}
          </span>

          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[var(--color-brown)] leading-tight mb-5">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {article.readingTime}
            </span>
            <span className="text-[var(--color-sandDark)]">·</span>
            <span>Αλέξανδρος</span>
            <span className="text-[var(--color-sandDark)]">·</span>
            <span>letitsniff.gr</span>
          </div>
        </div>
      </div>

      {/* ── Content + sidebar ───────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-14">
          {/* Article body */}
          <article>
            <Prose html={article.htmlContent} />
          </article>

          {/* Sidebar */}
          <aside className="mt-12 lg:mt-0 space-y-6">
            {/* CTA card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: `color-mix(in srgb, ${color} 10%, var(--color-cream))`,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <h3 className="font-heading text-lg text-[var(--color-brown)] mb-2">
                Θες Βοήθεια;
              </h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                Ο Αλέξανδρος εκπαιδεύει σκύλους στην Αθήνα με αποκλειστικά
                θετικές μεθόδους.
              </p>
              <Link
                href="/o-alexandros#epikoinonia"
                className="inline-block w-full text-center text-sm font-medium text-white py-2.5 rounded-xl transition-colors"
                style={{ backgroundColor: color }}
              >
                Επικοινώνησε μαζί μου
              </Link>
            </div>

            {/* Related service */}
            {relatedService && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-sandDark)]/30">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-3">
                  Σχετική Υπηρεσία
                </p>
                <div className="text-3xl mb-2">{relatedService.icon}</div>
                <h3 className="font-heading text-base text-[var(--color-brown)] mb-1">
                  {relatedService.title}
                </h3>
                <p className="text-xs text-[var(--color-muted)] mb-4 leading-relaxed">
                  {relatedService.tagline}
                </p>
                <Link
                  href={`/ypiresies/${relatedService.slug}/`}
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-amber)] font-medium hover:text-[var(--color-amberDark)] transition-colors"
                >
                  Μάθε περισσότερα <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {/* Category nav */}
            {category && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-sandDark)]/30">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-3">
                  Ενότητα {String(category.number).padStart(2, "0")}
                </p>
                <h3 className="font-heading text-sm text-[var(--color-brown)] mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.articles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/blog/${a.slug}/`}
                        className={`text-xs leading-snug block hover:text-[var(--color-amber)] transition-colors ${
                          a.slug === article.slug
                            ? "text-[var(--color-amber)] font-medium"
                            : "text-[var(--color-muted)]"
                        }`}
                      >
                        {a.slug === article.slug ? "→ " : ""}
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[var(--color-sandDark)]">
            <h2 className="font-heading text-2xl text-[var(--color-brown)] mb-6">
              Διάβασε Επίσης
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
