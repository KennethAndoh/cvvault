import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Share2, FolderLock, FileText, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center gap-2" href="#">
          <img src={logoUrl} alt="CVVault Logo" className="h-8 w-8 rounded-md" />
          <span className="text-xl font-bold tracking-tight text-primary">CVVault</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Secure Your Professional Identity
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The ultimate vault for your CVs, certificates, and professional credentials. Store securely, share professionally, and control your data.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/register">Create Your Vault</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need for your career documents</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  CVVault provides a secure, organized platform for all your professional credentials.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl bg-muted/10">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Encrypted Storage</h3>
                <p className="text-muted-foreground">Your documents are encrypted at rest and in transit using industry-standard protocols.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl bg-muted/10">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Share2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Controlled Sharing</h3>
                <p className="text-muted-foreground">Share specific documents via secure tokens with expiration dates and restricted permissions.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl bg-muted/10">
                <div className="p-3 bg-primary/10 rounded-full">
                  <FolderLock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart Categorization</h3>
                <p className="text-muted-foreground">Organize your CVs, resumes, and certificates with custom tags and metadata.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Professional Public Profiles</h2>
                <p className="text-muted-foreground md:text-xl">
                  Create a professional presence that stands out. Enable your public profile to showcase your verified credentials to recruiters and companies.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Customizable profile links</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>One-click document sharing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Verification badges for credentials</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-2xl bg-white p-4">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                     <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                     </div>
                   </div>
                   <div className="space-y-3">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="h-20 border rounded-lg bg-muted/10 border-dashed flex items-center justify-center text-xs text-muted-foreground">CV.pdf</div>
                      <div className="h-20 border rounded-lg bg-muted/10 border-dashed flex items-center justify-center text-xs text-muted-foreground">Degree.jpg</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2026 CVVault Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
