import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllServices, getServiceBySlug } from "@/lib/services";
import { getAllCategories } from "@/lib/content";
import { getImageVariants } from "@/lib/images";
import { getGlobalSettings } from "@/lib/siteContent";
import Prose from "@/components/Prose";
import ArticleCard from "@/components/ArticleCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  // Find related articles (from linked categories)
  const categories = getAllCategories();
  const relatedArticles = categories
    .filter((c) => c.relatedService.includes(service.slug))
    .flatMap((c) => c.articles.slice(0, 1));

  const imageVariants = getImageVariants(service.image);

  const { assessmentBox, ui } = getGlobalSettings();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-sandDark)]/60 bg-[var(--color-cream)] pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div className="max-w-4xl mx-auto px-5">
          <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6 min-w-0">
            <Link href="/ypiresies" className="hover:text-[var(--color-brown)] transition-colors shrink-0">
              {ui.allServices}
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-[var(--color-brown)] truncate min-w-0">{service.title}</span>
          </nav>

          {!imageVariants && <div className="text-4xl mb-4">{service.icon}</div>}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--color-brown)] leading-tight mb-5 break-words">
            {service.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] leading-relaxed max-w-2xl mb-8 font-light">
            {service.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs mb-10">
            <Link
              href="/o-alexandros#epikoinonia"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white font-medium px-7 py-3.5 hover:bg-[var(--color-brownMid)] transition-colors w-full sm:w-auto shadow-xs"
            >
              {ui.bookSession} <ArrowRight size={13} />
            </Link>
          </div>

          {imageVariants && (
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-[var(--color-sand)] border border-[var(--color-sandDark)]/60 shadow-sm rounded-sm">
              <picture>
                <source srcSet={imageVariants.hero} media="(min-width: 768px)" type="image/webp" />
                <source srcSet={imageVariants.card} type="image/webp" />
                <img
                  src={imageVariants.src}
                  alt={service.title}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </picture>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-24">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16 items-start">
          <main className="min-w-0 w-full">
            <Prose html={service.htmlContent} />
          </main>

          <aside className="mt-16 lg:mt-0 space-y-8 lg:sticky lg:top-20">
            {/* Direct CTA */}
            <div className="bg-[var(--color-brown)] text-white p-7 rounded-sm shadow-sm">
              <h3 className="font-heading text-lg text-white mb-2">
                {assessmentBox.title}
              </h3>
              <p className="text-xs text-[var(--color-sandDark)] mb-6 leading-relaxed font-light">
                {assessmentBox.text}
              </p>
              <Link
                href={assessmentBox.buttonLink}
                className="block w-full text-center bg-[var(--color-amberDark)] text-white text-xs font-semibold uppercase tracking-wider py-3 hover:bg-[var(--color-brown)] transition-colors rounded-xs shadow-xs"
              >
                {assessmentBox.buttonText}
              </Link>
            </div>

            {/* Other services */}
            <div className="pt-8 border-t border-[var(--color-sandDark)]/60">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-3">
                {ui.allServices}
              </p>
              <ul className="space-y-2 text-xs">
                {getAllServices()
                  .filter((s) => s.slug !== service.slug)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/ypiresies/${s.slug}/`}
                        className="flex items-center gap-2.5 text-[var(--color-muted)] hover:text-[var(--color-brown)] transition-colors py-1.5"
                      >
                        <span>{s.icon}</span>
                        <span>{s.title}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-24 pt-14 border-t border-[var(--color-sandDark)]/60">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
                {ui.relatedTopics}
              </p>
              <h3 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
                {ui.articlesForService}
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
              {relatedArticles.slice(0, 3).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
