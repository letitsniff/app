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
        <em key={idx} className="text-[var(--color-amberText)] italic">
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
      <section className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)]">
        <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 md:py-18">
          <div className="grid md:grid-cols-12 gap-8 md:gap-8 lg:gap-10 items-center">
            {/* Left Column: Headline & CTAs */}
            <div className="md:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amberText)] mb-3 sm:mb-4">
                {page.hero.kicker}
              </p>

              <h1 className="font-heading text-3xl sm:text-5xl lg:text-5xl xl:text-6xl text-[var(--color-brown)] leading-[1.18] sm:leading-[1.12] mb-6 sm:mb-7 break-words">
                {renderEmphasizedTitle(page.hero.title)}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] leading-relaxed mb-8 sm:mb-10 max-w-xl font-light">
                {page.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href={page.hero.link1}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-7 py-4 hover:bg-[var(--color-brownMid)] transition-colors w-full sm:w-auto shadow-xs"
                >
                  {page.hero.button1} <ArrowRight size={15} />
                </Link>
                <Link
                  href={page.hero.link2}
                  className="inline-flex items-center justify-center gap-2 border border-[var(--color-sandDark)]/80 bg-white text-[var(--color-brown)] text-sm font-medium px-7 py-4 hover:border-[var(--color-brown)] transition-colors w-full sm:w-auto"
                >
                  <BookOpen size={15} />
                  {page.hero.button2}
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Illustration (aligned with headline & text) */}
            {heroImage && (
              <div className="md:col-span-5 flex justify-center md:justify-end mt-6 md:mt-0">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-none">
                  <picture>
                    <source srcSet={heroImage.hero} media="(min-width: 768px)" type="image/webp" />
                    <source srcSet={heroImage.card} type="image/webp" />
                    <img
                      src={heroImage.src}
                      alt={page.hero.alt}
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-auto block select-none pointer-events-none"
                    />
                  </picture>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Services Section (Front & Center) ─────────────── */}
      {services.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20 md:py-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-5 border-b border-[var(--color-sandDark)]/60">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">
                {page.services.kicker}
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[var(--color-brown)]">
                {page.services.title}
              </h2>
            </div>
            <Link
              href={page.services.linkUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amberText)] hover:text-[var(--color-brown)] transition-colors"
            >
              {page.services.linkText} <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 md:gap-10">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} variant="hero" />
            ))}
          </div>
        </section>
      )}

      {/* ── Philosophy / Alex Statement ───────────────────── */}
      <section className="bg-[var(--color-brown)] text-[var(--color-sand)] py-20 sm:py-24 md:py-32">
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
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20 md:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-14 pb-5 border-b border-[var(--color-sandDark)]/60">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-amberText)] font-semibold mb-2">
              {page.library.kicker} · {categories.length} {page.library.pillarsSuffix} · {allArticles.length} Οδηγοί
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[var(--color-brown)]">
              {page.library.title}
            </h2>
          </div>
          <Link
            href={page.library.linkUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amberText)] hover:text-[var(--color-brown)] transition-colors self-start sm:self-auto"
          >
            {page.library.linkText} <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {THEMATIC_CLUSTERS.map((cluster) => {
            const clusterCategories = categories.filter((c) => c.macroNumber === cluster.number);
            const clusterArticlesCount = clusterCategories.reduce(
              (sum, c) => sum + c.articles.length,
              0
            );

            return (
              <div
                key={cluster.id}
                className="group flex flex-col justify-between bg-white border border-[var(--color-sandDark)]/60 p-6 sm:p-7 hover:border-[var(--color-amber)] hover:shadow-md transition-all duration-300 rounded-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-amberText)]">
                      {`${page.library.badgePrefix} ${String(cluster.number).padStart(2, "0")}`}
                    </span>
                    <span className="text-xs text-[var(--color-mutedLight)] font-mono">
                      {clusterCategories.length} {page.library.pillarsSuffix} · {clusterArticlesCount} οδηγοί
                    </span>
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors mb-3 leading-snug">
                    {cluster.title}
                  </h3>

                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6 line-clamp-3">
                    {cluster.tagline}
                  </p>

                  {/* Highlights preview */}
                  <div className="flex flex-wrap gap-1.5 mb-6 pt-4 border-t border-[var(--color-sand)]/60">
                    {clusterCategories.map((cat) => (
                      <span
                        key={cat.slug}
                        className="text-[11px] font-medium px-2 py-0.5 bg-[var(--color-sand)]/30 text-[var(--color-brownMid)] rounded-xs"
                      >
                        {cat.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-sand)]/60">
                  <Link
                    href={`/blog#${cluster.id}`}
                    className="inline-flex items-center justify-between text-xs font-semibold text-[var(--color-amberText)] hover:text-[var(--color-brown)] transition-colors w-full"
                  >
                    <span>{page.library.clusterLinkText}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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
