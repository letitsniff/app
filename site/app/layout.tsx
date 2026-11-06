import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Let It Sniff — Θετική Εκπαίδευση Σκύλων στην Αθήνα",
    template: "%s | Let It Sniff",
  },
  description:
    "Θετική εκπαίδευση σκύλων στην Αθήνα από τον Αλέξανδρο. Βόλτα, αντιδραστικότητα, κουτάβια, υιοθεσία — επιστημονική & ανθρώπινη προσέγγιση.",
  metadataBase: new URL("https://letitsniff.gr"),
  openGraph: {
    siteName: "Let It Sniff",
    locale: "el_GR",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
