import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-brown)] text-[var(--color-sandDark)] mt-24">
      <div className="max-w-6xl mx-auto px-5 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl text-white font-semibold">Let It Sniff</span>
          </div>
          <p className="text-sm text-[var(--color-mutedLight)] leading-relaxed">
            Θετική εκπαίδευση σκύλων στην Αθήνα.<br />
            Επιστημονική, ανθρώπινη, αποτελεσματική.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-heading text-sm font-semibold uppercase tracking-widest mb-4">
            Σύνδεσμοι
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/blog", label: "Άρθρα & Οδηγοί" },
              { href: "/ypiresies", label: "Υπηρεσίες" },
              { href: "/o-alexandros", label: "Ο Αλέξανδρος" },
              { href: "/o-alexandros#epikoinonia", label: "Επικοινωνία" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[var(--color-mutedLight)] hover:text-[var(--color-amberLight)] transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-heading text-sm font-semibold uppercase tracking-widest mb-4">
            Επικοινωνία
          </h3>
          <p className="text-sm text-[var(--color-mutedLight)] leading-relaxed">
            Αθήνα, Ελλάδα<br />
            <a
              href="mailto:info@letitsniff.gr"
              className="hover:text-[var(--color-amberLight)] transition-colors"
            >
              info@letitsniff.gr
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--color-brownMid)] py-5 text-center text-xs text-[var(--color-muted)]">
        © {new Date().getFullYear()} Let It Sniff — Αλέξανδρος, Εκπαιδευτής Σκύλων, Αθήνα
      </div>
    </footer>
  );
}
