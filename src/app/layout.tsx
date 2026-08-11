import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563EB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
};
import { VisualEditsMessenger } from "orchids-visual-edits";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cvvault.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "CVVault | Secure Career Credentials",
  description:
    "Securely store, organize, and share your career credentials. Upload CVs, verify documents, and connect with employers — all in one place.",
  keywords: ["CV", "resume", "career credentials", "job application", "document vault"],
  openGraph: {
    type: "website",
    url: APP_URL,
    title: "CVVault | Secure Career Credentials",
    description:
      "Securely store, organize, and share your career credentials. Upload CVs, verify documents, and connect with employers — all in one place.",
    siteName: "CVVault",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CVVault — Secure Career Credentials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CVVault | Secure Career Credentials",
    description:
      "Securely store, organize, and share your career credentials.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden max-w-full w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "light-warm", "dark", "dark-midnight"]}
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
