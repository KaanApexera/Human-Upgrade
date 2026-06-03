import { useState } from "react";
import { useLocation, Link, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Logo } from "@/components/Logo";
import {
  ChevronRight,
  Check,
  Star,
  Zap,
  ArrowDown,
  Battery,
  Brain,
  Flame,
  Moon,
  TrendingDown,
  Clock,
  Activity,
  Shield,
  Dna,
  FlaskConical,
} from "lucide-react";
import { SiInstagram, SiTiktok } from "react-icons/si";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&q=85&fit=crop";

const SPLIT_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&fit=crop&crop=center";

const LIFESTYLE_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&fit=crop";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200 hover:border-white/[0.12]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-white font-medium text-sm sm:text-base pr-4">{question}</span>
        <span className={`text-red-500 text-xl flex-shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-white/[0.06]">
          <p className="text-white/50 text-sm leading-relaxed pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useQuery<User>({ queryKey: ["/api/user"] });

  if (!isLoading && user) return <Redirect to="/dashboard" />;

  return (
    <div className="bg-[#080808] text-white min-h-screen overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.04] bg-[#080808]/80 backdrop-blur-md">
        <Link href="/" className="cursor-pointer">
          <Logo size="md" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {["How it works", "Pricing", "FAQ"].map((item) => (
            <button
              key={item}
              onClick={() => document.getElementById(item.toLowerCase().replace(/ /g, "-"))?.scrollIntoView({ behavior: "smooth" })}
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/login")} className="text-white/60 hover:text-white text-sm font-medium transition-colors px-4 py-2">
            Log in
          </button>
          <button
            onClick={() => setLocation("/register")}
            className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            Start free →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-end pb-20 pt-20">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Biology lab" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/75 to-[#080808]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/80 via-transparent to-transparent" />
        </div>

        {/* Red glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-red-500/8 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => setLocation("/register?plan=beta_monthly")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-xs font-bold text-red-400 backdrop-blur-sm hover:bg-red-600/30 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                BETA — First 50 Users Only
              </button>
              <button
                onClick={() => setLocation("/register?plan=beta_monthly")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-xs font-medium text-white/60 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer"
              >
                ⚡ Full Access · $1/month
              </button>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight mb-6">
              Look younger.<br />
              Feel unstoppable.<br />
              <span className="text-red-500 relative">
                Be your best.
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-red-500 to-transparent opacity-40" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/55 max-w-xl leading-relaxed mb-10">
              Upload your blood test. In 60 seconds, discover exactly why you're tired, gaining weight, or aging faster than you should — and get the precise plan to fix it.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => setLocation("/register")}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 shadow-[0_0_40px_rgba(220,38,38,0.35)] hover:shadow-[0_0_60px_rgba(220,38,38,0.45)]"
              >
                Start for Free
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white font-medium px-8 py-4 rounded-full text-base transition-all duration-200 backdrop-blur-sm"
              >
                See how it works
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Floating stats */}
            <div className="flex flex-wrap items-center gap-6">
              {[
                { value: "60s", label: "To get results" },
                { value: "8+", label: "Years younger avg" },
                { value: "$1", label: "Beta price/month" },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-red-400">{value}</div>
                  <div className="text-xs text-white/40 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="border-y border-white/[0.06] py-14 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-white/30 text-xs mb-8 uppercase tracking-[0.3em] font-semibold">Sound familiar?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Battery, text: "Always tired, even after sleep" },
              { icon: TrendingDown, text: "Can't lose weight no matter what" },
              { icon: Brain, text: "Brain fog and lack of focus" },
              { icon: Flame, text: "Low motivation and energy" },
              { icon: Moon, text: "Poor sleep quality" },
              { icon: Clock, text: "Feeling older than your age" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-red-500/20 hover:bg-red-500/[0.03] transition-all duration-200 group">
                <Icon className="w-4 h-4 text-red-500/60 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                <span className="text-white/45 text-sm group-hover:text-white/60 transition-colors">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-white/55 text-base mt-8">
            These aren't signs of getting old — they're signals. Your blood test <span className="text-white font-semibold">already has the answers.</span>
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            From blood test to
            <br />
            <span className="text-white/40">transformation plan</span>
          </h2>
          <p className="text-white/35 mt-4 text-lg max-w-xl mx-auto">No appointments. No expensive labs. Just upload what you have.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-red-500/20 via-red-500/40 to-red-500/20" />
          {[
            {
              step: "01",
              emoji: "📋",
              title: "Upload Your Blood Test",
              desc: "Take a photo or upload the PDF from your last checkup. Any standard blood test works — from your doctor, a pharmacy, or a home test kit.",
            },
            {
              step: "02",
              emoji: "🧬",
              title: "Get Your Biological Age",
              desc: "Our AI analyzes 50+ biomarkers and tells you your real biological age — how old your body actually functions inside. Most people are surprised.",
            },
            {
              step: "03",
              emoji: "🚀",
              title: "Follow Your Personal Plan",
              desc: "Get your exact daily protocol — peptides, nutrition, supplements, sleep optimization — all based on your unique blood values.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className="relative p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-red-500/20 transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/30 transition-all duration-300" />
              <div className="text-7xl font-black text-white/[0.03] absolute top-4 right-5 font-mono select-none">{item.step}</div>
              <div className="text-4xl mb-5">{item.emoji}</div>
              <h3 className="text-lg font-semibold mb-3 text-white">{item.title}</h3>
              <p className="text-white/45 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PEPTIDE / LONGEVITY SECTION ── */}
      <section className="py-24 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.06)_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Longevity Science</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Live longer.
              <br />
              <span className="text-white/40">Feel decades younger.</span>
            </h2>
            <p className="text-white/45 text-lg max-w-2xl mx-auto">
              We combine your blood data with cutting-edge longevity science — including peptide protocols used by the world's top biohackers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {[
              {
                icon: Dna,
                title: "Peptide Protocols",
                desc: "Science-backed peptide recommendations (BPC-157, TB-500, GHK-Cu) tailored to your biomarkers for repair, recovery, and longevity.",
              },
              {
                icon: Activity,
                title: "Biological Age Score",
                desc: "Track your real age at the cellular level. See it drop as you follow your personalized plan. Most users reduce it by 3–8 years.",
              },
              {
                icon: FlaskConical,
                title: "Hormone Optimization",
                desc: "Testosterone, cortisol, thyroid, insulin — we decode every hormone in your blood and give you exact steps to bring them to optimal.",
              },
              {
                icon: Shield,
                title: "Longevity Protocol",
                desc: "Sleep, fasting, supplementation, and movement protocols built from your blood data. The same approach used by Bryan Johnson and top longevity researchers.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-red-500/25 hover:bg-red-500/[0.03] transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 group-hover:bg-red-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-white font-semibold mb-2 text-sm">{title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Longevity stat bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {[
              { value: "50+", label: "Biomarkers analyzed" },
              { value: "3–8", label: "Years younger avg" },
              { value: "90", label: "Days to see results" },
              { value: "97%", label: "Savings vs $29 plan" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-[#0a0a0a] p-6 text-center hover:bg-white/[0.02] transition-colors">
                <div className="text-3xl font-black text-red-400 mb-1">{value}</div>
                <div className="text-white/35 text-xs uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS SPLIT ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden h-[500px] lg:h-[580px] group">
              <img src={SPLIT_IMAGE} alt="Transformation" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-[#080808]/20 to-transparent" />
              {/* Biological age card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/40 text-xs uppercase tracking-widest">Biological Age</p>
                  <span className="text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-0.5 rounded-full">↓ 8 years younger</span>
                </div>
                <div className="text-6xl font-black text-red-500 mb-1 leading-none">32</div>
                <p className="text-white/35 text-xs mb-3">Chronological age: 40 · Body age: 32</p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-red-700 to-red-400" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">What You'll Discover</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Your body knows
                <br />the answers.
              </h2>
              <p className="text-white/45 text-lg leading-relaxed mb-10">
                Your blood test contains everything — why you're tired, why weight won't move, why you're aging faster. We read it all and give you the exact protocol to fix it.
              </p>
              <div className="space-y-3">
                {[
                  "Why your energy crashes every afternoon",
                  "The real reason the weight won't come off",
                  "Which peptides your body actually needs",
                  "Why your sleep never feels restorative",
                  "What's making you age faster than your peers",
                  "How to feel 10 years younger in 90 days",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-white/65">
                    <div className="w-5 h-5 rounded-full bg-red-600/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-sm">{feat}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setLocation("/register")}
                className="mt-10 inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-7 py-3.5 rounded-full text-sm transition-all duration-200 shadow-[0_0_25px_rgba(220,38,38,0.25)]"
              >
                Discover My Results
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERSONALIZED PLAN SPLIT ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Your Daily Plan</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Not a generic plan.
                <br />
                <span className="text-white/40">Yours. Only yours.</span>
              </h2>
              <p className="text-white/45 text-lg leading-relaxed mb-10">
                Every protocol is built from your actual blood values. What works for someone else may actively harm you. We give you exactly what your body needs — including peptide and longevity stacks.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Energy", value: "Fix your crash for good" },
                  { label: "Weight", value: "Target the real blocker" },
                  { label: "Peptides", value: "Science-backed protocol" },
                  { label: "Longevity", value: "Slow aging, measurably" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-red-500/20 transition-colors">
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-white/55 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-[480px] group">
              <img src={LIFESTYLE_IMAGE} alt="Optimal lifestyle" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="p-4 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md">
                  <p className="text-white/40 text-xs mb-2 uppercase tracking-widest">Weekly Protocol</p>
                  <div className="space-y-1.5">
                    {["BPC-157 · 250mcg/day", "Vitamin D · 5000 IU", "Magnesium · 400mg", "Intermittent fasting 16:8"].map((p) => (
                      <div key={p} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        <span className="text-white/60 text-xs">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Real Results</p>
            <h2 className="text-4xl font-bold tracking-tight">People just like you.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "I've been 'tired all the time' for years. Testosterone and iron were both low. The protocol — including peptides — fixed both in 6 weeks. I feel 10 years younger.",
                name: "Marcus T.",
                role: "34 years old · Father of 2",
                result: "↓ 7 years biological age",
              },
              {
                quote: "I was doing everything right — diet, exercise — but couldn't lose weight. Insulin resistance was the problem. Once I targeted that, 18 lbs in 8 weeks.",
                name: "Sarah K.",
                role: "29 years old · Fitness coach",
                result: "↓ 18 lbs in 8 weeks",
              },
              {
                quote: "My doctor said everything was 'normal'. Human Upgrade showed 6 things technically normal but far from optimal. The longevity protocol changed everything.",
                name: "David R.",
                role: "41 years old · Entrepreneur",
                result: "↓ 5 years biological age",
              },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-red-500/15 transition-all duration-200 group flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/55 text-sm leading-relaxed mb-5 flex-1">"{t.quote}"</p>
                <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/25 text-xs mt-0.5">{t.role}</p>
                  </div>
                  <span className="text-green-400 text-xs font-medium bg-green-400/10 px-2.5 py-1 rounded-full">{t.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.04)_0%,transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">Pricing</p>
            <h2 className="text-4xl font-bold tracking-tight">Start free. No catch.</h2>
            <p className="text-white/35 mt-3">Most people see results with just their first upload.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-200">
              <p className="text-white/35 text-xs font-bold uppercase tracking-widest mb-4">Free</p>
              <div className="text-5xl font-black mb-1">$0</div>
              <p className="text-white/25 text-sm mb-8">No credit card. No tricks.</p>
              <ul className="space-y-3 mb-8">
                {[
                  "1 blood test analysis/month",
                  "Full biomarker breakdown",
                  "Biological age score",
                  "Basic optimization plan",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/45 text-sm">
                    <Check className="w-4 h-4 text-white/20 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/register")}
                className="w-full py-3.5 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-sm font-medium transition-all"
              >
                Get started free
              </button>
            </div>

            {/* Beta */}
            <div className="relative p-8 rounded-2xl border border-red-500/35 bg-red-600/[0.04] overflow-hidden hover:border-red-500/50 transition-all duration-200">
              {/* top glow line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
              {/* Red glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />

              <div className="flex items-center justify-between mb-4">
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Beta Access</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 uppercase tracking-wide">50 spots only</span>
                </div>
              </div>

              <div className="flex items-end gap-3 mb-1">
                <div className="text-6xl font-black text-white">$1</div>
                <div className="pb-2 text-white/40 text-lg">/month</div>
              </div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-white/25 text-sm line-through">normally $29</span>
                <span className="text-red-400 text-xs font-bold bg-red-500/15 px-2 py-0.5 rounded-full">SAVE 97%</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited blood test uploads",
                  "Peptide & longevity protocol",
                  "Hormone optimization roadmap",
                  "Biological age tracking",
                  "Weekly progress report",
                  "Sleep & nutrition plan",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white/75 text-sm">
                    <Check className="w-4 h-4 text-red-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setLocation("/register?plan=beta_monthly")}
                className="w-full py-4 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.4)]"
              >
                <Zap className="w-4 h-4" />
                Claim Your Beta Spot — $1/mo
              </button>
              <p className="text-center text-white/20 text-xs mt-3">Credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.07)_0%,transparent_65%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-6">Don't wait</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Your best version<br />is in your blood test.
          </h2>
          <p className="text-white/40 text-lg mb-4">
            Your last blood test is sitting somewhere. Upload it now and find out what it's been trying to tell you.
          </p>
          <p className="text-white/55 text-base mb-10 font-medium">Takes 60 seconds. First 50 people get beta access for $1/month.</p>
          <button
            onClick={() => setLocation("/register")}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded-full text-base transition-all duration-200 shadow-[0_0_50px_rgba(220,38,38,0.3)] hover:shadow-[0_0_70px_rgba(220,38,38,0.45)]"
          >
            Upload My Blood Test — Free
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-white/20 text-sm mt-4">No credit card required · Results in 60 seconds</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-[#060606] border-t border-white/[0.06]" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-3 block">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Questions we get a lot</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Do I need to order new blood tests?",
                a: "No — just upload whatever you have. Any standard blood test from your doctor, a pharmacy, or a home test kit works. Even an old one gives useful insights.",
              },
              {
                q: "What exactly is 'biological age'?",
                a: "Your biological age is how old your body actually functions — independent of your birthday. We calculate it from your blood markers and give you a precise score. Then we show you how to lower it.",
              },
              {
                q: "What are peptides and why do you recommend them?",
                a: "Peptides are short chains of amino acids that signal your body to repair, regenerate, and optimize — things like BPC-157 for healing, TB-500 for recovery, or GHK-Cu for anti-aging. We only recommend what your blood data suggests you actually need.",
              },
              {
                q: "I'm not an athlete or biohacker. Is this for me?",
                a: "Absolutely. Most users are regular people — parents, professionals, entrepreneurs — who feel tired or want to age better. You don't need to be a biohacker. If you want more energy and to live longer, this is for you.",
              },
              {
                q: "How is this different from talking to my doctor?",
                a: "Your doctor checks if values are in the 'normal' range. Normal doesn't mean optimal. We analyze where values sit within the optimal range for peak performance and longevity. Most people are 'normal' but far from their best.",
              },
              {
                q: "How quickly will I feel a difference?",
                a: "Most people notice improved energy within 2–4 weeks. Measurable biomarker changes in 60–90 days. Biological age can drop 3–8 years in 6 months with consistent follow-through.",
              },
            ].map(({ q, a }, i) => (
              <FaqItem key={i} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-10 bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-white/25 text-sm">
              <button onClick={() => setLocation("/pricing")} className="hover:text-white/60 transition-colors">Pricing</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-white/60 transition-colors">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-white/60 transition-colors">Terms</button>
            </div>
            <div className="flex items-center gap-5">
              <a href="https://instagram.com/thehumanupgradeapp" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/60 transition-colors" aria-label="Instagram">
                <SiInstagram className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com/@humanupgrade" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/60 transition-colors" aria-label="TikTok">
                <SiTiktok className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
            <p className="text-white/15 text-xs">
              © 2025 Human Upgrade. Not a medical service. All recommendations are educational. Consult your doctor for medical decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
