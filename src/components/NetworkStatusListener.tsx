"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function NetworkStatusListener() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
      setDismissed(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      // Auto-clear "back online" notification after 4 seconds
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Optional Capacitor Network plugin integration via global runtime registry
    let networkListenerHandle: any = null;
    const initCapacitorNetwork = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const Plugins = (Capacitor as any).Plugins || (typeof window !== "undefined" && (window as any).Capacitor?.Plugins);
          const Network = Plugins?.Network;
          if (Network && typeof Network.addListener === "function") {
            const status = await Network.getStatus();
            if (status && typeof status.connected === "boolean") {
              setIsOffline(!status.connected);
            }
            networkListenerHandle = await Network.addListener("networkStatusChange", (status: any) => {
              if (status && !status.connected) {
                handleOffline();
              } else {
                handleOnline();
              }
            });
          }
        }
      } catch {
        // Native Network plugin not loaded; standard window listeners handle network events
      }
    };

    initCapacitorNetwork();

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (networkListenerHandle && typeof networkListenerHandle.remove === "function") {
        networkListenerHandle.remove();
      }
    };
  }, []);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      // Ping check
      const response = await fetch("/api/upload-document", { method: "OPTIONS" }).catch(() => null);
      if (response && response.status < 500) {
        setIsOffline(false);
        setWasOffline(true);
        setTimeout(() => setWasOffline(false), 3000);
      } else if (navigator.onLine) {
        setIsOffline(false);
      }
    } catch {
      // still offline
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  return (
    <AnimatePresence>
      {isOffline && !dismissed ? (
        <motion.div
          key="offline-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-[100] px-4 py-2.5 bg-destructive text-destructive-foreground shadow-lg flex items-center justify-between gap-3 text-xs md:text-sm font-medium"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1 rounded-md bg-white/20 shrink-0">
              <WifiOff className="h-4 w-4 text-white" />
            </span>
            <span className="truncate">
              <strong>Offline Mode:</strong> No internet connection detected. Saved credentials remain accessible.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="h-7 px-2.5 text-xs font-semibold rounded-md shadow-xs bg-white text-destructive hover:bg-white/90"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Checking..." : "Retry"}
            </Button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss offline banner"
              className="p-1 rounded-md hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : wasOffline && !isOffline ? (
        <motion.div
          key="online-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-[100] px-4 py-2 bg-emerald-600 text-white shadow-md flex items-center justify-center gap-2 text-xs md:text-sm font-semibold"
        >
          <Wifi className="h-4 w-4" />
          <span>Connection restored. Pryvault is back online.</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
