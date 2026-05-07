import { useLocation, Link } from "wouter";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Partners() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer" data-testid="link-logo-home">
              <Logo size="sm" />
              <span className="font-semibold text-lg hidden sm:inline">Partners</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold mb-2">Partner Directory</h1>
          <p className="text-muted-foreground">Coming soon</p>
        </div>
      </main>
    </div>
  );
}
