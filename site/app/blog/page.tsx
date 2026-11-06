import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import {
  getAllCategories,
  getAllArticles,
  THEMATIC_CLUSTERS,
} from "@/lib/content";
import CategoryCard from "@/components/CategoryCard";

export const metadata: Metadata = {
  title: "Βιβλιοθήκη Άρθρων & Οδηγών Εκπαίδευσης",
  description:
    "Οργανωμένη βιβλιοθήκη θετικής εκπαίδευσης σκύλων στην Αθήνα — θεματικοί οδηγοί και άρθρα για τη βόλτα, το διαμέρισμα, την αντιδραστικότητα, το κουτάβι και την υιοθεσία.",
};

export default function BlogPage() {
  const categories = getAllCategories();
  const allArticles = getAllArticles();
  const totalArticles = allArticles.length;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
      {/* ── Page Header ───────────────────────────────────── */}
      <header className="mb-14 pb-8 border-b border-[var(--color-sandDark)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amber)] mb-2">
          Βιβλιοθήκη Γνώσης · {categories.length} Θεματικές Ενότητες · {totalArticles} Άρθρα
        </p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] mb-4">
          Άρθρα & Πρακτικοί Οδηγοί
        </h1>
        <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
          Απαντήσεις, συμπεριφορική ανάλυση και επιστημονική γνώση για την καθημερινότητα με τον σκύλο
          στην Αθήνα — οργανωμένα σε θεματικές ενότητες.
        </p>

        {/* Macro-Category Quick Jump Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--color-sand)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] block mb-3">
            Περιήγηση ανά Θεματική Ενότητα:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {THEMATIC_CLUSTERS.map((cluster) => (
              <a
                key={cluster.id}
                href={`#${cluster.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-sandDark)] text-[var(--color-brownMid)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] transition-colors"
              >
                <span className="font-mono font-bold text-[var(--color-amber)]">
                  {String(cluster.number).padStart(2, "0")}.
                </span>
                <span>{cluster.title}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ── Thematic Categories ─────────────────────────────── */}
      <div className="space-y-24">
        {THEMATIC_CLUSTERS.map((cluster) => {
          const clusterCategories = categories.filter((c) => c.macroNumber === cluster.number);

          const clusterArticlesCount = clusterCategories.reduce(
            (sum, c) => sum + c.articles.length,
            0
          );

          return (
            <section
              key={cluster.id}
              id={cluster.id}
              className="scroll-mt-20 pt-2"
            >
              {/* Category Heading */}
              <div className="border-b-2 border-[var(--color-brown)] pb-4 mb-8">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-[var(--color-amber)]" />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--color-amber)]">
                      {`ΘΕΜΑΤΙΚΗ ΕΝΟΤΗΤΑ ${String(cluster.number).padStart(2, "0")}`}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-mutedLight)] font-mono">
                    {clusterCategories.length} πυλώνες · {clusterArticlesCount} οδηγοί
                  </span>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] mb-2">
                  {cluster.title}
                </h2>
                <p className="text-sm text-[var(--color-muted)] max-w-2xl leading-relaxed">
                  {cluster.tagline}
                </p>
              </div>

              {/* Grid of Pillar Cards in this Cluster */}
              <div className="grid sm:grid-cols-2 gap-6">
                {clusterCategories.map((category) => (
                  <CategoryCard
                    key={category.slug}
                    category={category}
                    showCover={true}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Bottom Help & Contact Bar ─────────────────────── */}
      <div className="mt-24 pt-12 border-t border-[var(--color-sandDark)] text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-2 font-semibold">
          Χρειάζεστε εξατομικευμένη καθοδήγηση;
        </p>
        <h3 className="font-heading text-2xl text-[var(--color-brown)] mb-4">
          Συνεδρίες Θετικής Εκπαίδευσης στην Αθήνα
        </h3>
        <p className="text-sm text-[var(--color-muted)] max-w-xl mx-auto mb-6">
          Κάθε σκύλος είναι μοναδικός. Δείτε τις διαθέσιμες υπηρεσίες ή επικοινωνήστε απευθείας με τον
          Αλέξανδρο για κατ’ οίκον αξιολόγηση.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
          <Link
            href="/ypiresies"
            className="px-5 py-2.5 bg-[var(--color-brown)] text-white hover:bg-[var(--color-brownLight)] transition-colors"
          >
            Δείτε τις Υπηρεσίες Εκπαίδευσης
          </Link>
          <Link
            href="/o-alexandros"
            className="px-5 py-2.5 bg-white border border-[var(--color-sandDark)] text-[var(--color-brown)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] transition-colors"
          >
            Γνωρίστε τον Αλέξανδρο
          </Link>
        </div>
      </div>
    </div>
  );
}
