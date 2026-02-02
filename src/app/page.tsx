import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Share2, FolderLock, FileText, CheckCircle, ArrowRight, Star, Zap, Lock, Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function LandingPage() {
  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link className="flex items-center gap-2 group" href="/">
            <img src={logoUrl} alt="CVVault Logo" className="h-10 w-10 rounded-xl shadow-sm transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">CVVault</span>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link className="text-sm font-semibold hover:text-primary transition-colors" href="#features">Features</Link>
            <Link className="text-sm font-semibold hover:text-primary transition-colors" href="#security">Security</Link>
            <Link className="text-sm font-semibold hover:text-primary transition-colors" href="/login">Login</Link>
            <ModeToggle />
            <Button asChild className="rounded-full px-6">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
            <div className="md:hidden flex items-center gap-2">
               <ModeToggle />
               <Sheet>
                 <SheetTrigger asChild>
                   <Button variant="ghost" size="icon">
                     <Menu className="h-6 w-6" />
                   </Button>
                 </SheetTrigger>
                 <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                   <SheetHeader className="text-left">
                     <SheetTitle className="flex items-center gap-2">
                       <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded" />
                       CVVault
                     </SheetTitle>
                   </SheetHeader>
                   <nav className="flex flex-col gap-4 mt-8">
                     <Link className="text-lg font-semibold hover:text-primary transition-colors" href="#features">Features</Link>
                     <Link className="text-lg font-semibold hover:text-primary transition-colors" href="#security">Security</Link>
                     <Link className="text-lg font-semibold hover:text-primary transition-colors" href="/login">Login</Link>
                     <Button asChild className="rounded-full w-full mt-4">
                       <Link href="/register">Get Started</Link>
                     </Button>
                   </nav>
                 </SheetContent>
               </Sheet>
            </div>

        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full -z-10">
            <div className="absolute top-[10%] right-[5%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
          </div>
          
          <div className="container px-4 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 animate-bounce">
              <Star className="h-3 w-3 fill-primary" />
              <span>THE MOST SECURE WAY TO STORE CVS</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Your Professional Identity, <span className="text-primary">Vaulted.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Store, organize, and share your career credentials with military-grade security. Built for professionals who value their data privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20">
                <Link href="/register">Create Your Free Vault <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
            
            <div className="mt-20 relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-4">
               <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center border border-primary/5">
                  <div className="flex flex-col items-center gap-4">
                     <Lock className="h-16 w-16 text-primary opacity-50" />
                     <p className="text-primary font-bold tracking-widest text-sm">ENCRYPTED DASHBOARD PREVIEW</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for Modern Careers</h2>
              <p className="text-muted-foreground text-lg">CVVault simplifies how you manage your professional documents with powerful, intuitive tools.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Military-Grade Security",
                  desc: "Your documents are encrypted at rest and in transit. Only you hold the keys to your professional vault."
                },
                {
                  icon: Share2,
                  title: "Smart Sharing",
                  desc: "Generate secure, time-limited access tokens for recruiters. Revoke access at any time with one click."
                },
                {
                  icon: FolderLock,
                  title: "Advanced Organization",
                  desc: "Categorize documents by type, date, or custom tags. Find what you need in seconds with global search."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl bg-card border hover:border-primary/50 transition-all hover:shadow-xl group">
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="w-full py-20 overflow-hidden">
          <div className="container px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold mb-6">
                  <CheckCircle className="h-3 w-3" />
                  <span>TRUSTED BY 5,000+ PROFESSIONALS</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Professional Public Profiles with Privacy First</h2>
                <p className="text-muted-foreground text-lg mb-10">
                  Control your narrative. Share your verified credentials via a professional landing page that you own. Disable or enable parts of your profile instantly.
                </p>
                <div className="space-y-4">
                  {[
                    "Customizable vanity URLs (cvvault.com/p/yourname)",
                    "One-click verification for recruiters",
                    "Granular document-level permission control",
                    "Activity logs showing who viewed your documents"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <Button asChild size="lg" className="mt-12 rounded-full px-8">
                  <Link href="/register">Set Up Your Profile</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-[100px] -z-10" />
                <div className="bg-card border-2 border-primary/20 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-muted animate-pulse rounded" />
                    <div className="h-2 w-full bg-muted animate-pulse rounded" />
                    <div className="h-2 w-2/3 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-12">
                    <div className="h-32 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 bg-primary/5">
                      <FileText className="h-8 w-8 text-primary" />
                      <span className="text-xs font-bold text-primary">CV_2026.pdf</span>
                    </div>
                    <div className="h-32 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-2">
                      <Zap className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">Degree.jpg</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t flex justify-between items-center">
                    <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Public View Mode</div>
                    <div className="h-6 w-12 bg-primary/20 rounded-full relative">
                      <div className="absolute right-1 top-1 h-4 w-4 bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted/50 border-t py-12">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <Link className="flex items-center gap-2 mb-6" href="/">
                <img src={logoUrl} alt="CVVault Logo" className="h-8 w-8 rounded-lg" />
                <span className="text-xl font-bold tracking-tight text-primary">CVVault</span>
              </Link>
              <p className="text-muted-foreground max-w-sm mb-6">
                The leading professional vault for career credentials and verified digital identity. Securely store and share your professional life.
              </p>
              <div className="flex gap-4">
                 {/* Social links placeholder */}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">How it works</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2026 CVVault Inc. All rights reserved.</p>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <span>Made with ❤️ for Professionals</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
