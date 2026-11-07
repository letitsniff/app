import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllServices } from "@/lib/services";
import { getServicesPageContent } from "@/lib/siteContent";
import ServiceCard from "@/components/ServiceCard";

export function generateMetadata(): Metadata {
  const content = getServicesPageContent();
  return {
    title: content.meta.title,
    description: content.meta.description,
  };
}

export default function ServicesPage() {
  const services = getAllServices();
  const content = getServicesPageContent();

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 sm:py-12 md:py-16">
      {/* Header */}
      <header className="mb-10 sm:mb-14 pb-8 border-b border-[var(--color-sandDark)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terra)] mb-2">
          {content.header.kicker}
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--color-brown)] mb-4 break-words">
          {content.header.title}
        </h1>
        <p className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed whitespace-pre-line">
          {content.header.description}
        </p>
      </header>

      {/* Services list */}
      <div className="space-y-4 mb-16">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>

      {/* Direct Contact Callout */}
      <section className="bg-[var(--color-sand)]/60 border border-[var(--color-sandDark)] p-6 sm:p-10 md:p-12 text-center max-w-2xl mx-auto">
        <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] mb-3 break-words">
          {content.callout.title}
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed mb-6 font-light whitespace-pre-line">
          {content.callout.description}
        </p>
        <Link
          href={content.callout.buttonLink}
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-6 py-3.5 hover:bg-[var(--color-brownMid)] transition-colors w-full sm:w-auto"
        >
          {content.callout.buttonText} <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
