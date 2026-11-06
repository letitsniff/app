import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
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
    .flatMap((c) => c.articles.slice(0, 1));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)] pt-12 pb-10">
        <div className="max-w-4xl mx-auto px-5">
          <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
            <Link href="/ypiresies" className="hover:text-[var(--color-brown)] transition-colors">
              Υπηρεσίες
            </Link>
            <span>/</span>
            <span className="text-[var(--color-brown)]">{service.title}</span>
          </nav>

          <div className="text-4xl mb-3">{service.icon}</div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--color-brown)] leading-tight mb-4">
            {service.title}
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-muted)] leading-relaxed max-w-2xl mb-6 font-light">
            {service.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {service.duration && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-[var(--color-sandDark)] text-[var(--color-brownMid)] px-3 py-1.5">
                <Clock size={13} /> {service.duration}
              </span>
            )}
            <Link
              href="/o-alexandros#epikoinonia"
              className="inline-flex items-center gap-2 bg-[var(--color-brown)] text-white font-medium px-5 py-2 hover:bg-[var(--color-brownMid)] transition-colors"
            >
              Κλείστε Συνεδρία <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16 items-start">
          <main>
            <Prose html={service.htmlContent} />
          </main>

          <aside className="mt-14 lg:mt-0 space-y-6 lg:sticky lg:top-20">
            {/* Price info */}
            {service.price && (
              <div className="bg-white border-l-4 border-[var(--color-terra)] border-y border-r border-[var(--color-sandDark)]/70 p-5">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-1">
                  Τιμολόγηση
                </p>
                <p className="font-heading text-lg text-[var(--color-brown)]">
                  {service.price}
                </p>
              </div>
            )}

            {/* Direct CTA */}
            <div className="bg-[var(--color-brown)] text-white p-6">
              <h3 className="font-heading text-lg text-white mb-2">
                Αρχική Αξιολόγηση
              </h3>
              <p className="text-xs text-[var(--color-sandDark)] mb-5 leading-relaxed font-light">
                Συζητάμε τις ανάγκες του σκύλου σας και σχεδιάζουμε το πρόγραμμα που ταιριάζει
                στο πρόγραμμά σας.
              </p>
              <Link
                href="/o-alexandros#epikoinonia"
                className="block w-full text-center bg-[var(--color-amber)] text-white text-xs font-semibold uppercase tracking-wider py-2.5 hover:bg-[var(--color-amberDark)] transition-colors"
              >
                Επικοινωνία
              </Link>
            </div>

            {/* Other services */}
            <div className="pt-6 border-t border-[var(--color-sandDark)]">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-semibold mb-3">
                Όλες οι Υπηρεσίες
              </p>
              <ul className="space-y-2 text-xs">
                {getAllServices()
                  .filter((s) => s.slug !== service.slug)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/ypiresies/${s.slug}/`}
                        className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-brown)] transition-colors py-1"
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
          <section className="mt-20 pt-10 border-t border-[var(--color-sandDark)]">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
                Σχετική Θεματολογία
              </p>
              <h3 className="font-heading text-2xl text-[var(--color-brown)]">
                Άρθρα για αυτή την Υπηρεσία
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
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
