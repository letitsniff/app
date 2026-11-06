"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/blog", label: "Άρθρα" },
  { href: "/ypiresies", label: "Υπηρεσίες" },
  { href: "/o-alexandros", label: "Ο Αλέξανδρος" },
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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-[border-color] duration-200 bg-[var(--color-cream)]/95 backdrop-blur-sm border-b ${
        scrolled
          ? "border-[var(--color-sandDark)]"
          : "border-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo + nav links — left-aligned together */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-lg text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
          >
            <PawMark />
            <span>Let It Sniff</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-brown)] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA — right-aligned */}
        <Link
          href="/o-alexandros#epikoinonia"
          className="hidden md:inline-flex bg-[var(--color-brown)] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[var(--color-brownMid)] transition-colors"
        >
          Επικοινωνία
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[var(--color-brown)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 top-14 bg-[var(--color-cream)] z-40 flex flex-col items-center justify-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-heading text-2xl text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/o-alexandros#epikoinonia"
            className="bg-[var(--color-brown)] text-white font-medium px-6 py-3 rounded-full hover:bg-[var(--color-brownMid)] transition-colors mt-4"
            onClick={() => setOpen(false)}
          >
            Επικοινωνία
          </Link>
        </div>
      )}
    </header>
  );
}
