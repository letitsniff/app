import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getGlobalSettings } from "@/lib/siteContent";

export function generateMetadata(): Metadata {
  const global = getGlobalSettings();
  return {
    title: {
      default: `${global.siteName} — ${global.tagline}`,
      template: `%s | ${global.siteName}`,
    },
    description: global.defaultDescription,
    metadataBase: new URL("https://letitsniff.gr"),
    openGraph: {
      siteName: global.siteName,
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const global = getGlobalSettings();

  return (
    <html lang="el">
      <body>
        <Navbar
          navLinks={global.navLinks}
          brand={global.siteName}
          contactLabel={global.ui.mobileContact}
          mobileMenuTitle={global.ui.mobileMenuTitle}
          mobileContactLabel={global.consultationBox.buttonText}
          mobileArea={global.ui.mobileArea}
          email={global.email}
        />
        <main>{children}</main>
        <Footer settings={global} />
      </body>
    </html>
  );
}
