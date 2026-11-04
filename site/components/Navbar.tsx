"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/blog", label: "Άρθρα" },
  { href: "/ypiresies", label: "Υπηρεσίες" },
  { href: "/o-alexandros", label: "Ο Αλέξανδρος" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-cream)]/95 backdrop-blur-sm border-b border-[var(--color-sandDark)]">
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-semibold text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
        >
          <span className="text-2xl">🐾</span>
          <span>Let It Sniff</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-amber)] transition-colors tracking-wide uppercase"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/o-alexandros#epikoinonia"
            className="bg-[var(--color-amber)] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[var(--color-amberDark)] transition-colors"
          >
            Επικοινωνία
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[var(--color-brown)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[var(--color-cream)] border-t border-[var(--color-sandDark)] px-5 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-base text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/o-alexandros#epikoinonia"
            className="inline-block bg-[var(--color-amber)] text-white text-sm font-medium px-5 py-2 rounded-full text-center hover:bg-[var(--color-amberDark)] transition-colors"
            onClick={() => setOpen(false)}
          >
            Επικοινωνία
          </Link>
        </div>
      )}
    </header>
  );
}
