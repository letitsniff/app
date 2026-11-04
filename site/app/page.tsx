import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { getAllCategories, getAllArticles } from "@/lib/content";
import { getAllServices } from "@/lib/services";
import ArticleCard from "@/components/ArticleCard";
import CategoryCard from "@/components/CategoryCard";
import ServiceCard from "@/components/ServiceCard";

export default function HomePage() {
  const categories = getAllCategories();
  const articles = getAllArticles();
  const services = getAllServices();

  // Pick a few featured articles (first article from first few pillars)
  const featured = categories
    .slice(0, 3)
    .map((c) => c.articles[0])
    .filter(Boolean);

  // Recent articles (first 6 overall)
  const recent = articles.slice(0, 6);

  // Featured categories (first 6)
  const featuredCategories = categories.slice(0, 6);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-cream)]">
        {/* Warm gradient bg */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, color-mix(in srgb, var(--color-amber) 20%, transparent), transparent), radial-gradient(ellipse 60% 80% at 20% 80%, color-mix(in srgb, var(--color-terra) 15%, transparent), transparent)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-[var(--color-sand)] text-[var(--color-amber)] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} />
              <span>Θετική Εκπαίδευση · Αθήνα</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[var(--color-brown)] leading-tight mb-6">
              Άφησε τον σκύλο σου{" "}
              <em className="text-[var(--color-amber)] not-italic">να μυρίσει</em>{" "}
              τη ζωή
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-muted)] leading-relaxed mb-8 max-w-xl">
              Θετική εκπαίδευση για σκύλους που ζουν στην πόλη. Βόλτες χωρίς
              στρες, καθημερινή ήρεμη, δεσμός βαθύς.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-[var(--color-amber)] text-white font-medium px-7 py-3.5 rounded-full hover:bg-[var(--color-amberDark)] transition-colors"
              >
                <BookOpen size={18} />
                Διάβασε τα Άρθρα
              </Link>
              <Link
                href="/ypiresies"
                className="inline-flex items-center gap-2 bg-white text-[var(--color-brown)] font-medium px-7 py-3.5 rounded-full border border-[var(--color-sandDark)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] transition-colors"
              >
                Υπηρεσίες <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 flex flex-wrap gap-8">
            {[
              { value: `${articles.length}+`, label: "Άρθρα & Οδηγοί" },
              { value: `${categories.length}`, label: "Θεματικές Ενότητες" },
              { value: `${services.length}`, label: "Υπηρεσίες" },
              { value: "100%", label: "Θετική Ενίσχυση" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-heading text-3xl font-semibold text-[var(--color-amber)]">
                  {s.value}
                </div>
                <div className="text-sm text-[var(--color-muted)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Articles ─────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-1">
                Για Αρχή
              </p>
              <h2 className="font-heading text-3xl text-[var(--color-brown)]">
                Άρθρα που Αξίζει να Διαβάσεις
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden md:flex items-center gap-1.5 text-sm text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors font-medium"
            >
              Όλα τα Άρθρα <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
          <div className="mt-6 md:hidden">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-amber)] font-medium"
            >
              Όλα τα Άρθρα <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ── Categories ───────────────────────────────────── */}
      <section className="bg-[var(--color-sand)] py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-1">
                Θεματικές Ενότητες
              </p>
              <h2 className="font-heading text-3xl text-[var(--color-brown)]">
                Εξερεύνησε την Βιβλιοθήκη
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden md:flex items-center gap-1.5 text-sm text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors font-medium"
            >
              Όλες οι Ενότητες <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCategories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      {services.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-1">
                Πώς Μπορώ να Βοηθήσω
              </p>
              <h2 className="font-heading text-3xl text-[var(--color-brown)]">
                Υπηρεσίες Εκπαίδευσης
              </h2>
            </div>
            <Link
              href="/ypiresies"
              className="hidden md:flex items-center gap-1.5 text-sm text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors font-medium"
            >
              Όλες οι Υπηρεσίες <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} variant="hero" />
            ))}
          </div>
        </section>
      )}

      {/* ── About teaser ─────────────────────────────────── */}
      <section className="bg-[var(--color-brown)] py-20">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <div className="text-5xl mb-6">🐾</div>
          <h2 className="font-heading text-3xl md:text-4xl text-white mb-5 leading-snug">
            «Κάθε σκύλος αξίζει έναν εκπαιδευτή<br className="hidden md:block" />{" "}
            που τον καταλαβαίνει.»
          </h2>
          <p className="text-[var(--color-sandDark)] text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Ο Αλέξανδρος εκπαιδεύει σκύλους στην Αθήνα με αποκλειστικά θετικές
            μεθόδους. Χωρίς αλυσίδες, χωρίς τιμωρία — μόνο κατανόηση, επιστήμη
            και αγάπη.
          </p>
          <Link
            href="/o-alexandros"
            className="inline-flex items-center gap-2 bg-[var(--color-amber)] text-white font-medium px-7 py-3.5 rounded-full hover:bg-[var(--color-amberLight)] transition-colors"
          >
            Γνώρισε τον Αλέξανδρο <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Recent Articles ───────────────────────────────── */}
      {recent.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-1">
              Πρόσφατα
            </p>
            <h2 className="font-heading text-3xl text-[var(--color-brown)]">
              Νέα στη Βιβλιοθήκη
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-[var(--color-sand)] text-[var(--color-amber)] font-medium px-7 py-3.5 rounded-full hover:bg-[var(--color-sandDark)] transition-colors"
            >
              Δες Όλα τα Άρθρα <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
