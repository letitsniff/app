import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, Home, BookOpen, Sparkles, Mail } from "lucide-react";
import { getGlobalSettings } from "@/lib/siteContent";
import CachedPagesList from "@/components/CachedPagesList";

export const metadata: Metadata = {
  title: "Εκτός σύνδεσης",
  description: "Βρίσκεστε εκτός σύνδεσης. Μπορείτε να περιηγηθείτε στις ήδη αποθηκευμένες σελίδες ή να επικοινωνήσετε τηλεφωνικά.",
};

export default function OfflinePage() {
  const global = getGlobalSettings();

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-16 sm:py-24 px-5">
      <div className="max-w-xl mx-auto w-full text-center">
        {/* Offline Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-sandDark)]/40 text-[var(--color-amberText)] mb-6 shadow-inner">
          <WifiOff size={32} />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-amberText)] mb-2">
          Offline Mode
        </p>

        <h1 className="font-heading text-3xl sm:text-4xl text-[var(--color-brown)] mb-4">
          Βρίσκεστε εκτός σύνδεσης
        </h1>

        <p className="text-base text-[var(--color-muted)] leading-relaxed mb-8">
          Η συγκεκριμένη σελίδα δεν έχει αποθηκευτεί ακόμα στη συσκευή σας. Το <strong>Let It Sniff</strong> αποθηκεύει αυτόματα τις σελίδες που επισκέπτεστε ώστε να είναι προσβάσιμες χωρίς internet.
        </p>

        {/* Primary Navigation Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-4 py-3 hover:bg-[var(--color-brownMid)] transition-colors shadow-xs"
          >
            <Home size={16} /> Αρχική
          </Link>
          <Link
            href="/blog/"
            className="flex items-center justify-center gap-2 bg-[var(--color-sand)] text-[var(--color-brown)] text-sm font-medium px-4 py-3 hover:bg-[var(--color-sandDark)]/80 transition-colors border border-[var(--color-sandDark)]"
          >
            <BookOpen size={16} /> Όλοι οι Οδηγοί
          </Link>
          <Link
            href="/ypiresies/"
            className="flex items-center justify-center gap-2 bg-[var(--color-sand)] text-[var(--color-brown)] text-sm font-medium px-4 py-3 hover:bg-[var(--color-sandDark)]/80 transition-colors border border-[var(--color-sandDark)]"
          >
            <Sparkles size={16} /> Υπηρεσίες
          </Link>
        </div>

        {/* Contact Card */}
        {global.email && (
          <div className="bg-[var(--color-sandLight)] border border-[var(--color-sandDark)]/60 rounded-xl p-5 mb-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">
                Επικοινωνία με τον Αλέξανδρο
              </p>
              <p className="text-sm text-[var(--color-brown)]">
                Χρειάζεστε καθοδήγηση για τον σκύλο σας;
              </p>
            </div>
            <a
              href={`mailto:${global.email}`}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[var(--color-brownMid)] transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
            >
              <Mail size={15} /> {global.email}
            </a>
          </div>
        )}

        {/* List of cached guides available */}
        <CachedPagesList />
      </div>
    </div>
  );
}
