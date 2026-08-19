"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pryvault Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/20 bg-card shadow-xl space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading this section of your vault. Your stored documents and credentials remain secure.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-lg bg-muted/60 text-left font-mono text-xs text-muted-foreground overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 rounded-xl shadow-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-xl border-border"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>If the issue persists, please check your network connection.</span>
        </div>
      </div>
    </div>
  );
}
