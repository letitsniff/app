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
    <div>
      {/* Header */}
      <div
        className="pt-14 pb-12"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-terra) 8%, var(--color-cream)), var(--color-cream))",
        }}
      >
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terra)] font-medium mb-3">
            Πώς Μπορώ να Βοηθήσω
          </p>
          <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] leading-tight mb-4">
            Υπηρεσίες Εκπαίδευσης
          </h1>
          <p className="text-lg text-[var(--color-muted)] leading-relaxed max-w-2xl">
            Κάθε σκύλος είναι διαφορετικός. Κάθε πρόγραμμα σχεδιάζεται για
            τον συγκεκριμένο σκύλο, στο συγκεκριμένο περιβάλλον, με τον
            συγκεκριμένο τρόπο ζωής σου.
          </p>
        </div>
      </div>

      {/* Services list */}
      <div className="max-w-4xl mx-auto px-5 py-14 space-y-5">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>

      {/* CTA */}
      <section className="bg-[var(--color-sand)] py-14">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="font-heading text-3xl text-[var(--color-brown)] mb-4">
            Δεν Ξέρεις Από Πού να Ξεκινήσεις;
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed mb-7">
            Γράψε μου. Μαζί θα βρούμε τι χρειάζεται ο σκύλος σου και ποιο
            πρόγραμμα ταιριάζει στην καθημερινή σου.
          </p>
          <Link
            href="/o-alexandros#epikoinonia"
            className="inline-flex items-center gap-2 bg-[var(--color-amber)] text-white font-medium px-7 py-3.5 rounded-full hover:bg-[var(--color-amberDark)] transition-colors"
          >
            Επικοινώνησε <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
