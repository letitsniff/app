import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import {
  getAllCategories,
  THEMATIC_CLUSTERS,
  CATEGORY_COLORS,
} from "@/lib/content";
import { getAllServices } from "@/lib/services";
import { getImageVariants } from "@/lib/images";
import ServiceCard from "@/components/ServiceCard";

export default function HomePage() {
  const categories = getAllCategories();
  const services = getAllServices();

  const heroImage = getImageVariants("/images/hero-home.jpg");

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)]">
        <div className="max-w-5xl mx-auto px-5 pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="max-w-3xl mb-10 md:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amber)] mb-4">
              Εκπαίδευση Σκύλων στην Αθήνα
            </p>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[var(--color-brown)] leading-[1.1] mb-6">
              Άφησε τον σκύλο σου{" "}
              <em className="text-[var(--color-amber)] italic">να μυρίσει</em>{" "}
              τη ζωή στην πόλη.
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-muted)] leading-relaxed mb-8 max-w-2xl font-light">
              Επιστημονική, θετική εκπαίδευση προσαρμοσμένη στις πραγματικές
              συνθήκες της Αθήνας. Ήρεμες βόλτες, συμβίωση χωρίς πίεση και ουσιαστικός δεσμός εμπιστοσύνης.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/ypiresies"
                className="inline-flex items-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-3.5 hover:bg-[var(--color-brownMid)] transition-colors"
              >
                Υπηρεσίες Εκπαίδευσης <ArrowRight size={15} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-[var(--color-sandDark)] bg-white text-[var(--color-brown)] text-sm font-medium px-6 py-3.5 hover:border-[var(--color-brown)] transition-colors"
              >
                <BookOpen size={15} />
                Βιβλιοθήκη Άρθρων
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
                    alt="Χαρούμενος σκύλος και κηδεμόνας σε χαλαρή βόλτα στην Αθήνα"
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
        <section className="max-w-5xl mx-auto px-5 py-16 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[var(--color-sandDark)]">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
                Συνεργασία & Καθοδήγηση
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
                Πώς Δουλεύουμε Μαζί
              </h2>
            </div>
            <Link
              href="/ypiresies"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors"
            >
              Όλες οι Υπηρεσίες <ArrowRight size={13} />
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
      <section className="bg-[var(--color-brown)] text-[var(--color-sand)] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[var(--color-amberLight)] font-semibold mb-4 block">
              Η Προσέγγιση
            </span>
            <blockquote className="font-heading text-2xl sm:text-3xl md:text-4xl text-white leading-snug mb-6">
              «Η βόλτα δεν είναι άσκηση υπακοής. Είναι το παράθυρο του σκύλου στον κόσμο.»
            </blockquote>
            <p className="text-[var(--color-sandDark)] text-base md:text-lg leading-relaxed mb-8 font-light">
              Χωρίς βία, χωρίς πνίχτες και εκφοβισμούς. Η θετική ενίσχυση στηρίζεται στη
              συμπεριφορική επιστήμη και στον σεβασμό των αναγκών του ζώου μέσα στο
              απαιτητικό αστικό περιβάλλον.
            </p>
            <Link
              href="/o-alexandros"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--color-amberLight)] hover:text-white transition-colors"
            >
              Γνωρίστε τον Αλέξανδρο και τη μεθοδολογία <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Knowledge Library / Thematic Categories ──────── */}
      <section className="max-w-5xl mx-auto px-5 py-16 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[var(--color-sandDark)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-semibold mb-1">
              Βιβλιοθήκη Γνώσης · 18 Πυλώνες · 104 Οδηγοί
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[var(--color-brown)]">
              Εξερευνήστε ανά Θεματική Ενότητα
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors"
          >
            Όλοι οι Οδηγοί & Πυλώνες <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {THEMATIC_CLUSTERS.map((cluster) => {
            const clusterCategories = categories.filter((c) => c.macroNumber === cluster.number);

            return (
              <div
                key={cluster.id}
                className="flex flex-col justify-between bg-white border border-[var(--color-sandDark)]/80 p-6 sm:p-7 hover:border-[var(--color-sandDark)] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-amber)]">
                      {`ΘΕΜΑΤΙΚΗ ΕΝΟΤΗΤΑ ${String(cluster.number).padStart(2, "0")}`}
                    </span>
                    <span className="text-xs text-[var(--color-mutedLight)]">
                      {clusterCategories.length} πυλώνες
                    </span>
                  </div>

                  <h3 className="font-heading text-xl text-[var(--color-brown)] mb-2">
                    {cluster.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed mb-6">
                    {cluster.tagline}
                  </p>

                  {/* Pillars in this category */}
                  <ul className="space-y-2 mb-6 pt-4 border-t border-[var(--color-sand)] text-xs">
                    {clusterCategories.map((cat) => {
                      const color = cat.color ?? CATEGORY_COLORS[cat.slug] ?? CATEGORY_COLORS[cat.number] ?? "#C4852A";
                      return (
                        <li key={cat.slug}>
                          <Link
                            href={`/blog/enotita/${cat.slug}/`}
                            className="group flex items-center justify-between gap-3 text-[var(--color-brownMid)] hover:text-[var(--color-amber)] transition-colors py-1"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="truncate">
                                {String(cat.number).padStart(2, "0")}. {cat.title}
                              </span>
                            </span>
                            <span className="text-[11px] text-[var(--color-mutedLight)] shrink-0 font-mono">
                              {cat.articles.length} άρθρα →
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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-amber)] hover:text-[var(--color-brown)] transition-colors"
                  >
                    <span>Όλοι οι οδηγοί αυτής της ενότητας</span>
                    <ArrowRight size={12} />
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
