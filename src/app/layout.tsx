import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
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
