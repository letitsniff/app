import type { Metadata, Viewport } from "next";
import { DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getGlobalSettings } from "@/lib/siteContent";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FDFAF5",
};

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
    <html lang="el" className={dmSerifDisplay.variable}>
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
