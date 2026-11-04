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
      <div className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-[var(--color-sandDark)]/30">
        <div className="text-4xl mb-4">{service.icon}</div>
        <h3 className="font-heading text-xl text-[var(--color-brown)] mb-2 leading-snug">
          {service.title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-5">
          {service.tagline}
        </p>
        <Link
          href={`/ypiresies/${service.slug}/`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-amber)] hover:text-[var(--color-amberDark)] transition-colors"
        >
          Μάθε περισσότερα <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/ypiresies/${service.slug}/`}
      className="group flex gap-5 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="text-3xl flex-shrink-0">{service.icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-lg text-[var(--color-brown)] group-hover:text-[var(--color-amber)] transition-colors mb-1 leading-snug">
          {service.title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-2 mb-3">
          {service.tagline}
        </p>
        {service.duration && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-mutedLight)]">
            <Clock size={12} />
            {service.duration}
          </span>
        )}
      </div>
      <ArrowRight
        size={18}
        className="flex-shrink-0 self-center text-[var(--color-sandDark)] group-hover:text-[var(--color-amber)] transition-colors"
      />
    </Link>
  );
}
