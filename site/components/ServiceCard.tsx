import Link from "next/link";
import type { Service } from "@/lib/services";
import { Clock, ArrowRight } from "lucide-react";

interface Props {
  service: Service;
  variant?: "card" | "hero";
}

export default function ServiceCard({ service, variant = "card" }: Props) {
  if (variant === "hero") {
    return (
      <div className="group bg-white border border-[var(--color-sandDark)] p-6 sm:p-7 flex flex-col justify-between transition-colors">
        <div>
          <div className="text-3xl mb-4">{service.icon}</div>
          <h3 className="font-heading text-xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors mb-2 leading-snug">
            {service.title}
          </h3>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6">
            {service.tagline}
          </p>
        </div>
        <Link
          href={`/ypiresies/${service.slug}/`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors pt-2 border-t border-[var(--color-sand)]"
        >
          Αναλυτικά <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/ypiresies/${service.slug}/`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-l-4 border-[var(--color-amber)] border-y border-r border-[var(--color-sandDark)]/60 p-6 transition-colors hover:border-r-[var(--color-sandDark)]"
    >
      <div className="flex items-start sm:items-center gap-4">
        <span className="text-3xl flex-shrink-0">{service.icon}</span>
        <div>
          <h3 className="font-heading text-xl text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors mb-1 leading-snug">
            {service.title}
          </h3>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-2xl">
            {service.tagline}
          </p>
          {service.duration && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-mutedLight)] mt-2">
              <Clock size={12} />
              {service.duration}
            </span>
          )}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)] group-hover:text-[var(--color-amberDark)] flex-shrink-0">
        <span>Περισσότερα</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}
