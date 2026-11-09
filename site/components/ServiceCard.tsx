import Link from "next/link";
import type { Service } from "@/lib/services";
import { ArrowRight } from "lucide-react";
import { getImageVariants } from "@/lib/images";
import { getUIStrings } from "@/lib/siteContent";

interface Props {
  service: Service;
  variant?: "card" | "hero";
  index?: number;
}

export default function ServiceCard({ service, variant = "card", index }: Props) {
  const imageVariants = getImageVariants(service.image);
  const ui = getUIStrings();
  const formattedIndex =
    typeof index === "number" ? String(index + 1).padStart(2, "0") : null;

  if (variant === "hero") {
    return (
      <Link
        href={`/ypiresies/${service.slug}/`}
        className="group bg-white border border-[var(--color-sandDark)]/60 flex flex-col justify-between transition-all duration-300 hover:border-[var(--color-amber)] hover:shadow-md rounded-sm overflow-hidden"
      >
        <div>
          {imageVariants ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-sand)] border-b border-[var(--color-sandDark)]/50">
              {formattedIndex && (
                <span className="absolute top-3.5 left-3.5 z-10 bg-[var(--color-cream)]/95 backdrop-blur-xs border border-[var(--color-sandDark)]/70 px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider text-[var(--color-amberText)] rounded-xs shadow-2xs">
                  {formattedIndex}
                </span>
              )}
              <picture>
                <source srcSet={imageVariants.card} type="image/webp" />
                <img
                  src={imageVariants.src}
                  alt={service.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </picture>
            </div>
          ) : (
            <div className="p-7 pb-0 text-3xl mb-4 flex items-center justify-between">
              <span>{service.icon}</span>
              {formattedIndex && (
                <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-amberText)]">
                  {formattedIndex}
                </span>
              )}
            </div>
          )}
          <div className="p-6 sm:p-7 min-w-0">
            <h3 className="font-heading text-xl sm:text-2xl text-[var(--color-brown)] group-hover:text-[var(--color-amberText)] transition-colors mb-2.5 leading-snug break-words">
              {service.title}
            </h3>
            <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
              {service.tagline}
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0">
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-[var(--color-sand)]/80 w-full">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amberText)] group-hover:text-[var(--color-brown)] transition-colors">
              <span>{ui.details}</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
            {service.pillars && service.pillars.length > 0 && (
              <span className="text-[11px] font-mono text-[var(--color-mutedLight)]">
                {service.pillars.length} {service.pillars.length === 1 ? "πυλώνας" : "πυλώνες"} οδηγών
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/ypiresies/${service.slug}/`}
      className="group block bg-white border border-[var(--color-sandDark)]/60 overflow-hidden transition-all duration-300 hover:border-[var(--color-amber)] hover:shadow-md rounded-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {imageVariants ? (
          <div className="sm:w-64 md:w-80 flex-shrink-0 aspect-[16/10] sm:aspect-auto relative overflow-hidden bg-[var(--color-sand)] border-b sm:border-b-0 sm:border-r border-[var(--color-sandDark)]/50">
            <picture>
              <source srcSet={imageVariants.card} type="image/webp" />
              <img
                src={imageVariants.src}
                alt={service.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </picture>
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center text-3xl sm:w-28 bg-[var(--color-sand)]/20">
            {service.icon}
          </div>
        )}
        <div className="p-6 sm:p-8 md:p-9 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug break-words">
                {service.title}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed max-w-2xl mb-6">
              {service.tagline}
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-sand)]/70 text-xs font-semibold uppercase tracking-wider text-[var(--color-amberText)] group-hover:text-[var(--color-brown)]">
            <span className="flex items-center gap-2">
              <span>{ui.learnMore}</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
