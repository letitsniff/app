import type { Metadata } from "next";
import { getAllCategories } from "@/lib/content";
import ArticleCard from "@/components/ArticleCard";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Άρθρα & Οδηγοί",
  description:
    "Βιβλιοθήκη άρθρων για θετική εκπαίδευση σκύλων στην Αθήνα — βόλτα, αντιδραστικότητα, κουτάβια, υιοθεσία και πολλά άλλα.",
};

export default function BlogPage() {
  const categories = getAllCategories();
  const totalArticles = categories.reduce((s, c) => s + c.articles.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      {/* Page header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-[var(--color-sand)] text-[var(--color-amber)] text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <BookOpen size={14} />
          <span>{totalArticles} Άρθρα · {categories.length} Ενότητες</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] mb-4 leading-tight">
          Βιβλιοθήκη Γνώσης
        </h1>
        <p className="text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
          Οδηγοί, άρθρα και απαντήσεις σε καθημερινές απορίες για σκύλους που
          ζουν στην πόλη — γραμμένα με επιστημονική ακρίβεια και πρακτική
          σκοπιά.
        </p>
      </div>

      {/* All categories with their articles */}
      <div className="space-y-16">
        {categories.map((cat) => (
          <section key={cat.slug} id={cat.slug}>
            {/* Category header with optional cover image */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-[var(--color-sandDark)]">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
                  Ενότητα {String(cat.number).padStart(2, "0")}
                </p>
                <h2 className="font-heading text-2xl md:text-3xl text-[var(--color-brown)]">
                  {cat.title}
                </h2>
                {cat.intro && (
                  <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed max-w-2xl">
                    {cat.intro}
                  </p>
                )}
              </div>
              {cat.coverImage && (
                <div className="w-full md:w-64 aspect-[16/10] md:h-36 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border border-[var(--color-sandDark)]/20">
                  <img
                    src={cat.coverImage}
                    alt={cat.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Articles grid */}
            {cat.articles.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.articles.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)] italic">
                Τα άρθρα αυτής της ενότητας έρχονται σύντομα.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
