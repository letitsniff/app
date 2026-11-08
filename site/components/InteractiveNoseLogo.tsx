"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import "./SniffingNoseLogo.css";

export interface InteractiveNoseLogoProps {
  /** Height of the logo in pixels (width scales proportionally via 44:34 aspect ratio) */
  size?: number;
  /** Additional Tailwind classes for the wrapper */
  className?: string;
  /** Enable subtle cursor-tracking tilt within ±6 degrees */
  enableCursorTilt?: boolean;
  /** Optional callback fired when the user "boops" (clicks/taps) the nose */
  onBoop?: () => void;
  /** Accessible label */
  ariaLabel?: string;
}

interface BoopParticle {
  id: number;
  type: "paw" | "sparkle";
  side: "left" | "right";
}

/**
 * Interactive canine nose logo with breathing, sniffing flaring,
 * cursor tracking tilt, and "boop" particle effects.
 * Lazy-loaded on low priority via SniffingNoseLogo.
 */
export default function InteractiveNoseLogo({
  size = 32,
  className = "",
  enableCursorTilt = true,
  onBoop,
  ariaLabel = "Let It Sniff interactive dog nose logo — click to boop",
}: InteractiveNoseLogoProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isBooping, setIsBooping] = useState(false);
  const [particles, setParticles] = useState<BoopParticle[]>([]);
  const [tilt, setTilt] = useState<{ x: number; y: number; rotate: number }>({
    x: 0,
    y: 0,
    rotate: 0,
  });
  const particleCounter = useRef(0);
  const boopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subtle cursor-tracking tilt (±6 deg max)
  useEffect(() => {
    if (!enableCursorTilt) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Normalize distance within a 280px radius around the logo
          const deltaX = Math.max(-1, Math.min(1, (e.clientX - centerX) / 280));
          const deltaY = Math.max(-1, Math.min(1, (e.clientY - centerY) / 280));

          setTilt({
            x: Number((deltaX * 1.6).toFixed(2)),
            y: Number((deltaY * 1.2).toFixed(2)),
            rotate: Number((deltaX * 5.5).toFixed(2)),
          });
        }
        rafId = null;
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0, rotate: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [enableCursorTilt]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (boopTimeoutRef.current) clearTimeout(boopTimeoutRef.current);
    };
  }, []);

  // Trigger "The Boop!" squash-and-spring + floating micro-particles
  const handleBoop = useCallback(
    (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
      // Allow parent <Link> navigation unless user explicitly hits space/enter on the icon itself
      e.stopPropagation();

      setIsBooping(false);
      // Force reflow restart if clicked rapidly
      requestAnimationFrame(() => {
        setIsBooping(true);
      });

      if (boopTimeoutRef.current) clearTimeout(boopTimeoutRef.current);
      boopTimeoutRef.current = setTimeout(() => {
        setIsBooping(false);
      }, 520);

      const idBase = ++particleCounter.current * 2;
      const newParticles: BoopParticle[] = [
        { id: idBase, type: "paw", side: "left" },
        { id: idBase + 1, type: "sparkle", side: "right" },
      ];

      setParticles((prev) => [...prev.slice(-4), ...newParticles]);

      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => p.id !== idBase && p.id !== idBase + 1)
        );
      }, 850);

      onBoop?.();
    },
    [onBoop]
  );

  const width = Math.round((size * 44) / 34);

  return (
    <span
      ref={containerRef}
      onClick={handleBoop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleBoop(e);
        }
      }}
      role="img"
      aria-label={ariaLabel}
      style={{
        width: `${width}px`,
        height: `${size}px`,
        transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0) rotate(${tilt.rotate}deg)`,
      }}
      className={`lis-logo-root relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-200 ease-out shrink-0 ${
        isBooping ? "lis-boop-active" : ""
      } ${className}`}
    >
      {/* Floating Boop Micro-Particles (Deterministic SVG vectors) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      >
        {particles.map((particle) => (
          <svg
            key={particle.id}
            viewBox="0 0 16 16"
            className={`absolute -top-2 w-3.5 h-3.5 ${
              particle.side === "left"
                ? "left-0 lis-particle-left"
                : "right-0 lis-particle-right"
            }`}
          >
            {particle.type === "paw" ? (
              /* Mini Amber Paw Print */
              <g fill="#C4852A">
                <ellipse cx="8" cy="10.5" rx="3.2" ry="2.6" />
                <circle cx="4.5" cy="6.5" r="1.3" />
                <circle cx="6.8" cy="5" r="1.3" />
                <circle cx="9.4" cy="5" r="1.3" />
                <circle cx="11.6" cy="6.5" r="1.3" />
              </g>
            ) : (
              /* Four-Point Warm Ochre Sparkle */
              <path
                d="M8 1.5 C8.6 5.2, 10.8 7.4, 14.5 8 C10.8 8.6, 8.6 10.8, 8 14.5 C7.4 10.8, 5.2 8.6, 1.5 8 C5.2 7.4, 7.4 5.2, 8 1.5 Z"
                fill="#E8A84A"
              />
            )}
          </svg>
        ))}
      </span>

      {/* Primary Canine Snout & Nose SVG */}
      <svg
        viewBox="0 0 44 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Rich Espresso Nose Leather Gradient */}
          <linearGradient
            id="lis-interactive-nose-leather"
            x1="22"
            y1="4.5"
            x2="22"
            y2="20.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3B2219" />
            <stop offset="48%" stopColor="#2C1810" />
            <stop offset="100%" stopColor="#1A0D08" />
          </linearGradient>

          {/* Soft Muzzle Fur Pad Gradient */}
          <radialGradient
            id="lis-interactive-muzzle-glow"
            cx="50%"
            cy="55%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#F0E8D5" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F0E8D5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ============================================================
            1. SCENT WISPS (Visible & animated on hover / group-hover)
            ============================================================ */}
        <g className="lis-scent-wisps" strokeLinecap="round" fill="none">
          {/* Left Outer & Inner Scent Trails */}
          <path
            d="M 2.5 18.5 C 4.5 15.5, 6.5 19, 9.5 14.5"
            stroke="#C4852A"
            strokeWidth="1.5"
            className="lis-wisp-left-1"
          />
          <path
            d="M 5.5 23 C 7.5 20.5, 9 21.5, 12 16.5"
            stroke="#E8A84A"
            strokeWidth="1.25"
            className="lis-wisp-left-2"
          />

          {/* Right Outer & Inner Scent Trails */}
          <path
            d="M 41.5 18.5 C 39.5 15.5, 37.5 19, 34.5 14.5"
            stroke="#C4852A"
            strokeWidth="1.5"
            className="lis-wisp-right-1"
          />
          <path
            d="M 38.5 23 C 36.5 20.5, 35 21.5, 32 16.5"
            stroke="#E8A84A"
            strokeWidth="1.25"
            className="lis-wisp-right-2"
          />
        </g>

        {/* ============================================================
            2. MUZZLE CONTEXT (Flews, Whisker Follicles, Smiling Mouth)
            ============================================================ */}
        <g className="lis-muzzle-group">
          {/* Soft Sand Muzzle Cushion */}
          <ellipse
            cx="22"
            cy="21"
            rx="16.5"
            ry="10.5"
            fill="url(#lis-interactive-muzzle-glow)"
          />

          {/* Subtle Left & Right Whisker Follicle Dots */}
          <g fill="#2C1810" opacity="0.48">
            <circle cx="10.2" cy="22.2" r="0.9" />
            <circle cx="7.8" cy="24.2" r="0.85" />
            <circle cx="11.8" cy="24.8" r="0.75" />

            <circle cx="33.8" cy="22.2" r="0.9" />
            <circle cx="36.2" cy="24.2" r="0.85" />
            <circle cx="32.2" cy="24.8" r="0.75" />
          </g>

          {/* Happy Canine Lip Lines (\___/\___/) + Philtrum */}
          <path
            d="M 22 19.5 L 22 24.5 M 22 24.5 C 20.2 27.6, 15.2 28.4, 11.2 26.2 C 9.6 25.3, 8.6 24.1, 8.2 23.2 M 22 24.5 C 23.8 27.6, 28.8 28.4, 32.8 26.2 C 34.4 25.3, 35.4 24.1, 35.8 23.2"
            stroke="#2C1810"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ============================================================
            3. ANATOMICAL RHINARIUM (The Sniffing Nose Group)
            ============================================================ */}
        <g className="lis-nose-assembly">
          {/*
            Anatomical Canine Nose Pad Silhouette:
            - Broad, gently convex top dorsal ridge (NO heart dip)
            - Wide lateral alar wings
            - Characteristic bottom-side indents beneath the nostrils
            - Flat-rounded trapezoidal base (NO pointed bottom)
          */}
          <path
            d="M 12.5 5.5
               C 17.5 4.4, 26.5 4.4, 31.5 5.5
               C 35.2 6.3, 36.8 9.2, 36.0 12.4
               C 35.3 15.2, 32.8 16.5, 30.2 17.2
               C 28.3 17.7, 27.2 19.3, 25.0 19.8
               C 23.5 20.1, 20.5 20.1, 19.0 19.8
               C 16.8 19.3, 15.7 17.7, 13.8 17.2
               C 11.2 16.5, 8.7 15.2, 8.0 12.4
               C 7.2 9.2, 8.8 6.3, 12.5 5.5 Z"
            fill="url(#lis-interactive-nose-leather)"
            stroke="#1E100A"
            strokeWidth="0.75"
          />

          {/* Wet Nose Dorsal Gleam (Healthy, cool, moist highlight) */}
          <path
            d="M 13.2 7.2 C 17.8 6.2, 26.2 6.2, 30.8 7.2 C 32.2 7.5, 32.5 8.7, 30.9 8.5 C 26.0 7.7, 18.0 7.7, 13.1 8.5 C 11.5 8.7, 11.8 7.5, 13.2 7.2 Z"
            fill="#FDFAF5"
            fillOpacity="0.28"
          />
          {/* Secondary specular micro-dot on left ridge */}
          <ellipse
            cx="11.2"
            cy="8.6"
            rx="1.1"
            ry="0.65"
            transform="rotate(-18 11.2 8.6)"
            fill="#FDFAF5"
            fillOpacity="0.22"
          />

          {/* Subtle Medial Groove (Philtrum crease entering lower nose pad) */}
          <path
            d="M 22 14.2 L 22 19.7"
            stroke="#120905"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* LEFT NOSTRIL (Comma/Kidney Cavity + Lateral Alar Fold Slit) */}
          <g className="lis-nostril-left">
            {/* Soft Sand Rim Definition for 28px-34px legibility */}
            <path
              d="M 16.6 10.6 C 14.3 10.1, 11.8 11.5, 10.5 13.8"
              stroke="#F0E8D5"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.32"
            />
            {/* Comma Nostril Aperture & Wing Slit */}
            <path
              d="M 16.8 10.8
                 C 15.1 10.2, 13.0 11.1, 12.2 12.7
                 C 11.5 14.0, 10.3 14.4, 9.7 13.9
                 C 10.5 15.2, 12.4 15.5, 13.9 14.7
                 C 15.7 13.9, 16.9 15.2, 17.8 14.2
                 C 18.6 13.2, 18.2 11.3, 16.8 10.8 Z"
              fill="#0E0704"
            />
            {/* Inner Nostril Core Depth */}
            <ellipse
              cx="15.7"
              cy="12.7"
              rx="1.8"
              ry="1.35"
              transform="rotate(-14 15.7 12.7)"
              fill="#070302"
            />
          </g>

          {/* RIGHT NOSTRIL (Comma/Kidney Cavity + Lateral Alar Fold Slit) */}
          <g className="lis-nostril-right">
            {/* Soft Sand Rim Definition for 28px-34px legibility */}
            <path
              d="M 27.4 10.6 C 29.7 10.1, 32.2 11.5, 33.5 13.8"
              stroke="#F0E8D5"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.32"
            />
            {/* Comma Nostril Aperture & Wing Slit */}
            <path
              d="M 27.2 10.8
                 C 28.9 10.2, 31.0 11.1, 31.8 12.7
                 C 32.5 14.0, 33.7 14.4, 34.3 13.9
                 C 33.5 15.2, 31.6 15.5, 30.1 14.7
                 C 28.3 13.9, 27.1 15.2, 26.2 14.2
                 C 25.4 13.2, 25.8 11.3, 27.2 10.8 Z"
              fill="#0E0704"
            />
            {/* Inner Nostril Core Depth */}
            <ellipse
              cx="28.3"
              cy="12.7"
              rx="1.8"
              ry="1.35"
              transform="rotate(14 28.3 12.7)"
              fill="#070302"
            />
          </g>
        </g>
      </svg>
    </span>
  );
}
