import path from "path";
import fs from "fs";

function getRootDir(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "docs", "site"))) {
    return cwd;
  }
  if (fs.existsSync(path.join(cwd, "..", "docs", "site"))) {
    return path.join(cwd, "..");
  }
  return cwd;
}

const ROOT_DIR = getRootDir();
const SITE_DOCS_DIR = path.join(ROOT_DIR, "docs", "site");

function readFileSafe(filename: string): string {
  const filePath = path.join(SITE_DOCS_DIR, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return "";
}

function extractField(raw: string, fieldNames: string[], defaultValue = ""): string {
  for (const name of fieldNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*([^\\n]+)`, "u");
    const m = raw.match(regex);
    if (m) return m[1].trim();
  }
  return defaultValue;
}

function extractSection(raw: string, heading: string): string {
  const lines = raw.split(/\r?\n/);
  let capturing = false;
  const capturedLines: string[] = [];
  const headingNormalized = heading.trim().toLowerCase();

  for (const line of lines) {
    const headingMatch = line.match(/^##+\s+(.+)$/);
    if (headingMatch) {
      const title = headingMatch[1].trim().toLowerCase();
      if (title.startsWith(headingNormalized) || title === headingNormalized) {
        capturing = true;
        continue;
      } else if (capturing) {
        break;
      }
    } else if (capturing) {
      capturedLines.push(line);
    }
  }

  return capturedLines.join("\n").trim();
}

function extractListItems(raw: string): string[] {
  const items: string[] = [];
  const lines = raw.split("\n");
  for (const line of lines) {
    const m = line.match(/^[-*]\s+(.+)$/);
    if (m) {
      items.push(m[1].trim());
    }
  }
  return items;
}

function extractBlockquoteNavLinks(
  raw: string,
  defaultLinks: { href: string; label: string; desc: string }[]
): { href: string; label: string; desc: string }[] {
  const entries = raw.split(/>\s*\*\s+/);
  const links: { href: string; label: string; desc: string }[] = [];

  for (const entry of entries) {
    const titleMatch = entry.match(/\*\*([^*]+)\*\*/);
    const urlMatch = entry.match(/\*URL:\*\s*([^\n\r]+)/);
    const descMatch = entry.match(/\*Περιγραφή:\*\s*([^\n\r]+)/);

    if (titleMatch && urlMatch) {
      links.push({
        label: titleMatch[1].trim(),
        href: urlMatch[1].trim(),
        desc: descMatch ? descMatch[1].trim() : "",
      });
    }
  }

  return links.length > 0 ? links : defaultLinks;
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface HomePageContent {
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    button1: string;
    link1: string;
    button2: string;
    link2: string;
    image: string;
    alt: string;
    highlights: string[];
  };
  services: {
    kicker: string;
    title: string;
    linkText: string;
    linkUrl: string;
  };
  philosophy: {
    kicker: string;
    quote: string;
    body: string;
    linkText: string;
    linkUrl: string;
  };
  library: {
    kicker: string;
    title: string;
    linkText: string;
    linkUrl: string;
    clusterLinkText: string;
    badgePrefix: string;
    pillarsSuffix: string;
    articlesSuffix: string;
  };
  callout: {
    kicker: string;
    title: string;
    description: string;
    button1: string;
    link1: string;
    button2: string;
    link2: string;
  };
}

export interface AboutPageContent {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    kicker: string;
    title: string;
    buttonText: string;
    buttonLink: string;
    bio: string;
  };
  methodology: {
    kicker: string;
    title: string;
    paragraphs: string[];
    principlesTitle: string;
  };
  principles: string[];
  services: {
    kicker: string;
    title: string;
  };
  contact: {
    kicker: string;
    title: string;
    description: string;
    emailLabel: string;
    email: string;
    emailSubject: string;
    areaLabel: string;
    area: string;
    modeLabel: string;
    mode: string;
    emailButton: string;
  };
}

export interface ServicesPageContent {
  meta: {
    title: string;
    description: string;
  };
  header: {
    kicker: string;
    title: string;
    description: string;
  };
  callout: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
}

export interface BlogPageContent {
  meta: {
    title: string;
    description: string;
  };
  header: {
    kicker: string;
    title: string;
    description: string;
    jumpBarLabel: string;
  };
  bottomCallout: {
    kicker: string;
    title: string;
    description: string;
    button1: string;
    link1: string;
    button2: string;
    link2: string;
  };
}

export interface UIStrings {
  readArticle: string;
  learnMore: string;
  details: string;
  exploreCluster: string;
  allServices: string;
  relatedArticles: string;
  continueReading: string;
  relatedTopics: string;
  relatedService: string;
  moreInCategory: string;
  bookSession: string;
  articlesForService: string;
  connectedServiceLabel: string;
  clusterContents: string;
  clusterContentsSubtitle: string;
  prevPillar: string;
  nextPillar: string;
  backToAllClusters: string;
  authorText: string;
  emptyArticles: string;
  mobileContact: string;
  mobileArea: string;
  mobileMenuTitle: string;
  pillarBreadcrumb: string;
  pillarBadge: string;
  guideCountSuffix: string;
  guideSingleSuffix: string;
  articleCountSuffix: string;
  articleSingleSuffix: string;
}

export interface GlobalSettings {
  siteName: string;
  tagline: string;
  defaultDescription: string;
  email: string;
  copyright: string;
  navLinks: { href: string; label: string; desc: string }[];
  consultationBox: {
    kicker: string;
    title: string;
    text: string;
    buttonText: string;
    buttonLink: string;
  };
  assessmentBox: {
    title: string;
    text: string;
    buttonText: string;
    buttonLink: string;
  };
  ui: UIStrings;
}

// ─── Default Fallback Values ─────────────────────────────────────────────────

const DEFAULT_NAV_LINKS = [
  {
    href: "/blog",
    label: "Άρθρα & Οδηγοί",
    desc: "Βιβλιοθήκη πρακτικών οδηγών σύγχρονης εκπαίδευσης",
  },
  {
    href: "/ypiresies",
    label: "Υπηρεσίες",
    desc: "Προγράμματα κατ' οίκον & στην πόλη",
  },
  {
    href: "/o-alexandros",
    label: "Ο Αλέξανδρος",
    desc: "Φιλοσοφία, αρχές & επικοινωνία",
  },
];

const DEFAULT_PRINCIPLES = [
  "Εκπαίδευση χωρίς καταναγκασμό — μηδενική ανοχή σε σωματική ή ψυχολογική πίεση",
  "Επιστημονική τεκμηρίωση: συμπεριφορική ανάλυση και σύγχρονη κτηνιατρική ηθολογία",
  "Σεβασμός στον ρυθμό μάθησης κάθε σκύλου και κηδεμόνα",
  "Εκπαίδευση στο πραγματικό περιβάλλον: σπίτι, είσοδος, αστική βόλτα στην Αθήνα",
  "Διαφάνεια και επεξήγηση του μηχανισμού πίσω από κάθε τεχνική",
  "Αναγνώριση του οσφρητικού κόσμου: η όσφρηση είναι βασική βιολογική ανάγκη, όχι παραξενιά",
];

// ─── Loaders ─────────────────────────────────────────────────────────────────

export function getHomePageContent(): HomePageContent {
  const raw = readFileSafe("home.md");
  const heroSection = extractSection(raw, "Hero");
  const servicesSection = extractSection(raw, "Υπηρεσίες");
  const philosophySection = extractSection(raw, "Φιλοσοφία");
  const librarySection = extractSection(raw, "Βιβλιοθήκη");
  const calloutSection = extractSection(raw, "Επικοινωνία");

  const philosophyBody = philosophySection
    .replace(/\*\*[^:]+:\*\*[^\n]+\n?/g, "")
    .trim();

  const h1 = extractField(heroSection, ["Σημείο 1"], "100% χωρίς καταναγκασμό & τιμωρία");
  const h2 = extractField(heroSection, ["Σημείο 2"], "Κατ' οίκον & σε πραγματικές συνθήκες στην Αθήνα");
  const h3 = extractField(heroSection, ["Σημείο 3"], "Επιστημονική προσέγγιση & σεβασμός στη γλώσσα σώματος");

  return {
    hero: {
      kicker: extractField(heroSection, ["Kicker", "kicker"], ""),
      title: extractField(
        heroSection,
        ["Τίτλος", "Title", "title"],
        "Άφησε τον σκύλο σου *να μυρίσει* τη ζωή στην πόλη."
      ),
      subtitle: extractField(
        heroSection,
        ["Υπότιτλος", "Subtitle", "Περιγραφή", "description"],
        "Επιστημονική εκπαίδευση σκύλων προσαρμοσμένη στις πραγματικές συνθήκες της Αθήνας. Ήρεμες βόλτες, συμβίωση χωρίς πίεση και ουσιαστικός δεσμός εμπιστοσύνης."
      ),
      button1: extractField(heroSection, ["Κουμπί 1", "Κουμπί Υπηρεσιών"], "Υπηρεσίες Εκπαίδευσης"),
      link1: extractField(heroSection, ["Σύνδεσμος 1", "Σύνδεσμος Υπηρεσιών"], "/ypiresies"),
      button2: extractField(heroSection, ["Κουμπί 2", "Κουμπί Βιβλιοθήκης"], "Βιβλιοθήκη Άρθρων"),
      link2: extractField(heroSection, ["Σύνδεσμος 2", "Σύνδεσμος Βιβλιοθήκης"], "/blog"),
      image: extractField(heroSection, ["Εικόνα", "Image"], "/images/hero-home.png"),
      alt: extractField(
        heroSection,
        ["Alt Εικόνας", "Alt"],
        "Χαρούμενος σκύλος και κηδεμόνας σε χαλαρή βόλτα στην Αθήνα"
      ),
      highlights: [h1, h2, h3].filter(Boolean),
    },
    services: {
      kicker: extractField(servicesSection, ["Kicker"], "Συνεργασία & Καθοδήγηση"),
      title: extractField(servicesSection, ["Τίτλος", "Title"], "Πώς Δουλεύουμε Μαζί"),
      linkText: extractField(servicesSection, ["Σύνδεσμος", "LinkText"], "Όλες οι Υπηρεσίες"),
      linkUrl: extractField(servicesSection, ["Σύνδεσμος URL", "LinkUrl"], "/ypiresies"),
    },
    philosophy: {
      kicker: extractField(philosophySection, ["Kicker"], "Η Προσέγγιση"),
      quote: extractField(
        philosophySection,
        ["Απόσπασμα", "Quote"],
        "«Η βόλτα δεν είναι άσκηση υπακοής. Είναι το παράθυρο του σκύλου στον κόσμο.»"
      ),
      body:
        philosophyBody ||
        "Χωρίς βία, χωρίς πνίχτες και εκφοβισμούς. Η θετική ενίσχυση στηρίζεται στη συμπεριφορική επιστήμη και στον σεβασμό των αναγκών του ζώου μέσα στο απαιτητικό αστικό περιβάλλον.",
      linkText: extractField(
        philosophySection,
        ["Σύνδεσμος", "LinkText"],
        "Γνωρίστε τον Αλέξανδρο και τη μεθοδολογία"
      ),
      linkUrl: extractField(philosophySection, ["Σύνδεσμος URL", "LinkUrl"], "/o-alexandros"),
    },
    library: {
      kicker: extractField(librarySection, ["Kicker"], "Βιβλιοθήκη Γνώσης"),
      title: extractField(librarySection, ["Τίτλος", "Title"], "Εξερευνήστε ανά Θεματική Ενότητα"),
      linkText: extractField(librarySection, ["Σύνδεσμος", "LinkText"], "Όλοι οι Οδηγοί & Πυλώνες"),
      linkUrl: extractField(librarySection, ["Σύνδεσμος URL", "LinkUrl"], "/blog"),
      clusterLinkText: extractField(
        librarySection,
        ["Σύνδεσμος Ενότητας", "ClusterLinkText"],
        "Όλοι οι οδηγοί αυτής της ενότητας"
      ),
      badgePrefix: extractField(librarySection, ["Badge Πρόθεμα"], "ΘΕΜΑΤΙΚΗ ΕΝΟΤΗΤΑ"),
      pillarsSuffix: extractField(librarySection, ["Ετικέτα Πυλώνων"], "πυλώνες"),
      articlesSuffix: extractField(librarySection, ["Ετικέτα Άρθρων"], "άρθρα →"),
    },
    callout: {
      kicker: extractField(calloutSection, ["Kicker"], "Εξατομικευμένη Καθοδήγηση"),
      title: extractField(
        calloutSection,
        ["Τίτλος", "Title"],
        "Δεν είστε σίγουροι από πού να ξεκινήσετε;"
      ),
      description: extractField(
        calloutSection,
        ["Περιγραφή", "Description"],
        "Κάθε σκύλος και κάθε σπίτι στην Αθήνα έχουν τις δικές τους ανάγκες. Στείλτε μου ένα μήνυμα με λίγα λόγια για τον σκύλο σας και τις προκλήσεις που αντιμετωπίζετε, για να δούμε μαζί πώς μπορούμε να δουλέψουμε."
      ),
      button1: extractField(calloutSection, ["Κουμπί 1"], "Επικοινωνία με τον Αλέξανδρο"),
      link1: extractField(calloutSection, ["Σύνδεσμος 1"], "/o-alexandros#epikoinonia"),
      button2: extractField(calloutSection, ["Κουμπί 2"], "Δείτε τις Υπηρεσίες"),
      link2: extractField(calloutSection, ["Σύνδεσμος 2"], "/ypiresies"),
    },
  };
}

export function getAboutPageContent(): AboutPageContent {
  const raw = readFileSafe("about.md");
  const heroSection = extractSection(raw, "Hero");
  const methodologySection = extractSection(raw, "Μεθοδολογία");
  const principlesSection = extractSection(raw, "Βασικές Αρχές");
  const servicesSection = extractSection(raw, "Προγράμματα Εκπαίδευσης");
  const contactSection = extractSection(raw, "Επικοινωνία");

  const bio = heroSection.replace(/\*\*[^:]+:\*\*[^\n]+\n?/g, "").trim();

  // Extract methodology paragraphs
  const methodWithoutHeading = methodologySection.replace(/^###\s+.*$/m, "---SPLIT---");
  const [methodText, inlinePrinciplesBlock] = methodWithoutHeading.split("---SPLIT---");

  const methodParagraphs = methodText
    ? methodText
        .split("\n\n")
        .map((p) => p.replace(/\*\*[^:]+:\*\*[^\n]+\n?/g, "").trim())
        .filter(Boolean)
    : [];

  const principlesRaw = principlesSection || inlinePrinciplesBlock || "";
  const principlesList = principlesRaw ? extractListItems(principlesRaw) : [];

  return {
    meta: {
      title: extractField(raw, ["Title"], "Ο Αλέξανδρος"),
      description: extractField(
        raw,
        ["Description"],
        "Γνώρισε τον Αλέξανδρο — εκπαιδευτή σκύλων στην Αθήνα με εξειδίκευση στη θετική ενίσχυση και την αστική συμβίωση."
      ),
    },
    hero: {
      kicker: extractField(heroSection, ["Kicker"], "Εκπαιδευτής Σκύλων · Αθήνα"),
      title: extractField(heroSection, ["Τίτλος", "Title"], "Γεια, είμαι ο Αλέξανδρος."),
      buttonText: extractField(heroSection, ["Κουμπί"], "Επικοινωνία"),
      buttonLink: extractField(heroSection, ["Σύνδεσμος"], "#epikoinonia"),
      bio:
        bio ||
        "Βοηθώ κηδεμόνες και σκύλους να επικοινωνούν καθαρά και να συνυπάρχουν ήρεμα στην πόλη. Πιστεύω ακράδαντα ότι κάθε συμπεριφορά έχει αιτία — και η κατανόηση είναι πάντοτε πιο αποτελεσματική από την επιβολή.",
    },
    methodology: {
      kicker: extractField(methodologySection, ["Kicker"], "Μεθοδολογία"),
      title: extractField(methodologySection, ["Τίτλος", "Title"], "Γιατί «Let It Sniff»;"),
      paragraphs:
        methodParagraphs.length > 0
          ? methodParagraphs
          : [
              "Η όσφρηση για τον σκύλο δεν είναι ένα απλό αισθητηριακό εργαλείο — είναι ο πρωταρχικός τρόπος που επεξεργάζεται τον κόσμο, αποκτά πληροφορίες και ρυθμίζει το νευρικό του σύστημα.",
              "Στο απαιτητικό περιβάλλον της Αθήνας (στενά πεζοδρόμια, θόρυβος, μηχανάκια, αδέσποτες γάτες), οι σκύλοι συχνά φορτίζονται με χρόνιο στρες. Όταν επιτρέπουμε στον σκύλο να μυρίσει ελεύθερα, του δίνουμε αυτονομία, ηρεμία και πνευματική εκτόνωση.",
              "Η σύγχρονη εκπαίδευση με επιβράβευση δεν σημαίνει έλλειψη ορίων. Σημαίνει θέσπιση καθαρών κανόνων, διαχείριση του περιβάλλοντος και χτίσιμο συμπεριφορών που αντέχουν στον χρόνο χωρίς φόβο.",
            ],
      principlesTitle: "Βασικές Αρχές",
    },
    principles: principlesList.length > 0 ? principlesList : DEFAULT_PRINCIPLES,
    services: {
      kicker: extractField(servicesSection, ["Kicker"], "Συνεργασία"),
      title: extractField(servicesSection, ["Τίτλος", "Title"], "Προγράμματα Εκπαίδευσης"),
    },
    contact: {
      kicker: extractField(contactSection, ["Kicker"], "Ανοιχτή Γραμμή Επικοινωνίας"),
      title: extractField(contactSection, ["Τίτλος", "Title"], "Ας μιλήσουμε για τον σκύλο σας."),
      description: extractField(
        contactSection,
        ["Περιγραφή", "Description"],
        "Στείλτε μου ένα email περιγράφοντας την ηλικία, τη φυλή (ή αν είναι ημίαιμο) και τις βασικές προκλήσεις που αντιμετωπίζετε στην καθημερινότητα. Απαντώ προσωπικά σε κάθε μήνυμα εντός 24-48 ωρών."
      ),
      emailLabel: extractField(contactSection, ["Email Label"], "Ηλεκτρονικό Ταχυδρομείο"),
      email: extractField(contactSection, ["Email"], "info@letitsniff.gr"),
      emailSubject: extractField(
        contactSection,
        ["Email Θέμα"],
        "Ενδιαφέρον για Εκπαίδευση Σκύλου"
      ),
      areaLabel: extractField(contactSection, ["Περιοχή Label"], "Περιοχή Εξυπηρέτησης"),
      area: extractField(
        contactSection,
        ["Περιοχή Εξυπηρέτησης"],
        "Αθήνα & ευρύτερη Αττική (κατ’ οίκον & υπαίθριες συνεδρίες)"
      ),
      modeLabel: extractField(contactSection, ["Τρόπος Label"], "Τρόπος Συνεργασίας"),
      mode: extractField(
        contactSection,
        ["Τρόπος Συνεργασίας"],
        "Δια ζώσης & Online καθοδήγηση"
      ),
      emailButton: extractField(
        contactSection,
        ["Κουμπί Email"],
        "Αποστολή Email στον Αλέξανδρο"
      ),
    },
  };
}

export function getServicesPageContent(): ServicesPageContent {
  const raw = readFileSafe("services.md");
  const headerSection = extractSection(raw, "Header");
  const calloutSection = extractSection(raw, "Callout");

  return {
    meta: {
      title: extractField(raw, ["Title"], "Υπηρεσίες Εκπαίδευσης"),
      description: extractField(
        raw,
        ["Description"],
        "Εκπαίδευση & συμβουλευτική σκύλων στην Αθήνα — αστική συμβίωση, προβλήματα συμπεριφοράς, κουτάβια, υιοθεσία."
      ),
    },
    header: {
      kicker: extractField(headerSection, ["Kicker"], "Εξατομικευμένα Προγράμματα"),
      title: extractField(
        headerSection,
        ["Τίτλος", "Title"],
        "Υπηρεσίες Εκπαίδευσης & Συμβουλευτικής"
      ),
      description: extractField(
        headerSection,
        ["Περιγραφή", "Description"],
        "Κάθε σκύλος και κάθε κηδεμόνας έχουν διαφορετικούς ρυθμούς και ανάγκες. Τα προγράμματα υλοποιούνται στο φυσικό περιβάλλον του σκύλου: στο σπίτι, στην πολυκατοικία και στη γειτονιά."
      ),
    },
    callout: {
      title: extractField(
        calloutSection,
        ["Τίτλος", "Title"],
        "Δεν είστε σίγουροι από πού να ξεκινήσετε;"
      ),
      description: extractField(
        calloutSection,
        ["Περιγραφή", "Description"],
        "Περιγράψτε μου συνοπτικά την καθημερινότητα και τις προκλήσεις με τον σκύλο σας. Μαζί θα αξιολογήσουμε ποια προσέγγιση είναι η πιο αποτελεσματική."
      ),
      buttonText: extractField(
        calloutSection,
        ["Κουμπί", "ButtonText"],
        "Επικοινωνία με τον Αλέξανδρο"
      ),
      buttonLink: extractField(
        calloutSection,
        ["Σύνδεσμος", "ButtonLink"],
        "/o-alexandros#epikoinonia"
      ),
    },
  };
}

export function getBlogPageContent(): BlogPageContent {
  const raw = readFileSafe("blog.md");
  const headerSection = extractSection(raw, "Header");
  const bottomSection = extractSection(raw, "Bottom Callout");

  return {
    meta: {
      title: extractField(raw, ["Title"], "Βιβλιοθήκη Άρθρων & Οδηγών Εκπαίδευσης"),
      description: extractField(
        raw,
        ["Description"],
        "Οργανωμένη βιβλιοθήκη σύγχρονης εκπαίδευσης σκύλων στην Αθήνα — θεματικοί οδηγοί και άρθρα για τη βόλτα, το διαμέρισμα, την αντιδραστικότητα, το κουτάβι και την υιοθεσία."
      ),
    },
    header: {
      kicker: extractField(headerSection, ["Kicker"], "Βιβλιοθήκη Γνώσης"),
      title: extractField(headerSection, ["Τίτλος", "Title"], "Άρθρα & Πρακτικοί Οδηγοί"),
      description: extractField(
        headerSection,
        ["Περιγραφή", "Description"],
        "Απαντήσεις, συμπεριφορική ανάλυση και επιστημονική γνώση για την καθημερινότητα με τον σκύλο στην Αθήνα — οργανωμένα σε θεματικές ενότητες."
      ),
      jumpBarLabel: extractField(
        headerSection,
        ["Jump Bar Label"],
        "Περιήγηση ανά Θεματική Ενότητα:"
      ),
    },
    bottomCallout: {
      kicker: extractField(bottomSection, ["Kicker"], "Χρειάζεστε εξατομικευμένη καθοδήγηση;"),
      title: extractField(
        bottomSection,
        ["Τίτλος", "Title"],
        "Συνεδρίες Εκπαίδευσης & Συμβουλευτικής στην Αθήνα"
      ),
      description: extractField(
        bottomSection,
        ["Περιγραφή", "Description"],
        "Κάθε σκύλος είναι μοναδικός. Δείτε τις διαθέσιμες υπηρεσίες ή επικοινωνήστε απευθείας με τον Αλέξανδρο για κατ’ οίκον αξιολόγηση."
      ),
      button1: extractField(bottomSection, ["Κουμπί 1"], "Δείτε τις Υπηρεσίες Εκπαίδευσης"),
      link1: extractField(bottomSection, ["Σύνδεσμος 1"], "/ypiresies"),
      button2: extractField(bottomSection, ["Κουμπί 2"], "Γνωρίστε τον Αλέξανδρο"),
      link2: extractField(bottomSection, ["Σύνδεσμος 2"], "/o-alexandros"),
    },
  };
}

export function getGlobalSettings(): GlobalSettings {
  const raw = readFileSafe("global.md");
  const navSection = extractSection(raw, "Πλοήγηση");
  const consultSection = extractSection(raw, "Πλαίσιο Συμβουλευτικής (Sidebar Consultation)");
  const assessSection = extractSection(raw, "Πλαίσιο Αρχικής Αξιολόγησης (Service Sidebar)");
  const uiSection = extractSection(raw, "Κοινά Κείμενα & Ετικέτες (UI Labels)");

  const navLinks = extractBlockquoteNavLinks(navSection, DEFAULT_NAV_LINKS);

  const ui: UIStrings = {
    readArticle: extractField(uiSection, ["Διαβάστε το άρθρο"], "Διαβάστε το άρθρο →"),
    learnMore: extractField(uiSection, ["Μάθετε περισσότερα"], "Μάθετε περισσότερα"),
    details: extractField(uiSection, ["Αναλυτικά"], "Αναλυτικά"),
    exploreCluster: extractField(uiSection, ["Εξερεύνηση Ενότητας"], "Εξερεύνηση Ενότητας"),
    allServices: extractField(uiSection, ["Όλες οι Υπηρεσίες"], "Όλες οι Υπηρεσίες"),
    relatedArticles: extractField(uiSection, ["Σχετικά Άρθρα"], "Σχετικά Άρθρα"),
    continueReading: extractField(uiSection, ["Συνέχεια Ανάγνωσης"], "Συνέχεια Ανάγνωσης"),
    relatedTopics: extractField(uiSection, ["Σχετική Θεματολογία"], "Σχετική Θεματολογία"),
    relatedService: extractField(uiSection, ["Σχετική Υπηρεσία"], "Σχετική Υπηρεσία"),
    moreInCategory: extractField(uiSection, ["Περισσότερα στην ενότητα"], "Περισσότερα στην ενότητα"),
    bookSession: extractField(uiSection, ["Κλείστε Συνεδρία"], "Κλείστε Συνεδρία"),
    articlesForService: extractField(
      uiSection,
      ["Άρθρα για αυτή την Υπηρεσία"],
      "Άρθρα για αυτή την Υπηρεσία"
    ),
    connectedServiceLabel: extractField(
      uiSection,
      ["Συνδεδεμένη Υπηρεσία"],
      "Σχετική υπηρεσία εκπαίδευσης στην Αθήνα:"
    ),
    clusterContents: extractField(uiSection, ["Περιεχόμενα Ενότητας"], "Οδηγοί της Ενότητας"),
    clusterContentsSubtitle: extractField(
      uiSection,
      ["Υποτιτλος Περιεχομένων"],
      "Πρακτικοί οδηγοί και συμπεριφορική ανάλυση βήμα-βήμα."
    ),
    prevPillar: extractField(uiSection, ["Προηγούμενος Πυλώνας"], "Προηγούμενη ενότητα"),
    nextPillar: extractField(uiSection, ["Επόμενος Πυλώνας"], "Επόμενη ενότητα"),
    backToAllClusters: extractField(
      uiSection,
      ["Επιστροφή σε όλες τις ενότητες"],
      "← Επιστροφή σε όλες τις θεματικές ενότητες"
    ),
    authorText: extractField(uiSection, ["Συγγραφέας"], "Κείμενο: Αλέξανδρος"),
    emptyArticles: extractField(
      uiSection,
      ["Empty Articles"],
      "Τα άρθρα αυτής της ενότητας ανανεώνονται σύντομα."
    ),
    mobileContact: extractField(uiSection, ["Mobile Contact Button"], "Επικοινωνία"),
    mobileArea: extractField(uiSection, ["Mobile Area"], "Αθήνα & Αττική"),
    mobileMenuTitle: extractField(uiSection, ["Mobile Menu Title"], "Μενού Πλοήγησης"),
    pillarBreadcrumb: extractField(uiSection, ["Pillar Breadcrumb"], "Ενότητα"),
    pillarBadge: extractField(uiSection, ["Pillar Badge"], "ΕΝΟΤΗΤΑ"),
    guideCountSuffix: extractField(uiSection, ["Guide Count Suffix"], "οδηγοί"),
    guideSingleSuffix: extractField(uiSection, ["Guide Single Suffix"], "οδηγός"),
    articleCountSuffix: extractField(uiSection, ["Article Count Suffix"], "άρθρα"),
    articleSingleSuffix: extractField(uiSection, ["Article Single Suffix"], "άρθρο"),
  };

  return {
    siteName: extractField(raw, ["Site Name", "Όνομα"], "Let It Sniff"),
    tagline: extractField(raw, ["Tagline", "Υπότιτλος"], "Εκπαίδευση σκύλων χωρίς καταναγκασμό · Αθήνα"),
    defaultDescription: extractField(
      raw,
      ["Default Description"],
      "Εκπαίδευση σκύλων στην Αθήνα από τον Αλέξανδρο. Βόλτα, αντιδραστικότητα, κουτάβια, υιοθεσία — επιστημονική & ανθρώπινη προσέγγιση."
    ),
    email: extractField(raw, ["Email"], "info@letitsniff.gr"),
    copyright: extractField(
      raw,
      ["Copyright"],
      "© {year} Let It Sniff — Αλέξανδρος, Εκπαιδευτής Σκύλων"
    ),
    navLinks,
    consultationBox: {
      kicker: extractField(consultSection, ["Kicker"], "Εξατομικευμένη Καθοδήγηση"),
      title: extractField(consultSection, ["Τίτλος"], "Αντιμετωπίζετε παρόμοια πρόκληση;"),
      text: extractField(
        consultSection,
        ["Κείμενο"],
        "Κάθε σκύλος και κάθε σπίτι στην πόλη είναι μοναδικά. Μπορούμε να δουλέψουμε μαζί με εξατομικευμένο πλάνο σύγχρονης εκπαίδευσης."
      ),
      buttonText: extractField(consultSection, ["Κουμπί"], "Επικοινωνία με τον Αλέξανδρο"),
      buttonLink: extractField(consultSection, ["Σύνδεσμος"], "/o-alexandros#epikoinonia"),
    },
    assessmentBox: {
      title: extractField(assessSection, ["Τίτλος"], "Αρχική Αξιολόγηση"),
      text: extractField(
        assessSection,
        ["Κείμενο"],
        "Συζητάμε τις ανάγκες του σκύλου σας και σχεδιάζουμε το πρόγραμμα που ταιριάζει στο πρόγραμμά σας."
      ),
      buttonText: extractField(assessSection, ["Κουμπί"], "Επικοινωνία"),
      buttonLink: extractField(assessSection, ["Σύνδεσμος"], "/o-alexandros#epikoinonia"),
    },
    ui,
  };
}

export function getUIStrings(): UIStrings {
  return getGlobalSettings().ui;
}
