"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, X } from "lucide-react";

export default function PwaOfflineManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker on first visit
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
        } catch (err) {
          console.warn("[SW] Registration failed:", err);
        }
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW, { once: true });
      }
    }

    // 2. Track connection events
    const handleOnline = () => {
      setIsOffline(false);
      setBannerDismissed(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3500);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <aside
        aria-label="Κατάσταση σύνδεσης"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[var(--color-forest)] text-white text-xs sm:text-sm px-4 py-3 rounded-lg shadow-lg border border-white/20 transition-all animate-bounce"
      >
        <Wifi size={16} />
        <span>Επανασυνδεθήκατε στο διαδίκτυο</span>
      </aside>
    );
  }

  if (isOffline && !bannerDismissed) {
    return (
      <aside
        aria-label="Κατάσταση σύνδεσης εκτός σύνδεσης"
        className="fixed bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:max-w-md z-50 flex items-center justify-between gap-3 bg-[var(--color-brown)] text-[var(--color-cream)] text-xs sm:text-sm px-4 py-3 rounded-lg shadow-xl border border-[var(--color-sandDark)]/30 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2.5">
          <WifiOff size={16} className="text-[var(--color-amberLight)] shrink-0" />
          <span>
            <strong>Εκτός σύνδεσης:</strong> Περιηγείστε στις αποθηκευμένες σελίδες.
          </span>
        </div>
        <button
          onClick={() => setBannerDismissed(true)}
          className="text-white/70 hover:text-white p-1 rounded transition-colors shrink-0"
          aria-label="Κλείσιμο ειδοποίησης"
        >
          <X size={15} />
        </button>
      </aside>
    );
  }

  return null;
}
