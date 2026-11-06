import type { Metadata } from "next";
import { ArrowRight, Check, Mail, MapPin } from "lucide-react";
import { getAllServices } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Ο Αλέξανδρος",
  description:
    "Γνώρισε τον Αλέξανδρο — εκπαιδευτή σκύλων στην Αθήνα με εξειδίκευση στη θετική ενίσχυση και την αστική συμβίωση.",
};

const PRINCIPLES = [
  "Αποκλειστικά θετική ενίσχυση — μηδενική ανοχή σε σωματική ή ψυχολογική πίεση",
  "Επιστημονική τεκμηρίωση: συμπεριφορική ανάλυση και σύγχρονη κτηνιατρική ηθολογία",
  "Σεβασμός στον ρυθμό μάθησης κάθε σκύλου και κηδεμόνα",
  "Εκπαίδευση στο πραγματικό περιβάλλον: σπίτι, είσοδος, αστική βόλτα στην Αθήνα",
  "Διαφάνεια και επεξήγηση του μηχανισμού πίσω από κάθε τεχνική",
  "Αναγνώριση του οσφρητικού κόσμου: η όσφρηση είναι βασική βιολογική ανάγκη, όχι παραξενιά",
];

export default function AboutPage() {
  const services = getAllServices();

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)] pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-forest)] mb-3">
            Εκπαιδευτής Σκύλων · Αθήνα
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-[var(--color-brown)] leading-[1.1] mb-6">
            Γεια, είμαι ο Αλέξανδρος.
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-muted)] leading-relaxed max-w-2xl font-light mb-8">
            Βοηθώ κηδεμόνες και σκύλους να επικοινωνούν καθαρά και να συνυπάρχουν ήρεμα στην πόλη.
            Πιστεύω ακράδαντα ότι κάθε συμπεριφορά έχει αιτία — και η κατανόηση είναι πάντοτε πιο
            αποτελεσματική από την επιβολή.
          </p>
          <a
            href="#epikoinonia"
            className="inline-flex items-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-3.5 hover:bg-[var(--color-brownMid)] transition-colors"
          >
            Επικοινωνία <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── Philosophy & Principles ──────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-16 md:py-20 border-b border-[var(--color-sandDark)]">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-semibold mb-2">
              Μεθοδολογία
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] mb-6">
              Γιατί «Let It Sniff»;
            </h2>
            <div className="text-[var(--color-brownMid)] space-y-4 text-base leading-relaxed font-light">
              <p>
                Η όσφρηση για τον σκύλο δεν είναι ένα απλό αισθητηριακό εργαλείο — είναι ο πρωταρχικός τρόπος
                που επεξεργάζεται τον κόσμο, αποκτά πληροφορίες και ρυθμίζει το νευρικό του σύστημα.
              </p>
              <p>
                Στο απαιτητικό περιβάλλον της Αθήνας (στενά πεζοδρόμια, θόρυβος, μηχανάκια, αδέσποτες γάτες),
                οι σκύλοι συχνά φορτίζονται με χρόνιο στρες. Όταν επιτρέπουμε στον σκύλο να μυρίσει ελεύθερα,
                του δίνουμε αυτονομία, ηρεμία και πνευματική εκτόνωση.
              </p>
              <p>
                Η θετική εκπαίδευση δεν σημαίνει έλλειψη ορίων. Σημαίνει θέσπιση καθαρών κανόνων μέσω επιβράβευσης,
                διαχείριση του περιβάλλοντος και χτίσιμο συμπεριφορών που αντέχουν στον χρόνο χωρίς φόβο.
              </p>
            </div>
          </div>

          <div className="md:col-span-5 bg-white border border-[var(--color-sandDark)] p-6 sm:p-7">
            <p className="text-xs uppercase tracking-widest text-[var(--color-brown)] font-bold mb-4">
              Βασικές Αρχές
            </p>
            <ul className="space-y-4">
              {PRINCIPLES.map((p, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-[var(--color-forestLight)]/20 text-[var(--color-forest)] flex items-center justify-center">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="text-xs text-[var(--color-brownMid)] leading-relaxed">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Services Overview ────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-16 md:py-20 border-b border-[var(--color-sandDark)]">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
            Συνεργασία
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
            Προγράμματα Εκπαίδευσης
          </h2>
        </div>
        <div className="space-y-4">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* ── Honest Contact Section ────────────────────────── */}
      <section id="epikoinonia" className="max-w-3xl mx-auto px-5 py-16 md:py-24 scroll-mt-10">
        <div className="border border-[var(--color-sandDark)] bg-white p-8 sm:p-12">
          <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-semibold mb-2 text-center sm:text-left">
            Ανοιχτή Γραμμή Επικοινωνίας
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl text-[var(--color-brown)] mb-4 text-center sm:text-left">
            Ας μιλήσουμε για τον σκύλο σας.
          </h2>
          <p className="text-base text-[var(--color-muted)] leading-relaxed mb-8 font-light text-center sm:text-left">
            Στείλτε μου ένα email περιγράφοντας την ηλικία, τη φυλή (ή αν είναι ημίαιμο) και τις βασικές
            προκλήσεις που αντιμετωπίζετε στην καθημερινότητα. Απαντώ προσωπικά σε κάθε μήνυμα εντός 24-48 ωρών.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-sand)]">
            <div className="flex items-start gap-3">
              <Mail className="text-[var(--color-amber)] flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-mutedLight)] font-bold mb-1">
                  Ηλεκτρονικό Ταχυδρομείο
                </p>
                <a
                  href="mailto:info@letitsniff.gr?subject=Ενδιαφέρον%20για%20Εκπαίδευση%20Σκύλου"
                  className="font-heading text-lg text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors underline decoration-[var(--color-amber)] decoration-1 underline-offset-4"
                >
                  info@letitsniff.gr
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="text-[var(--color-amber)] flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-mutedLight)] font-bold mb-1">
                  Περιοχή Εξυπηρέτησης
                </p>
                <p className="text-sm text-[var(--color-brown)]">
                  Αθήνα & ευρύτερη Αττική (κατ’ οίκον & υπαίθριες συνεδρίες)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-sand)] text-center sm:text-left">
            <a
              href="mailto:info@letitsniff.gr?subject=Ενδιαφέρον%20για%20Εκπαίδευση%20Σκύλου"
              className="inline-flex items-center gap-2 bg-[var(--color-amber)] text-white text-sm font-semibold px-6 py-3.5 hover:bg-[var(--color-amberDark)] transition-colors"
            >
              Αποστολή Email στον Αλέξανδρο <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
