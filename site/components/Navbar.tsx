"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Mail } from "lucide-react";

export interface NavLinkItem {
  href: string;
  label: string;
  desc: string;
}

export interface NavbarProps {
  navLinks?: NavLinkItem[];
  brand?: string;
  contactLabel?: string;
  mobileMenuTitle?: string;
  mobileContactLabel?: string;
  mobileArea?: string;
  email?: string;
}

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  {
    href: "/blog",
    label: "Άρθρα & Οδηγοί",
    desc: "Βιβλιοθήκη πρακτικών οδηγών θετικής εκπαίδευσης",
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

function PawMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <ellipse cx="16" cy="22" rx="6.5" ry="5.5" />
      <circle cx="8" cy="12" r="3.5" />
      <circle cx="24" cy="12" r="3.5" />
      <circle cx="12" cy="7" r="2.8" />
      <circle cx="20" cy="7" r="2.8" />
    </svg>
  );
}

export default function Navbar({
  navLinks = DEFAULT_NAV_LINKS,
  brand = "Let It Sniff",
  contactLabel = "Επικοινωνία",
  mobileMenuTitle = "Μενού Πλοήγησης",
  mobileContactLabel = "Επικοινωνία με τον Αλέξανδρο",
  mobileArea = "Αθήνα & Αττική",
  email = "info@letitsniff.gr",
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close menu on route change during render
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Subtle border on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[border-color] duration-200 bg-[var(--color-cream)] border-b ${
        scrolled || open
          ? "border-[var(--color-sandDark)]"
          : "border-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo + desktop nav links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
            onClick={() => setOpen(false)}
          >
            <PawMark />
            <span>{brand}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => {
              const isActive =
                pathname === l.href ||
                (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "text-[var(--color-brown)] font-semibold border-b-2 border-[var(--color-amber)] pb-0.5"
                      : "text-[var(--color-muted)] hover:text-[var(--color-brown)]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA — desktop right-aligned */}
        <Link
          href="/o-alexandros#epikoinonia"
          className="hidden md:inline-flex bg-[var(--color-brown)] text-white text-xs font-semibold uppercase tracking-wider px-5 py-2 hover:bg-[var(--color-brownMid)] transition-colors"
        >
          {contactLabel}
        </Link>

        {/* Mobile toggle button */}
        <button
          type="button"
          className="md:hidden min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors focus:outline-none"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Dropdown Panel & Backdrop */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 top-14 bg-black/25 z-40 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden relative z-50 bg-[var(--color-cream)] border-t border-[var(--color-sandDark)] px-5 py-6 shadow-xl max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-muted)] mb-2">
                {mobileMenuTitle}
              </p>
              {navLinks.map((l) => {
                const isActive =
                  pathname === l.href ||
                  (l.href !== "/" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block p-4 border transition-colors ${
                      isActive
                        ? "bg-white border-l-4 border-l-[var(--color-amber)] border-y-[var(--color-sandDark)]/60 border-r-[var(--color-sandDark)]/60"
                        : "bg-white/70 border-[var(--color-sandDark)]/60 hover:bg-white"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-heading text-lg ${
                          isActive
                            ? "text-[var(--color-brown)] font-bold"
                            : "text-[var(--color-brown)]"
                        }`}
                      >
                        {l.label}
                      </span>
                      <ArrowRight
                        size={16}
                        className={
                          isActive
                            ? "text-[var(--color-amberText)]"
                            : "text-[var(--color-muted)]"
                        }
                      />
                    </div>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                      {l.desc}
                    </p>
                  </Link>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/o-alexandros#epikoinonia"
                  className="flex items-center justify-center gap-2 w-full bg-[var(--color-brown)] text-white font-medium py-3.5 text-sm hover:bg-[var(--color-brownMid)] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {mobileContactLabel} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--color-sandDark)]/70 text-xs text-[var(--color-muted)] flex flex-wrap items-center justify-between gap-2">
              <span>{mobileArea}</span>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-1.5 text-[var(--color-brown)] font-medium hover:text-[var(--color-amber)] break-all"
              >
                <Mail size={13} className="shrink-0" /> {email}
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
