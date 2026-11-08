"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, RefreshCw } from "lucide-react";

interface CachedArticle {
  url: string;
  slug: string;
  title: string;
}

export default function CachedPagesList() {
  const [cachedArticles, setCachedArticles] = useState<CachedArticle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function findCached() {
      if (typeof window === "undefined" || !("caches" in window)) {
        setLoaded(true);
        return;
      }

      try {
        const cacheNames = await window.caches.keys();
        const articles: CachedArticle[] = [];
        const seenUrls = new Set<string>();

        for (const name of cacheNames) {
          if (!name.includes("letitsniff")) continue;
          const cache = await window.caches.open(name);
          const requests = await cache.keys();

          for (const req of requests) {
            const parsed = new URL(req.url);
            const path = parsed.pathname;

            // Only capture individual blog articles, ignore root blog hub or static assets
            if (
              path.startsWith("/blog/") &&
              path !== "/blog/" &&
              !path.includes(".") &&
              !seenUrls.has(path)
            ) {
              seenUrls.add(path);
              const slug = path.replace("/blog/", "").replace(/\/$/, "");
              // Friendly title fallback from slug
              const formattedTitle = slug
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              articles.push({
                url: path,
                slug,
                title: formattedTitle,
              });
            }
          }
        }

        setCachedArticles(articles);
      } catch (err) {
        console.warn("Could not retrieve cached articles:", err);
      } finally {
        setLoaded(true);
      }
    }

    findCached();
  }, []);

  return (
    <div className="mt-8 pt-8 border-t border-[var(--color-sandDark)]/60 text-left">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-base font-semibold text-[var(--color-brown)] flex items-center gap-2">
          <BookOpen size={18} className="text-[var(--color-amber)]" />
          Αποθηκευμένοι οδηγοί στη συσκευή σας
        </h3>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-brown)] px-3 py-1.5 rounded-full border border-[var(--color-sandDark)] transition-colors"
          title="Δοκιμή επανασύνδεσης"
        >
          <RefreshCw size={13} /> Δοκιμή επαναφόρτωσης
        </button>
      </div>

      {loaded && cachedArticles.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] leading-relaxed bg-[var(--color-sandLight)] p-4 rounded-lg border border-[var(--color-sandDark)]/40">
          Δεν έχετε ανοίξει ακόμη κάποιο συγκεκριμένο άρθρο σε αυτή τη συσκευή. Μπορείτε να επιστρέψετε στην{" "}
          <Link href="/" className="text-[var(--color-amberText)] underline font-medium">
            Αρχική σελίδα
          </Link>{" "}
          ή στο{" "}
          <Link href="/blog/" className="text-[var(--color-amberText)] underline font-medium">
            Ευρετήριο Blog
          </Link>
          , τα οποία είναι ήδη διαθέσιμα εκτός σύνδεσης.
        </p>
      ) : (
        <ul className="space-y-2">
          {cachedArticles.map((article) => (
            <li key={article.url}>
              <Link
                href={article.url}
                className="block text-sm text-[var(--color-brown)] hover:text-[var(--color-amberText)] bg-[var(--color-sandLight)] hover:bg-[var(--color-sand)]/60 px-4 py-2.5 rounded-lg border border-[var(--color-sandDark)]/40 transition-colors"
              >
                📄 {article.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
