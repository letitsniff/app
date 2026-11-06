import Link from "next/link";
import { getGlobalSettings, type GlobalSettings } from "@/lib/siteContent";

interface FooterProps {
  settings?: GlobalSettings;
}

export default function Footer({ settings }: FooterProps) {
  const global = settings || getGlobalSettings();
  const year = new Date().getFullYear();
  const copyright = global.copyright.replace("{year}", String(year));

  return (
    <footer className="border-t border-[var(--color-sandDark)] mt-20">
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="font-heading text-lg text-[var(--color-brown)] mb-1">
              {global.siteName}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              {global.tagline}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-muted)]">
            {global.navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-[var(--color-brown)] transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={`mailto:${global.email}`}
              className="hover:text-[var(--color-brown)] transition-colors"
            >
              {global.email}
            </a>
          </nav>
        </div>
        <p className="text-xs text-[var(--color-mutedLight)] mt-8">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
