import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllServices } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Υπηρεσίες Εκπαίδευσης",
  description:
    "Θετική εκπαίδευση σκύλων στην Αθήνα — αστική συμβίωση, προβλήματα συμπεριφοράς, κουτάβια, υιοθεσία.",
};

export default function ServicesPage() {
  const services = getAllServices();

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
      {/* Header */}
      <header className="mb-14 pb-8 border-b border-[var(--color-sandDark)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terra)] mb-2">
          Εξατομικευμένα Προγράμματα
        </p>
        <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] mb-4">
          Υπηρεσίες Εκπαίδευσης & Συμβουλευτικής
        </h1>
        <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed">
          Κάθε σκύλος και κάθε κηδεμόνας έχουν διαφορετικούς ρυθμούς και ανάγκες. Τα προγράμματα
          υλοποιούνται στο φυσικό περιβάλλον του σκύλου: στο σπίτι, στην πολυκατοικία και στη γειτονιά.
        </p>
      </header>

      {/* Services list */}
      <div className="space-y-4 mb-16">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>

      {/* Direct Contact Callout */}
      <section className="bg-[var(--color-sand)]/60 border border-[var(--color-sandDark)] p-8 sm:p-12 text-center max-w-2xl mx-auto">
        <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] mb-3">
          Δεν είστε σίγουροι από πού να ξεκινήσετε;
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed mb-6 font-light">
          Περιγράψτε μου συνοπτικά την καθημερινότητα και τις προκλήσεις με τον σκύλο σας.
          Μαζί θα αξιολογήσουμε ποια προσέγγιση είναι η πιο αποτελεσματική.
        </p>
        <Link
          href="/o-alexandros#epikoinonia"
          className="inline-flex items-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-3 hover:bg-[var(--color-brownMid)] transition-colors"
        >
          Επικοινωνία με τον Αλέξανδρο <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
