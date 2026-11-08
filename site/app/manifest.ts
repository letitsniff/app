import type { MetadataRoute } from "next";
import { getGlobalSettings } from "@/lib/siteContent";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const global = getGlobalSettings();
  return {
    name: `${global.siteName} — ${global.tagline}`,
    short_name: global.siteName,
    description: global.defaultDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FDFAF5",
    theme_color: "#FDFAF5",
    lang: "el",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
