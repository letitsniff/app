import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { getAllServices, getServiceBySlug } from "@/lib/services";
import { getAllCategories } from "@/lib/content";
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

  // Find related articles (from linked pillars)
  const categories = getAllCategories();
  const relatedArticles = categories
    .filter((c) => service.pillars.includes(c.number))
    .flatMap((c) => c.articles.slice(0, 1)); // 1 per linked pillar, capped

  return (
    <div>
      {/* Header */}
      <div
        className="pt-12 pb-10"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-terra) 8%, var(--color-cream)), var(--color-cream))",
        }}
      >
        <div className="max-w-4xl mx-auto px-5">
          <Link
            href="/ypiresies"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-amber)] transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Πίσω στις Υπηρεσίες
          </Link>

          <div className="text-5xl mb-5">{service.icon}</div>
          <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] leading-tight mb-3">
            {service.title}
          </h1>
          <p className="text-xl text-[var(--color-muted)] leading-relaxed max-w-xl mb-6">
            {service.tagline}
          </p>

          <div className="flex flex-wrap gap-4">
            {service.duration && (
              <span className="inline-flex items-center gap-2 bg-[var(--color-sand)] text-[var(--color-muted)] text-sm px-4 py-1.5 rounded-full">
                <Clock size={13} /> {service.duration}
              </span>
            )}
            <Link
              href="/o-alexandros#epikoinonia"
              className="inline-flex items-center gap-2 bg-[var(--color-amber)] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[var(--color-amberDark)] transition-colors"
            >
              Κλείσε Συνεδρία <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-14">
          <article>
            <Prose html={service.htmlContent} />
          </article>

          <aside className="mt-10 lg:mt-0 space-y-6">
            {/* Price info */}
            {service.price && (
              <div className="bg-[var(--color-sand)] rounded-2xl p-6">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2">
                  Τιμολόγηση
                </p>
                <p className="font-heading text-[var(--color-brown)]">
                  {service.price}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="bg-[var(--color-brown)] rounded-2xl p-6 text-center">
              <h3 className="font-heading text-lg text-white mb-2">
                Ξεκίνα Σήμερα
              </h3>
              <p className="text-sm text-[var(--color-sandDark)] mb-4 leading-relaxed">
                Επικοινώνησε για μια δωρεάν αρχική αξιολόγηση.
              </p>
              <Link
                href="/o-alexandros#epikoinonia"
                className="block w-full text-center bg-[var(--color-amber)] text-white text-sm font-medium py-3 rounded-xl hover:bg-[var(--color-amberDark)] transition-colors"
              >
                Επικοινώνησε
              </Link>
            </div>

            {/* Other services */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--color-sandDark)]/30">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-4">
                Άλλες Υπηρεσίες
              </p>
              <div className="space-y-3">
                {getAllServices()
                  .filter((s) => s.slug !== service.slug)
                  .map((s) => (
                    <Link
                      key={s.slug}
                      href={`/ypiresies/${s.slug}/`}
                      className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-amber)] transition-colors"
                    >
                      <span>{s.icon}</span>
                      <span>{s.title}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[var(--color-sandDark)]">
            <h2 className="font-heading text-2xl text-[var(--color-brown)] mb-6">
              Διάβασε Σχετικά Άρθρα
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.slice(0, 3).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
