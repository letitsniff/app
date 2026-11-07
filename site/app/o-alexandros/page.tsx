import type { Metadata } from "next";
import { ArrowRight, Check, Mail, MapPin } from "lucide-react";
import { getAllServices } from "@/lib/services";
import { getAboutPageContent } from "@/lib/siteContent";
import ServiceCard from "@/components/ServiceCard";

export function generateMetadata(): Metadata {
  const content = getAboutPageContent();
  return {
    title: content.meta.title,
    description: content.meta.description,
  };
}

export default function AboutPage() {
  const services = getAllServices();
  const content = getAboutPageContent();

  const mailtoHref = `mailto:${content.contact.email}?subject=${encodeURIComponent(
    content.contact.emailSubject
  )}`;

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="border-b border-[var(--color-sandDark)] bg-[var(--color-cream)] pt-12 pb-12 sm:pt-16 sm:pb-14 md:pt-24 md:pb-20">
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-forest)] mb-3">
            {content.hero.kicker}
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl text-[var(--color-brown)] leading-[1.15] sm:leading-[1.1] mb-6 break-words">
            {content.hero.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] leading-relaxed max-w-2xl font-light mb-8 whitespace-pre-line">
            {content.hero.bio}
          </p>
          <a
            href={content.hero.buttonLink}
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-3.5 hover:bg-[var(--color-brownMid)] transition-colors w-full sm:w-auto"
          >
            {content.hero.buttonText} <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── Philosophy & Principles ──────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-12 sm:py-16 md:py-20 border-b border-[var(--color-sandDark)]">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-semibold mb-2">
              {content.methodology.kicker}
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] mb-6">
              {content.methodology.title}
            </h2>
            <div className="text-[var(--color-brownMid)] space-y-4 text-base leading-relaxed font-light">
              {content.methodology.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-white border border-[var(--color-sandDark)] p-5 sm:p-7">
            <p className="text-xs uppercase tracking-widest text-[var(--color-brown)] font-bold mb-4">
              {content.methodology.principlesTitle}
            </p>
            <ul className="space-y-4">
              {content.principles.map((p, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-[var(--color-forestLight)]/20 text-[var(--color-forest)] flex items-center justify-center">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="text-xs text-[var(--color-brownMid)] leading-relaxed">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Services Overview ────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 py-12 sm:py-16 md:py-20 border-b border-[var(--color-sandDark)]">
        <div className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-1">
            {content.services.kicker}
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)]">
            {content.services.title}
          </h2>
        </div>
        <div className="space-y-4">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* ── Honest Contact Section ────────────────────────── */}
      <section id="epikoinonia" className="max-w-3xl mx-auto px-5 py-12 sm:py-16 md:py-24 scroll-mt-10">
        <div className="border border-[var(--color-sandDark)] bg-white p-5 sm:p-10 md:p-12">
          <p className="text-xs uppercase tracking-widest text-[var(--color-amber)] font-semibold mb-2 text-center sm:text-left">
            {content.contact.kicker}
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-[var(--color-brown)] mb-4 text-center sm:text-left break-words">
            {content.contact.title}
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed mb-8 font-light text-center sm:text-left">
            {content.contact.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-[var(--color-sand)]">
            <div className="flex items-start gap-3 min-w-0">
              <Mail className="text-[var(--color-amber)] flex-shrink-0 mt-1" size={20} />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-[var(--color-mutedLight)] font-bold mb-1">
                  {content.contact.emailLabel}
                </p>
                <a
                  href={mailtoHref}
                  className="font-heading text-base sm:text-lg text-[var(--color-brown)] hover:text-[var(--color-amber)] transition-colors underline decoration-[var(--color-amber)] decoration-1 underline-offset-4 break-all block"
                >
                  {content.contact.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 min-w-0">
              <MapPin className="text-[var(--color-amber)] flex-shrink-0 mt-1" size={20} />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-[var(--color-mutedLight)] font-bold mb-1">
                  {content.contact.areaLabel}
                </p>
                <p className="text-sm text-[var(--color-brown)]">
                  {content.contact.area}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-sand)] text-center sm:text-left">
            <a
              href={mailtoHref}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-amber)] text-white text-sm font-semibold px-6 py-3.5 hover:bg-[var(--color-amberDark)] transition-colors w-full sm:w-auto"
            >
              {content.contact.emailButton} <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
