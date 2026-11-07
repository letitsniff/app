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
    <div className="max-w-5xl mx-auto px-5 py-12 sm:py-16 md:py-24">
      {/* Header */}
      <header className="mb-14 sm:mb-18 pb-10 border-b border-[var(--color-sandDark)]/60">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-terraText)] mb-3">
          {content.header.kicker}
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--color-brown)] mb-5 break-words">
          {content.header.title}
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl leading-relaxed whitespace-pre-line font-light">
          {content.header.description}
        </p>
      </header>

      {/* Services list */}
      <div className="space-y-8 md:space-y-12 mb-20 md:mb-28">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>

      {/* Direct Contact Callout */}
      <section className="bg-white border border-[var(--color-sandDark)]/60 p-8 sm:p-12 md:p-16 text-center max-w-2xl mx-auto rounded-sm shadow-xs">
        <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] mb-4 break-words">
          {content.callout.title}
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed mb-8 font-light whitespace-pre-line">
          {content.callout.description}
        </p>
        <Link
          href={content.callout.buttonLink}
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-brown)] text-white text-sm font-medium px-7 py-4 hover:bg-[var(--color-brownMid)] transition-colors w-full sm:w-auto shadow-xs"
        >
          {content.callout.buttonText} <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
