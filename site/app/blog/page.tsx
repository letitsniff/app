import type { Metadata } from "next";
import { getAllCategories } from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import { CATEGORY_COLORS } from "@/lib/content";
import { getImageVariants } from "@/lib/images";

export const metadata: Metadata = {
  title: "Άρθρα & Οδηγοί",
  description:
    "Βιβλιοθήκη άρθρων για θετική εκπαίδευση σκύλων στην Αθήνα — βόλτα, αντιδραστικότητα, κουτάβια, υιοθεσία και πολλά άλλα.",
};

export default function BlogPage() {
  const categories = getAllCategories();
  const totalArticles = categories.reduce((s, c) => s + c.articles.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
      {/* Page header */}
      <header className="mb-14 pb-8 border-b border-[var(--color-sandDark)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amber)] mb-2">
          Βιβλιοθήκη Γνώσης · {totalArticles} Άρθρα
        </p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] mb-4">
          Άρθρα & Πρακτικοί Οδηγοί
        </h1>
        <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
          Απαντήσεις, οδηγίες και συμπεριφορική ανάλυση για την καθημερινότητα με έναν σκύλο στην Αθήνα —
          τεκμηριωμένα, ανθρώπινα και με σεβασμό.
        </p>

        {/* Quick jump anchor bar */}
        <div className="mt-8 pt-6 border-t border-[var(--color-sand)] flex flex-wrap gap-2 text-xs">
          <span className="text-[var(--color-mutedLight)] self-center mr-1">Ενότητες:</span>
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`#${cat.slug}`}
              className="px-2.5 py-1 bg-white border border-[var(--color-sandDark)] text-[var(--color-brownMid)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] transition-colors"
            >
              {String(cat.number).padStart(2, "0")}. {cat.title.split("&")[0].trim()}
            </a>
          ))}
        </div>
      </header>

      {/* Categories and their articles */}
      <div className="space-y-20">
        {categories.map((cat, catIndex) => {
          const color = CATEGORY_COLORS[cat.number] ?? "#C4852A";
          const catVariants = getImageVariants(cat.coverImage);
          return (
            <section key={cat.slug} id={cat.slug} className="scroll-mt-20">
              {/* Category header */}
              <div
                className="border-l-4 pl-4 sm:pl-6 pb-2 mb-8"
                style={{ borderColor: color }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-xs font-mono font-bold tracking-wider"
                    style={{ color }}
                  >
                    ΕΝΟΤΗΤΑ {String(cat.number).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-[var(--color-mutedLight)]">
                    · {cat.articles.length} {cat.articles.length === 1 ? "άρθρο" : "άρθρα"}
                  </span>
                </div>
                <h2 className="font-heading text-2xl md:text-3xl text-[var(--color-brown)] mb-2">
                  {cat.title}
                </h2>
                {cat.intro && (
                  <p className="text-sm text-[var(--color-muted)] max-w-3xl leading-relaxed">
                    {cat.intro}
                  </p>
                )}
              </div>

              {/* Category cover banner if present */}
              {cat.coverImage && (
                <div className="mb-8 overflow-hidden bg-[var(--color-sand)] max-h-64 border border-[var(--color-sandDark)]/40">
                  <picture>
                    {catVariants?.card && (
                      <source type="image/webp" srcSet={catVariants.card} />
                    )}
                    <img
                      src={cat.coverImage}
                      alt={cat.title}
                      width={1200}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              )}

              {/* Articles grid */}
              {cat.articles.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cat.articles.map((a, aIndex) => (
                    <ArticleCard
                      key={a.slug}
                      article={a}
                      priority={catIndex === 0 && aIndex < 3}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted)] italic py-4">
                  Τα άρθρα αυτής της ενότητας ανανεώνονται σύντομα.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
