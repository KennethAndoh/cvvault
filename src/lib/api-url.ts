import { Capacitor } from "@capacitor/core";

const FALLBACK_PROD_URL = "https://pryvault.vercel.app";

/**
 * Returns the absolute base API URL depending on whether the app
 * is executing in a native Capacitor environment (Android / iOS)
 * or in a standard web browser.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || FALLBACK_PROD_URL;
  }

  try {
    const isNative = Capacitor.isNativePlatform();
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.protocol === "capacitor:" ||
      window.location.protocol === "file:";

    // If native or static localhost build, target remote production server
    if (isNative || (isLocalhost && window.location.port !== "3000")) {
      return process.env.NEXT_PUBLIC_APP_URL || FALLBACK_PROD_URL;
    }
  } catch {
    // fallback to relative if window/capacitor check fails
  }

  // Standard web browser development or production
  return "";
}

/**
 * Helper to build an absolute or relative API URL for fetching.
 */
export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalizedPath;
  return `${base.replace(/\/+$/, "")}${normalizedPath}`;
}
