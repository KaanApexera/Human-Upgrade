import { useState } from "react";
import { useLocation, Link, Redirect } from "wouter";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-white font-medium text-sm sm:text-base pr-4">{question}</span>
        <span className={`text-white/40 text-xl flex-shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-white/50 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

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
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Peak performance" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <button
                onClick={() => setLocation("/register?plan=beta_monthly")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-xs font-bold text-red-400 backdrop-blur-sm animate-pulse hover:bg-red-600/30 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                BETA — First 50 Users Only
              </button>
              <button
                onClick={() => setLocation("/register?plan=beta_monthly")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white/70 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                Full Access · $1/month
              </button>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Look younger.
              <br />
              Feel unstoppable.
              <br />
              <span className="text-red-500">Be your best.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed mb-10">
              Upload your blood test. In 60 seconds, discover exactly why you're tired, gaining weight, or aging faster than you should — and get the precise plan to fix it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setLocation("/register")}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
              >
                Start for Free
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium px-8 py-4 rounded-full text-base transition-all duration-200 backdrop-blur-sm"
              >
                See how it works
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="border-y border-white/[0.06] py-14 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-white/40 text-sm mb-8 uppercase tracking-widest font-semibold">Sound familiar?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Battery, text: "Always tired, even after sleep" },
              { icon: TrendingDown, text: "Can't lose weight no matter what" },
              { icon: Brain, text: "Brain fog and lack of focus" },
              { icon: Flame, text: "Low motivation and energy" },
              { icon: Moon, text: "Poor sleep quality" },
              { icon: Clock, text: "Feeling older than your age" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <Icon className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-white/50 text-sm">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-white/60 text-base mt-8">
            These aren't signs of getting old — they're signs your body is <span className="text-white font-semibold">sending you data</span>. We decode it.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            From blood test to
            <br />
            <span className="text-white/50">transformation plan</span>
          </h2>
          <p className="text-white/40 mt-4 text-lg max-w-xl mx-auto">No doctor appointments. No expensive labs. Just upload what you already have.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              desc: "Our AI analyzes your results and tells you your real biological age — how old your body actually is on the inside. Most people are surprised.",
            },
            {
              step: "03",
              emoji: "🚀",
              title: "Follow Your Personal Plan",
              desc: "Get your exact daily protocol — what to eat, what supplements to take, how to sleep better, and how to boost your energy — all based on your unique biology.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group"
            >
              <div className="text-6xl font-bold text-white/[0.04] absolute top-6 right-6 font-mono">{item.step}</div>
              <div className="text-4xl mb-6">{item.emoji}</div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS SPLIT ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden h-[500px] lg:h-[600px]">
              <img src={SPLIT_IMAGE} alt="Transformation" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/50 text-xs uppercase tracking-wide">Biological Age</p>
                  <span className="text-green-400 text-xs font-medium">8 years younger</span>
                </div>
                <div className="text-5xl font-bold text-red-500 mb-1">32</div>
                <p className="text-white/40 text-xs">Actual age: 40 · Body age: 32</p>
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">What You'll Discover</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Your body knows
                <br />the answers.
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                Stop guessing. Your blood test contains everything — why you're tired, why you can't lose weight, why you're aging faster. We read it all and give you the exact fix.
              </p>
              <div className="space-y-4">
                {[
                  "Why your energy crashes every afternoon",
                  "The real reason the weight won't come off",
                  "Why your sleep never feels restorative",
                  "What's making you age faster than your peers",
                  "The exact supplements your body actually needs",
                  "How to feel 10 years younger in 90 days",
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
                Discover My Results
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
              <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">Your Daily Plan</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Not a generic plan.
                <br />
                <span className="text-white/50">Yours. Only yours.</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                Every plan is built from your actual blood values — not an average. What works for someone else may actively harm you. We give you exactly what your body needs.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Energy", value: "Fix your morning crash for good" },
                  { label: "Weight", value: "Target the real metabolic blocker" },
                  { label: "Sleep", value: "Deep sleep protocol from your data" },
                  { label: "Aging", value: "Slow it down, measurably" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-white/60 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-[500px]">
              <img src={LIFESTYLE_IMAGE} alt="Optimal lifestyle" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-red-500 text-sm font-semibold uppercase tracking-widest mb-4">Real Results</p>
            <h2 className="text-4xl font-bold tracking-tight">People just like you.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I've been 'tired all the time' for years. Turns out my testosterone and iron were both low. The plan fixed both in 6 weeks. I feel 10 years younger.",
                name: "Marcus T.",
                role: "34 years old, father of 2",
              },
              {
                quote: "I was doing everything right — diet, exercise — but couldn't lose weight. My insulin resistance was the problem. Once I targeted that, 18 lbs in 8 weeks.",
                name: "Sarah K.",
                role: "29 years old, fitness coach",
              },
              {
                quote: "My doctor just said everything was 'normal'. Human Upgrade showed me 6 things that were technically normal but far from optimal. Game changer.",
                name: "David R.",
                role: "41 years old, entrepreneur",
              },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
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
            <h2 className="text-4xl font-bold tracking-tight">Start free. No catch.</h2>
            <p className="text-white/40 mt-3">Most people see results with just their first upload.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Free</p>
              <div className="text-4xl font-bold mb-1">$0</div>
              <p className="text-white/30 text-sm mb-8">No credit card. No tricks.</p>
              <ul className="space-y-3 mb-8">
                {[
                  "1 blood test analysis per month",
                  "Full biomarker breakdown",
                  "Biological age score",
                  "Basic optimization plan",
                ].map((f) => (
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
                  "Unlimited blood test uploads",
                  "Advanced aging reversal protocol",
                  "Weight loss & metabolism plan",
                  "Hormone optimization roadmap",
                  "Weekly progress report",
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
            You already have
            <br />the answers.
          </h2>
          <p className="text-white/40 text-lg mb-4">
            Your last blood test is sitting in a drawer somewhere. Upload it now and find out what it's been trying to tell you.
          </p>
          <p className="text-white/60 text-base mb-10 font-medium">Takes 60 seconds. Completely free.</p>
          <button
            onClick={() => setLocation("/register")}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-10 py-4 rounded-full text-base transition-all duration-200 shadow-[0_0_40px_rgba(220,38,38,0.25)]"
          >
            Upload My Blood Test — Free
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-white/20 text-sm mt-4">No credit card required · Results in 60 seconds</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-[#060606]" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3 block">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Questions we get a lot</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do I need to order new blood tests?",
                a: "No — just upload whatever you have. Any standard blood test from your doctor, a pharmacy, or a home test kit works. Even an old one gives useful insights. The more recent, the better.",
              },
              {
                q: "What exactly is 'biological age'?",
                a: "Your biological age is how old your body actually functions — independent of your birthday. Someone who is 45 can have a body that functions like a 35-year-old (or a 55-year-old). We calculate yours from your blood markers and give you a precise score. Then we show you how to lower it.",
              },
              {
                q: "I'm not an athlete. Is this for me?",
                a: "Absolutely. Most of our users are regular people — parents, professionals, entrepreneurs — who feel tired, can't lose weight, or just want to feel better. You don't need to be a biohacker. If you want more energy and to age well, this is for you.",
              },
              {
                q: "How is this different from talking to my doctor?",
                a: "Your doctor checks if your values are in the 'normal' range — but normal doesn't mean optimal. We analyze where your values sit within the optimal range for peak performance, energy, and longevity. Most people are 'normal' but far from their best.",
              },
              {
                q: "How quickly will I feel a difference?",
                a: "Most people notice improved energy and sleep within 2–4 weeks of following their plan. Measurable changes in body composition and biomarkers typically show up after 60–90 days. Your biological age can drop by 3–8 years in 6 months with consistent follow-through.",
              },
              {
                q: "Is this a medical service?",
                a: "No. Human Upgrade OS is a health optimization and information platform, not a medical service. We don't diagnose or treat. All recommendations are educational. Always consult your doctor for medical decisions.",
              },
            ].map(({ q, a }, i) => (
              <FaqItem key={i} question={q} answer={a} />
            ))}
          </div>
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
              <a href="https://instagram.com/thehumanupgradeapp" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label="Instagram">
                <SiInstagram className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com/@humanupgrade" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label="TikTok">
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
