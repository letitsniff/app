import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import {
  getAllCategories,
  getAllArticles,
  THEMATIC_CLUSTERS,
} from "@/lib/content";
import { getAllServices } from "@/lib/services";
import { getImageVariants } from "@/lib/images";
import { getHomePageContent } from "@/lib/siteContent";
import ServiceCard from "@/components/ServiceCard";

function renderEmphasizedTitle(title: string) {
  const parts = title.split(/(\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="text-[var(--color-amber)] italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function HomePage() {
  const categories = getAllCategories();
  const allArticles = getAllArticles();
  const services = getAllServices();
  const page = getHomePageContent();

  const heroImage = getImageVariants(page.hero.image);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)]">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-12 sm:pt-16 sm:pb-14 md:pt-24 md:pb-20">
          <div className="max-w-3xl mb-8 sm:mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amber)] mb-3 sm:mb-4">
              {page.hero.kicker}
            </p>

            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl text-[var(--color-brown)] leading-[1.15] sm:leading-[1.1] mb-5 sm:mb-6 break-words">
              {renderEmphasizedTitle(page.hero.title)}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] leading-relaxed mb-6 sm:mb-8 max-w-2xl font-light">
              {page.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href={page.hero.link1}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-3.5 hover:bg-[var(--color-brownMid)] transition-colors w-full sm:w-auto"
              >
                {page.hero.button1} <ArrowRight size={15} />
              </Link>
              <Link
                href={page.hero.link2}
                className="inline-flex items-center justify-center gap-2 border border-[var(--color-sandDark)] bg-white text-[var(--color-brown)] text-sm font-medium px-6 py-3.5 hover:border-[var(--color-brown)] transition-colors w-full sm:w-auto"
              >
                <BookOpen size={15} />
                {page.hero.button2}
              </Link>
            </div>
          </div>

          {heroImage && (
            <div className="w-full">
              <div className="relative aspect-[16/9] md:aspect-[2.4/1] w-full overflow-hidden bg-[var(--color-sand)] border border-[var(--color-sandDark)]/80 shadow-xs">
                <picture>
                  <source srcSet={heroImage.hero} media="(min-width: 768px)" type="image/webp" />
                  <source srcSet={heroImage.card} type="image/webp" />
                  <img
                    src={heroImage.src}
                    alt={page.hero.alt}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Services Section (Front & Center) ─────────────── */}
      {services.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-10 pb-4 border-b border-[var(--color-sandDark)]">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
                {page.services.kicker}
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
                {page.services.title}
              </h2>
            </div>
            <Link
              href={page.services.linkUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors"
            >
              {page.services.linkText} <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} variant="hero" />
            ))}
          </div>
        </section>
      )}

      {/* ── Philosophy / Alex Statement ───────────────────── */}
      <section className="bg-[var(--color-brown)] text-[var(--color-sand)] py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[var(--color-amberLight)] font-semibold mb-4 block">
              {page.philosophy.kicker}
            </span>
            <blockquote className="font-heading text-2xl sm:text-3xl md:text-4xl text-white leading-snug mb-6">
              {page.philosophy.quote}
            </blockquote>
            <p className="text-[var(--color-sandDark)] text-base md:text-lg leading-relaxed mb-8 font-light whitespace-pre-line">
              {page.philosophy.body}
            </p>
            <Link
              href={page.philosophy.linkUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--color-amberLight)] hover:text-white transition-colors"
            >
              {page.philosophy.linkText} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Knowledge Library / Thematic Categories ──────── */}
      <section className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-10 pb-4 border-b border-[var(--color-sandDark)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-semibold mb-1">
              {page.library.kicker} · {categories.length} {page.library.pillarsSuffix} · {allArticles.length} Οδηγοί
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[var(--color-brown)]">
              {page.library.title}
            </h2>
          </div>
          <Link
            href={page.library.linkUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors self-start sm:self-auto"
          >
            {page.library.linkText} <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {THEMATIC_CLUSTERS.map((cluster) => {
            const clusterCategories = categories.filter((c) => c.macroNumber === cluster.number);

            return (
              <div
                key={cluster.id}
                className="flex flex-col justify-between bg-white border border-[var(--color-sandDark)]/80 p-5 sm:p-7 hover:border-[var(--color-sandDark)] transition-colors shadow-xs"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
                    <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[var(--color-amber)]">
                      {`${page.library.badgePrefix} ${String(cluster.number).padStart(2, "0")}`}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[var(--color-mutedLight)] font-mono">
                      {clusterCategories.length} {page.library.pillarsSuffix}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl text-[var(--color-brown)] mb-2">
                    {cluster.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed mb-5">
                    {cluster.tagline}
                  </p>

                  {/* Pillars in this category */}
                  <ul className="mb-6 pt-4 border-t border-[var(--color-sand)] text-xs">
                    {clusterCategories.map((cat) => {
                      const color = cat.color || "#C4852A";
                      return (
                        <li key={cat.slug} className="min-w-0">
                          <Link
                            href={`/blog/enotita/${cat.slug}/`}
                            className="group flex items-start justify-between gap-3 text-[var(--color-brownMid)] hover:text-[var(--color-amber)] transition-colors py-2.5 sm:py-2 border-b border-[var(--color-sand)]/60 last:border-b-0 min-w-0"
                          >
                            <span className="flex items-start gap-2.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0 mt-1"
                                style={{ backgroundColor: color }}
                              />
                              <span className="leading-snug text-[13px] sm:text-xs text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors">
                                <span className="font-mono font-bold text-[var(--color-amber)] mr-1">
                                  {String(cat.number).padStart(2, "0")}.
                                </span>
                                {cat.title}
                              </span>
                            </span>
                            <span className="text-[11px] text-[var(--color-mutedLight)] shrink-0 font-mono mt-0.5 whitespace-nowrap group-hover:text-[var(--color-amber)] transition-colors">
                              {cat.articles.length} {page.library.articlesSuffix}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--color-sand)]">
                  <Link
                    href={`/blog#${cluster.id}`}
                    className="inline-flex items-center justify-between sm:justify-start gap-1.5 text-xs font-semibold text-[var(--color-amber)] hover:text-[var(--color-brown)] transition-colors w-full sm:w-auto"
                  >
                    <span>{page.library.clusterLinkText}</span>
                    <ArrowRight size={13} className="shrink-0" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
