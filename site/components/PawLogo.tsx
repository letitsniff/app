import React from "react";

interface PawLogoProps {
  size?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Canine Paw brand logo for Let It Sniff.
 * Renders an optimized transparent PNG sized for retina displays.
 */
export default function PawLogo({
  size = 32,
  className = "",
  ariaLabel = "Let It Sniff paw logo",
}: PawLogoProps) {
  const src =
    size <= 32
      ? "/brand/logo_paw_64.png"
      : size <= 64
      ? "/brand/logo_paw_128.png"
      : "/brand/logo_paw_256.png";

  return (
    <img
      src={src}
      alt={ariaLabel}
      width={size}
      height={size}
      className={`inline-block shrink-0 select-none object-contain ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
