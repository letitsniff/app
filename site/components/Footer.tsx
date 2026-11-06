import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-sandDark)] mt-20">
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="font-heading text-lg text-[var(--color-brown)] mb-1">
              Let It Sniff
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Θετική εκπαίδευση σκύλων · Αθήνα
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-muted)]">
            <Link
              href="/blog"
              className="hover:text-[var(--color-brown)] transition-colors"
            >
              Άρθρα
            </Link>
            <Link
              href="/ypiresies"
              className="hover:text-[var(--color-brown)] transition-colors"
            >
              Υπηρεσίες
            </Link>
            <Link
              href="/o-alexandros"
              className="hover:text-[var(--color-brown)] transition-colors"
            >
              Ο Αλέξανδρος
            </Link>
            <a
              href="mailto:info@letitsniff.gr"
              className="hover:text-[var(--color-brown)] transition-colors"
            >
              info@letitsniff.gr
            </a>
          </nav>
        </div>
        <p className="text-xs text-[var(--color-mutedLight)] mt-8">
          © {new Date().getFullYear()} Let It Sniff — Αλέξανδρος, Εκπαιδευτής
          Σκύλων
        </p>
      </div>
    </footer>
  );
}
