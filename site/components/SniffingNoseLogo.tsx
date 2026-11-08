"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import StaticNoseLogo from "./StaticNoseLogo";
import type { InteractiveNoseLogoProps } from "./InteractiveNoseLogo";

export interface SniffingNoseLogoProps {
  /** Height of the logo in pixels (width scales proportionally via 44:34 aspect ratio). Defaults to 32. */
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

let cachedInteractiveComponent: React.ComponentType<InteractiveNoseLogoProps> | null = null;
let pendingPromise: Promise<React.ComponentType<InteractiveNoseLogoProps>> | null = null;

function loadInteractiveModule(): Promise<React.ComponentType<InteractiveNoseLogoProps>> {
  if (cachedInteractiveComponent) {
    return Promise.resolve(cachedInteractiveComponent);
  }
  if (!pendingPromise) {
    pendingPromise = import("./InteractiveNoseLogo").then((mod) => {
      cachedInteractiveComponent = mod.default;
      return mod.default;
    });
  }
  return pendingPromise;
}

/**
 * Progressive SniffingNoseLogo:
 * 1. Synchronously renders lightweight StaticNoseLogo during SSR and initial hydration (0 JS overhead, no animation CSS).
 * 2. Defers interactive bundle & animation CSS to requestIdleCallback (low priority).
 * 3. Immediately upgrades on user interaction (hover, touch, focus).
 */
export default function SniffingNoseLogo({
  size = 32,
  className = "",
  enableCursorTilt = true,
  onBoop,
  ariaLabel = "Let It Sniff interactive dog nose logo — click to boop",
}: SniffingNoseLogoProps) {
  const [InteractiveComponent, setInteractiveComponent] = useState<React.ComponentType<InteractiveNoseLogoProps> | null>(
    () => cachedInteractiveComponent
  );

  const isMountedRef = useRef(true);

  const triggerLoad = useCallback(() => {
    if (cachedInteractiveComponent) {
      if (InteractiveComponent !== cachedInteractiveComponent) {
        setInteractiveComponent(() => cachedInteractiveComponent);
      }
      return;
    }
    loadInteractiveModule().then((Comp) => {
      if (isMountedRef.current) {
        setInteractiveComponent(() => Comp);
      }
    });
  }, [InteractiveComponent]);

  useEffect(() => {
    isMountedRef.current = true;

    if (cachedInteractiveComponent) {
      return;
    }

    // Low-priority background load using requestIdleCallback
    if (typeof window !== "undefined") {
      let handle: number;
      if ("requestIdleCallback" in window) {
        handle = (window as Window).requestIdleCallback(
          () => {
            triggerLoad();
          },
          { timeout: 3500 }
        );
        return () => {
          isMountedRef.current = false;
          if ("cancelIdleCallback" in window) {
            (window as Window).cancelIdleCallback(handle);
          }
        };
      } else {
        const timeoutId = setTimeout(triggerLoad, 2000);
        return () => {
          isMountedRef.current = false;
          clearTimeout(timeoutId);
        };
      }
    }
  }, [triggerLoad]);

  if (InteractiveComponent) {
    return (
      <InteractiveComponent
        size={size}
        className={className}
        enableCursorTilt={enableCursorTilt}
        onBoop={onBoop}
        ariaLabel={ariaLabel}
      />
    );
  }

  // Pre-hydration & low-priority waiting state: Pure static SVG with interaction-triggered eager load
  return (
    <StaticNoseLogo
      size={size}
      className={className}
      ariaLabel={ariaLabel}
      onMouseEnter={triggerLoad}
      onTouchStart={triggerLoad}
      onFocus={triggerLoad}
    />
  );
}
