import { useState } from "react";
import { useLocation, Link, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Activity,
  ChevronRight,
  Shield,
  Flame,
  Check,
  Star,
  Zap,
  ArrowDown,
  Dna,
  Heart,
  BarChart3,
  Upload,
} from "lucide-react";
import { SiInstagram, SiTiktok } from "react-icons/si";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=85&fit=crop&crop=top";

const SPLIT_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&fit=crop&crop=center";

const LIFESTYLE_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&fit=crop";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: user, isLoading } = useQuery<User>({ queryKey: ["/api/user"] });

  if (!isLoading && user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="bg-[#080808] text-white min-h-screen overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-[2px]">
        <Link href="/" className="cursor-pointer">
          <Logo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/login")}
            className="text-white/70 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Log in
          </button>
          <button
            onClick={() => setLocation("/register")}
            className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/90 transition-colors"
          >
            Start free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[600px] flex items-end pb-20">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Elite athlete"
            className="w-full h-full object-cover object-top"
          />
          {/* gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/70 via-transparent to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-xs font-bold text-red-400 backdrop-blur-sm animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                BETA — First 50 Users Only
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white/70 backdrop-blur-sm">
                <Dna className="w-3.5 h-3.5 text-red-400" />
                Full Pro Access · $1/month
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Know Your Body.
              <br />
              <span className="text-red-500">Outlive Everyone.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed mb-10">
              Upload your blood work. Get a complete biological age score, personalized protocols, and the exact steps to optimize your performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setLocation("/register")}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
              >
                Start Your Upgrade
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium px-8 py-4 rounded-full text-base transition-all duration-200 backdrop-blur-sm"
              >
                See how it works
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="border-y border-white/[0.06] py-5 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm">
          {[
            { icon: Shield, text: "Science-backed protocols" },
            { icon: Activity, text: "50+ biomarkers analyzed" },
            { icon: Flame, text: "Built for peak performance" },
            { icon: Heart, text: "Personalized to your blood" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-red-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">The Process</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Three steps to your
            <br />
            <span className="text-white/50">best self</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: Upload,
              title: "Upload Your Labs",
              desc: "Drop your blood test PDF. Our AI reads every marker — testosterone, glucose, thyroid, inflammation — in seconds.",
            },
            {
              step: "02",
              icon: BarChart3,
              title: "Get Your Score",
              desc: "Receive your Performance Age score and a full biomarker breakdown showing exactly what's optimal and what needs work.",
            },
            {
              step: "03",
              icon: Zap,
              title: "Execute the Protocol",
              desc: "Get your personalized supplement stack, peptide protocol, meal plan, and daily routine — built for your specific biology.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <div className="text-6xl font-bold text-white/[0.04] absolute top-6 right-6 font-mono">{item.step}</div>
              <div className="p-3 rounded-xl bg-red-600/10 border border-red-500/20 w-fit mb-6">
                <item.icon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPLIT IMAGE + FEATURES ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden h-[500px] lg:h-[600px] order-2 lg:order-1">
              <img
                src={SPLIT_IMAGE}
                alt="Blood work analysis"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent" />
              {/* floating card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/50 text-xs uppercase tracking-wide">Performance Age</p>
                  <span className="text-green-400 text-xs font-medium">↓ 8 years</span>
                </div>
                <div className="text-5xl font-bold text-red-500 mb-1">32</div>
                <p className="text-white/40 text-xs">Chronological age: 40 · Biological age: 32</p>
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="order-1 lg:order-2">
              <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">What You Get</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Your biology,
                <br />decoded.
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                We analyze your labs with the same depth as a top longevity clinic — and turn the data into an executable plan.
              </p>
              <div className="space-y-4">
                {[
                  "Biological age calculation from 50+ biomarkers",
                  "Personalized peptide & GLP-1 protocol",
                  "Hormone optimization roadmap",
                  "AI-generated supplement stack",
                  "Custom meal plan for your metabolism",
                  "Wearable device integration (Oura, WHOOP)",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-white/70">
                    <div className="w-5 h-5 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-sm">{feat}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setLocation("/register")}
                className="mt-10 inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-200"
              >
                Analyze My Bloodwork
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECOND SPLIT ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">Daily Protocol</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Live like the
                <br />top 1%.
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                Elite performers don't guess. They optimize based on data. Get the exact morning routine, sleep protocol, and recovery stack your biomarkers demand.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Morning", value: "Sunlight → Cold → Supplements" },
                  { label: "Training", value: "Based on HRV & recovery" },
                  { label: "Nutrition", value: "Macro targets from labs" },
                  { label: "Sleep", value: "Optimized for your cortisol" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-white/60 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-[500px]">
              <img
                src={LIFESTYLE_IMAGE}
                alt="Peak performance lifestyle"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">Results</p>
            <h2 className="text-4xl font-bold tracking-tight">Real people. Real data.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "My testosterone went from 420 to 780 ng/dL in 3 months following the protocol. No guesswork.",
                name: "Marcus T.",
                role: "Competitive athlete, 34",
              },
              {
                quote: "Lost 18 lbs in 8 weeks on the GLP-1 stack while keeping muscle. The peptide combos are next level.",
                name: "Sarah K.",
                role: "Fitness coach, 29",
              },
              {
                quote: "My functional doctor was impressed by the depth of analysis. Better than a $500 consultation.",
                name: "David R.",
                role: "Longevity enthusiast, 41",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-4xl font-bold tracking-tight">Start free. Go deeper when ready.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Free</p>
              <div className="text-4xl font-bold mb-1">$0</div>
              <p className="text-white/30 text-sm mb-8">No credit card needed</p>
              <ul className="space-y-3 mb-8">
                {["1 lab upload per month", "Biomarker extraction", "Basic protocol", "Performance Age™ score"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/50 text-sm">
                    <Check className="w-4 h-4 text-white/20 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/register")}
                className="w-full py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-colors"
              >
                Get started free
              </button>
            </div>

            <div className="relative p-8 rounded-2xl border border-red-500/30 bg-red-600/[0.04] overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="absolute top-5 right-5">
                <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded px-2 py-0.5 uppercase tracking-wide">Most Popular</span>
              </div>
              <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-3">Pro</p>
              <div className="text-4xl font-bold mb-1">$29<span className="text-lg font-normal text-white/30">/mo</span></div>
              <p className="text-white/30 text-sm mb-8">Or $199/year — save 43%</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited lab uploads",
                  "Oura & WHOOP sync",
                  "AI meal plan generator",
                  "Peptide & GLP-1 protocols",
                  "Weekly upgrade report",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/80 text-sm">
                    <Check className="w-4 h-4 text-red-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/pricing")}
                className="w-full py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Start Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.08)_0%,transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Your biology is
            <br />speaking. Are you listening?
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Upload your labs today. See your Performance Age in under 60 seconds.
          </p>
          <button
            onClick={() => setLocation("/register")}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-10 py-4 rounded-full text-base transition-all duration-200 shadow-[0_0_40px_rgba(220,38,38,0.25)]"
          >
            Start Your Upgrade — It's Free
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-white/20 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-white/30 text-sm">
              <button onClick={() => setLocation("/pricing")} className="hover:text-white transition-colors">Pricing</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-white transition-colors">Terms</button>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/thehumanupgradeapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com/@humanupgrade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <SiTiktok className="w-4 h-4" />
              </a>
            </div>
          </div>
          <p className="text-center text-white/15 text-xs mt-8">© 2025 Human Upgrade OS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
