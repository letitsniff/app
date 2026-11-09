import Link from "next/link";
import { ArrowRight, BookOpen, Check, Mail, MapPin } from "lucide-react";
import {
  getAllCategories,
  getAllArticles,
  THEMATIC_CLUSTERS,
} from "@/lib/content";
import { getAllServices } from "@/lib/services";
import { getImageVariants } from "@/lib/images";
import { getHomePageContent, getAboutPageContent } from "@/lib/siteContent";
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

function formatCompactPillarTitle(title: string): string {
  return title.replace(/\s*\([A-Za-z0-9\s\-&]+\)\s*$/, "").trim();
}

export default function HomePage() {
  const categories = getAllCategories();
  const allArticles = getAllArticles();
  const services = getAllServices();
  const page = getHomePageContent();
  const about = getAboutPageContent();

  const heroImage = getImageVariants(page.hero.image);
  const corePrinciples = about.principles.slice(0, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)]">
        <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 md:py-18">
          <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Subtitle, and Desktop CTAs */}
            <div className="md:col-span-7">
              {page.hero.kicker && (
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amberText)] mb-3 sm:mb-4">
                  {page.hero.kicker}
                </p>
              )}

              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-[3.4rem] text-[var(--color-brown)] leading-[1.18] sm:leading-[1.15] mb-5 sm:mb-6 break-words">
                {renderEmphasizedTitle(page.hero.title)}
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] leading-relaxed mb-6 sm:mb-8 md:mb-9 max-w-xl font-light">
                {page.hero.subtitle}
              </p>

              {/* Desktop CTAs (hidden on mobile, shown on md+) */}
              <div className="hidden md:flex flex-row items-center gap-4">
                <Link
                  href={page.hero.link1}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-7 py-4 hover:bg-[var(--color-brownMid)] transition-colors w-auto shadow-xs rounded-xs"
                >
                  {page.hero.button1} <ArrowRight size={15} />
                </Link>
                <Link
                  href={page.hero.link2}
                  className="inline-flex items-center justify-center gap-2 border border-[var(--color-sandDark)] bg-white text-[var(--color-brown)] text-sm font-medium px-7 py-4 hover:border-[var(--color-brown)] transition-colors w-auto rounded-xs"
                >
                  <BookOpen size={15} />
                  {page.hero.button2}
                </Link>
              </div>
            </div>

            {/* Right Column: Framed Hero Illustration */}
            {heroImage && (
              <div className="md:col-span-5 flex justify-center md:justify-end my-2 md:my-0">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-none bg-[var(--color-cream)] border border-[var(--color-sandDark)]/80 rounded-sm p-4 sm:p-5 md:p-6 shadow-[6px_6px_0_0_var(--color-sand)] relative overflow-hidden">
                  <div
                    className="absolute inset-x-0 top-0 h-1 bg-[var(--color-amber)]/80"
                    aria-hidden="true"
                  />
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

            {/* Mobile CTAs (shown on mobile, hidden on md+) */}
            <div className="md:hidden flex flex-col items-stretch gap-3 mt-1">
              <Link
                href={page.hero.link1}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-3.5 hover:bg-[var(--color-brownMid)] transition-colors w-full shadow-xs rounded-xs"
              >
                {page.hero.button1} <ArrowRight size={15} />
              </Link>
              <Link
                href={page.hero.link2}
                className="inline-flex items-center justify-center gap-2 border border-[var(--color-sandDark)] bg-white text-[var(--color-brown)] text-sm font-medium px-6 py-3.5 hover:border-[var(--color-brown)] transition-colors w-full rounded-xs"
              >
                <BookOpen size={15} />
                {page.hero.button2}
              </Link>
            </div>
          </div>

          {/* Trust & Context Strip */}
          {page.hero.highlights && page.hero.highlights.length > 0 && (
            <div className="mt-8 sm:mt-10 pt-6 border-t border-[var(--color-sandDark)]/50 grid sm:grid-cols-3 gap-3.5 sm:gap-6">
              {page.hero.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-[13px] text-[var(--color-brownMid)]">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[var(--color-amber)]/15 text-[var(--color-amberText)] flex items-center justify-center">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Services Section (Front & Center) ─────────────── */}
      {services.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20 md:py-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-5 border-b border-[var(--color-sandDark)]/60">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-amberText)] font-semibold mb-2">
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
            {services.map((s, idx) => (
              <ServiceCard key={s.slug} service={s} variant="hero" index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ── Philosophy / Alex Statement ───────────────────── */}
      <section className="bg-[var(--color-brown)] text-[var(--color-sand)] py-20 sm:py-24 md:py-28">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="md:col-span-7">
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

            {corePrinciples.length > 0 && (
              <div className="md:col-span-5 bg-[var(--color-brownMid)]/65 border border-[var(--color-sandDark)]/20 p-6 sm:p-8 rounded-sm">
                <p className="text-xs uppercase tracking-widest text-[var(--color-amberLight)] font-bold mb-5 pb-3 border-b border-[var(--color-sandDark)]/15">
                  {about.methodology.principlesTitle}
                </p>
                <ul className="space-y-4">
                  {corePrinciples.map((principle, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-[var(--color-amber)]/25 text-[var(--color-amberLight)] flex items-center justify-center">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span className="text-xs sm:text-[13px] text-[var(--color-sand)]/90 leading-relaxed">
                        {principle}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Knowledge Library / Thematic Categories (2x2 Grid) ── */}
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20 md:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-5 border-b border-[var(--color-sandDark)]/60">
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

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {THEMATIC_CLUSTERS.map((cluster) => {
            const clusterCategories = categories.filter((c) => c.macroNumber === cluster.number);
            const clusterArticlesCount = clusterCategories.reduce(
              (sum, c) => sum + c.articles.length,
              0
            );
            const accentColor = cluster.color || "#C4852A";

            return (
              <div
                key={cluster.id}
                style={{ borderTopColor: accentColor, borderTopWidth: "3px" }}
                className="group flex flex-col justify-between bg-white border border-[var(--color-sandDark)]/60 p-6 sm:p-8 hover:border-[var(--color-amber)] hover:shadow-md transition-all duration-300 rounded-sm"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span
                      className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-xs whitespace-nowrap"
                      style={{
                        backgroundColor: `${accentColor}15`,
                        color: accentColor,
                      }}
                    >
                      {`${page.library.badgePrefix} ${String(cluster.number).padStart(2, "0")}`}
                    </span>
                    <span className="text-xs text-[var(--color-mutedLight)] font-mono whitespace-nowrap">
                      {clusterCategories.length} {page.library.pillarsSuffix} · {clusterArticlesCount} οδηγοί
                    </span>
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl text-[var(--color-brown)] mb-3 leading-snug">
                    <Link
                      href={`/blog#${cluster.id}`}
                      className="hover:text-[var(--color-amberText)] transition-colors"
                    >
                      {cluster.title}
                    </Link>
                  </h3>

                  <p className="text-sm sm:text-[15px] text-[var(--color-muted)] leading-relaxed mb-6">
                    {cluster.tagline}
                  </p>

                  {/* Interactive Pillar Links */}
                  <div className="flex flex-wrap gap-2 mb-6 pt-5 border-t border-[var(--color-sand)]/70">
                    {clusterCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/blog/enotita/${cat.slug}/`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-[var(--color-sandLight)] border border-[var(--color-sandDark)]/50 text-[var(--color-brownMid)] hover:border-[var(--color-amber)] hover:bg-[var(--color-sand)]/60 hover:text-[var(--color-brown)] transition-colors rounded-xs"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                          aria-hidden="true"
                        />
                        <span>{formatCompactPillarTitle(cat.title)}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-sand)]/70">
                  <Link
                    href={`/blog#${cluster.id}`}
                    className="inline-flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--color-amberText)] hover:text-[var(--color-brown)] transition-colors w-full"
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

      {/* ── Bottom Consultation Callout ───────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-4">
        <div className="bg-white border border-[var(--color-sandDark)]/70 p-8 sm:p-12 md:p-14 rounded-sm shadow-2xs relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-1 bg-[var(--color-amber)]"
            aria-hidden="true"
          />
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amberText)] mb-2.5">
                {page.callout.kicker}
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[var(--color-brown)] mb-4 break-words">
                {page.callout.title}
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed max-w-2xl font-light mb-6">
                {page.callout.description}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-muted)]">
                <a
                  href={`mailto:${about.contact.email}`}
                  className="inline-flex items-center gap-1.5 text-[var(--color-brown)] font-medium hover:text-[var(--color-amberText)] transition-colors"
                >
                  <Mail size={14} className="text-[var(--color-amber)]" />
                  <span>{about.contact.email}</span>
                </a>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-[var(--color-amber)]" />
                  <span>{about.contact.area}</span>
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-stretch gap-3">
              <Link
                href={page.callout.link1}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-4 hover:bg-[var(--color-brownMid)] transition-colors shadow-xs rounded-xs text-center"
              >
                <span>{page.callout.button1}</span>
                <ArrowRight size={15} className="flex-shrink-0" />
              </Link>
              <Link
                href={page.callout.link2}
                className="inline-flex items-center justify-center gap-2 border border-[var(--color-sandDark)] bg-[var(--color-cream)] text-[var(--color-brown)] text-sm font-medium px-6 py-3.5 hover:border-[var(--color-brown)] transition-colors rounded-xs text-center"
              >
                <span>{page.callout.button2}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
