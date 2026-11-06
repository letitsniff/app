import Link from "next/link";
import type { Service } from "@/lib/services";
import { ArrowRight } from "lucide-react";
import { getImageVariants } from "@/lib/images";

interface Props {
  service: Service;
  variant?: "card" | "hero";
}

export default function ServiceCard({ service, variant = "card" }: Props) {
  const imageVariants = getImageVariants(service.image);

  if (variant === "hero") {
    return (
      <div className="group bg-white border border-[var(--color-sandDark)] flex flex-col justify-between transition-all hover:border-[var(--color-amber)] overflow-hidden shadow-xs hover:shadow-sm">
        <div>
          {imageVariants ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-sand)] border-b border-[var(--color-sandDark)]">
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
            <div className="p-6 pb-0 text-3xl mb-4">{service.icon}</div>
          )}
          <div className="p-5 sm:p-6">
            <h3 className="font-heading text-xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors mb-2 leading-snug">
              {service.title}
            </h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">
              {service.tagline}
            </p>
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
          <Link
            href={`/ypiresies/${service.slug}/`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors pt-3 border-t border-[var(--color-sand)] w-full justify-between"
          >
            <span>Αναλυτικά</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/ypiresies/${service.slug}/`}
      className="group block bg-white border border-[var(--color-sandDark)] overflow-hidden transition-all hover:border-[var(--color-amber)] shadow-xs hover:shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {imageVariants ? (
          <div className="sm:w-60 md:w-72 flex-shrink-0 aspect-[16/9] sm:aspect-auto relative overflow-hidden bg-[var(--color-sand)] border-b sm:border-b-0 sm:border-r border-[var(--color-sandDark)]">
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
          <div className="p-6 flex items-center justify-center text-3xl sm:w-24">
            {service.icon}
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-heading text-xl sm:text-2xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors leading-snug">
                {service.title}
              </h3>
            </div>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-2xl mb-4">
              {service.tagline}
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-sand)]/60 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] group-hover:text-[var(--color-amberDark)]">
            <span className="flex items-center gap-1.5">
              <span>Μάθετε περισσότερα</span>
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
