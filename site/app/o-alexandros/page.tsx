import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getAllServices } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Ο Αλέξανδρος",
  description:
    "Γνώρισε τον Αλέξανδρο — εκπαιδευτή σκύλων στην Αθήνα με εξειδίκευση στη θετική ενίσχυση και την αστική συμβίωση.",
};

const PRINCIPLES = [
  "Αποκλειστικά θετική ενίσχυση — χωρίς τιμωρία",
  "Επιστημονική βάση: μάθηση, συμπεριφορά, νευροεπιστήμη",
  "Ο σκύλος μαθαίνει στον δικό του ρυθμό",
  "Δουλεύουμε στο σπίτι σου, στη γειτονιά σου",
  "Διαφάνεια — εξηγώ το γιατί πίσω από κάθε βήμα",
  "Σεβασμός στη φύση του σκύλου — ακόμα και όταν μυρίζει",
];

export default function AboutPage() {
  const services = getAllServices();

  return (
    <div>
      {/* Hero */}
      <section
        className="pt-16 pb-14"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-forest) 10%, var(--color-cream)), var(--color-cream))",
        }}
      >
        <div className="max-w-5xl mx-auto px-5">
          <div className="md:grid md:grid-cols-[1fr_auto] md:gap-12 md:items-start">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-forest)] font-medium mb-4">
                Εκπαιδευτής Σκύλων · Αθήνα
              </p>
              <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-brown)] leading-tight mb-5">
                Γεια, είμαι ο Αλέξανδρος
              </h1>
              <p className="text-lg text-[var(--color-muted)] leading-relaxed max-w-xl mb-6">
                Βοηθάω ανθρώπους και σκύλους να ζουν ήρεμα μαζί στην πόλη.
                Πιστεύω ότι κάθε σκύλος — ανεξάρτητα από ηλικία, φυλή ή ιστορικό
                — μπορεί να μάθει, αρκεί να του δώσουμε τις σωστές συνθήκες.
              </p>
              <Link
                href="#epikoinonia"
                className="inline-flex items-center gap-2 bg-[var(--color-amber)] text-white font-medium px-7 py-3.5 rounded-full hover:bg-[var(--color-amberDark)] transition-colors"
              >
                Επικοινώνησε <ArrowRight size={16} />
              </Link>
            </div>

            {/* Avatar placeholder */}
            <div
              className="hidden md:flex mt-4 md:mt-0 w-56 h-56 rounded-full items-center justify-center text-7xl flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-sand), var(--color-sandDark))",
              }}
            >
              🐕
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="md:grid md:grid-cols-2 md:gap-16 md:items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-3">
              Η Φιλοσοφία μου
            </p>
            <h2 className="font-heading text-3xl text-[var(--color-brown)] mb-5 leading-snug">
              Θετική Εκπαίδευση — Τι Σημαίνει Πραγματικά
            </h2>
            <div className="text-[var(--color-muted)] leading-relaxed space-y-4 text-base">
              <p>
                Η θετική εκπαίδευση δεν είναι «ανεκτικότητα» ή απουσία ορίων.
                Είναι επιστήμη. Βασίζεται στην κατανόηση του πώς μαθαίνει ο
                σκύλος και στη χρήση ανταμοιβής για να χτίζουμε συμπεριφορές
                που θέλουμε — αντί να τιμωρούμε αυτές που δεν θέλουμε.
              </p>
              <p>
                Ζώντας στην Αθήνα, οι σκύλοι μας αντιμετωπίζουν καθημερινές
                προκλήσεις: μηχανάκια, γάτες, πολυσύχναστα πεζοδρόμια,
                μικρά διαμερίσματα. Κάθε πρόγραμμα σχεδιάζεται για{" "}
                <em>αυτή</em> τη ζωή.
              </p>
              <p>
                Το &ldquo;Let It Sniff&rdquo; δεν είναι τυχαίο όνομα. Είναι
                υπενθύμιση ότι ο σκύλος σου έχει ανάγκες που συχνά
                αγνοούμε — και η βόλτα που αφήνουμε τον σκύλο να μυρίζει
                ελεύθερα αξίζει περισσότερο από ώρες μηχανικού τρεξίματος.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-5">
              Αρχές Εκπαίδευσης
            </p>
            <ul className="space-y-3">
              {PRINCIPLES.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "var(--color-forest)" }}
                  />
                  <span className="text-sm text-[var(--color-brownMid)] leading-snug">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-[var(--color-sand)] py-14">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-3">
            Πώς Μπορώ να Βοηθήσω
          </p>
          <h2 className="font-heading text-3xl text-[var(--color-brown)] mb-8">
            Υπηρεσίες
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="epikoinonia" className="max-w-4xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-medium mb-3">
            Επικοινωνία
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-brown)] mb-4">
            Ας Μιλήσουμε για τον Σκύλο σου
          </h2>
          <p className="text-[var(--color-muted)] leading-relaxed max-w-lg mx-auto">
            Γράψε μου μια σύντομη περιγραφή της κατάστασης και θα επικοινωνήσω
            μαζί σου το συντομότερο δυνατό.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-sandDark)]/30 p-8 max-w-lg mx-auto">
          <form className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5 uppercase tracking-wide">
                  Όνομα
                </label>
                <input
                  type="text"
                  className="w-full border border-[var(--color-sandDark)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-brown)] bg-[var(--color-cream)] focus:outline-none focus:border-[var(--color-amber)] transition-colors"
                  placeholder="Το όνομά σου"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-[var(--color-sandDark)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-brown)] bg-[var(--color-cream)] focus:outline-none focus:border-[var(--color-amber)] transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5 uppercase tracking-wide">
                Πες μου για τον σκύλο σου
              </label>
              <textarea
                rows={5}
                className="w-full border border-[var(--color-sandDark)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-brown)] bg-[var(--color-cream)] focus:outline-none focus:border-[var(--color-amber)] transition-colors resize-none"
                placeholder="Ηλικία, φυλή, τι σε απασχολεί..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--color-amber)] text-white font-medium py-3 rounded-xl hover:bg-[var(--color-amberDark)] transition-colors"
            >
              Αποστολή Μηνύματος
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-sandDark)] text-center">
            <p className="text-sm text-[var(--color-muted)]">
              ή γράψε απευθείας στο{" "}
              <a
                href="mailto:info@letitsniff.gr"
                className="text-[var(--color-amber)] hover:underline"
              >
                info@letitsniff.gr
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
