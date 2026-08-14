"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl border border-red-500/20 bg-slate-900 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Application Error
            </h1>
            <p className="text-sm text-slate-400">
              CVVault encountered an unexpected error. Please reload the application or try again.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => reset()}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
