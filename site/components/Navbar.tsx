"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ChevronRight, Mail, BookOpen, PawPrint, UserRound } from "lucide-react";
import PawLogo from "./PawLogo";

export interface NavLinkItem {
  href: string;
  label: string;
  desc: string;
  mobileDesc?: string;
}

export interface NavbarProps {
  navLinks?: NavLinkItem[];
  brand?: string;
  contactLabel?: string;
  mobileMenuTitle?: string;
}

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
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

export default function Navbar({
  navLinks = DEFAULT_NAV_LINKS,
  brand = "Let It Sniff",
  contactLabel = "Επικοινωνία",
  mobileMenuTitle = "Μενού Πλοήγησης",
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isLinkActive = (href: string) => {
    const route = href.replace(/\/$/, "") || "/";
    const current = pathname.replace(/\/$/, "") || "/";
    return current === route || (route !== "/" && current.startsWith(`${route}/`));
  };

  // Close menu on route change during render
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // The portal keeps fixed elements relative to the viewport, outside the
  // header's backdrop filter. Keep keyboard focus in the open dialog.
  useEffect(() => {
    if (!open) return;

    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = Array.from(document.querySelectorAll<HTMLElement>("main, footer"));
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []
      );
      const first = items[0];
      const last = items[items.length - 1];
      const outside = !panelRef.current?.contains(document.activeElement);
      if (outside || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [open]);

  // Switching to desktop also releases the scroll lock and focus trap.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  // Subtle border on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 bg-[var(--color-cream)]/95 backdrop-blur-md border-b ${
        scrolled || open
          ? "border-[var(--color-sandDark)] shadow-2xs"
          : "border-[var(--color-sandDark)]/35"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-5 h-14 md:h-16 flex items-center justify-between">
        {/* Logo + desktop nav links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-heading text-lg text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
            onClick={() => setOpen(false)}
          >
            <PawLogo size={32} />
            <span>{brand}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => {
              const isActive = isLinkActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
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
          ref={toggleRef}
          type="button"
          className="mobile-nav-toggle md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-haspopup="dialog"
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {open && createPortal(
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="mobile-nav-panel"
            className="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
          >
            <div className="mobile-nav-panel-heading">
              <p id="mobile-nav-title">{mobileMenuTitle}</p>
              <button
                type="button"
                className="mobile-nav-close"
                onClick={() => setOpen(false)}
                aria-label="Κλείσιμο μενού πλοήγησης"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label={mobileMenuTitle} className="mobile-nav-links">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);
                const Icon = link.href.startsWith("/blog") ? BookOpen
                  : link.href.startsWith("/ypiresies") ? PawPrint
                  : link.href.startsWith("/o-alexandros") ? UserRound : ArrowRight;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="mobile-nav-link"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mobile-nav-icon"><Icon size={18} aria-hidden="true" /></span>
                    <span className="mobile-nav-text">
                      <span className="mobile-nav-label">{link.label}</span>
                      {(link.mobileDesc || link.desc) && (
                        <span className="mobile-nav-description">{link.mobileDesc || link.desc}</span>
                      )}
                    </span>
                    <ChevronRight size={14} className="mobile-nav-chevron" aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>
            <div className="mobile-nav-contact-wrap">
              <Link
                href="/o-alexandros#epikoinonia"
                className="mobile-nav-contact"
                onClick={() => setOpen(false)}
              >
                <Mail size={17} aria-hidden="true" />
                <span>{contactLabel}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
