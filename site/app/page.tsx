import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getAllCategories, getAllArticles } from "@/lib/content";
import { getAllServices } from "@/lib/services";
import ArticleCard from "@/components/ArticleCard";
import CategoryCard from "@/components/CategoryCard";
import ServiceCard from "@/components/ServiceCard";

export default function HomePage() {
  const categories = getAllCategories();
  const articles = getAllArticles();
  const services = getAllServices();

  // Curated single featured article with an image
  const featuredArticle =
    articles.find((a) => a.coverImage) ?? articles[0];

  // Secondary editorial selection (3 articles)
  const editorialArticles = articles
    .filter((a) => a.slug !== featuredArticle?.slug)
    .slice(0, 3);

  // Six primary categories
  const featuredCategories = categories.slice(0, 6);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)]">
        <div className="max-w-5xl mx-auto px-5 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl">
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

      {/* ── Single Editorial Featured Article ─────────────── */}
      {featuredArticle && (
        <section className="max-w-5xl mx-auto px-5 py-16 md:py-20 border-b border-[var(--color-sandDark)]">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
              Επιλεγμένο Άρθρο
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
              Από τη Βιβλιοθήκη
            </h2>
          </div>

          <ArticleCard article={featuredArticle} featured={true} />

          {editorialArticles.length > 0 && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-[var(--color-sand)]">
              {editorialArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Browse Library / Categories ───────────────────── */}
      <section className="max-w-5xl mx-auto px-5 py-16 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[var(--color-sandDark)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
              Θεματικοί Πυλώνες
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
              Εξερεύνησε ανά Ενότητα
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors"
          >
            Όλες οι {categories.length} Ενότητες <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCategories.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>
    </>
  );
}
