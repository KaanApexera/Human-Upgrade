import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { ChevronRight, Check, ArrowDown, Brain, Flame, Battery, Moon, TrendingDown, Clock, Dna, Activity, Heart, Zap } from "lucide-react";

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

const FACTORS = [
  {
    icon: <Flame className="w-5 h-5 text-red-500" />,
    title: "Chronic Inflammation",
    description: "Elevated CRP, IL-6, fibrinogen, and homocysteine are among the strongest drivers of accelerated biological aging. Chronic low-grade inflammation damages cellular DNA and shortens telomeres over time.",
    markers: "CRP, Homocysteine, Fibrinogen",
  },
  {
    icon: <Activity className="w-5 h-5 text-red-500" />,
    title: "Metabolic Health",
    description: "Insulin resistance and poor blood sugar regulation dramatically accelerate aging at the cellular level. High fasting insulin, elevated HbA1c, and poor glucose tolerance are major contributors to a higher biological age.",
    markers: "HbA1c, Fasting Insulin, Glucose, HOMA-IR",
  },
  {
    icon: <Brain className="w-5 h-5 text-red-500" />,
    title: "Hormone Balance",
    description: "Declining testosterone, estrogen, DHEA, and growth hormone accelerate biological aging. Conversely, elevated cortisol from chronic stress is one of the fastest ways to age your brain and body.",
    markers: "Testosterone, DHEA-S, Cortisol, IGF-1, Estradiol",
  },
  {
    icon: <Heart className="w-5 h-5 text-red-500" />,
    title: "Cardiovascular Markers",
    description: "Lipid patterns matter far beyond total cholesterol. Oxidized LDL, small dense LDL particles, elevated triglycerides, and low HDL are powerful predictors of vascular age and longevity.",
    markers: "LDL, HDL, Triglycerides, ApoB, Lp(a)",
  },
  {
    icon: <Dna className="w-5 h-5 text-red-500" />,
    title: "Oxidative Stress",
    description: "Free radical damage to DNA, proteins, and lipids accelerates cellular aging at its root. Antioxidant status — including glutathione, CoQ10, and vitamin E — shapes your rate of biological aging.",
    markers: "Uric Acid, GGT, Ferritin",
  },
  {
    icon: <Zap className="w-5 h-5 text-red-500" />,
    title: "Thyroid Function",
    description: "Sub-optimal thyroid function — even when technically 'normal' — slows metabolism, impairs cellular repair, reduces energy, and can add years to your biological age. Optimal TSH is far narrower than the clinical range.",
    markers: "TSH, Free T3, Free T4, Reverse T3",
  },
  {
    icon: <Battery className="w-5 h-5 text-red-500" />,
    title: "Nutrient Status",
    description: "Deficiencies in vitamin D, magnesium, B12, omega-3 fatty acids, zinc, and iron directly impair cellular repair mechanisms and mitochondrial function — accelerating the rate of biological aging.",
    markers: "Vitamin D, Magnesium, B12, Ferritin, Zinc",
  },
  {
    icon: <Moon className="w-5 h-5 text-red-500" />,
    title: "Sleep Quality",
    description: "Poor sleep is not just fatigue — it is an accelerated aging event. Inadequate sleep impairs growth hormone secretion, increases cortisol, elevates inflammatory markers, and damages DNA repair processes overnight.",
    markers: "Cortisol, GH (Growth Hormone), CRP",
  },
  {
    icon: <TrendingDown className="w-5 h-5 text-red-500" />,
    title: "Liver & Kidney Function",
    description: "Your liver and kidneys are your primary detoxification organs. Impaired liver function elevates systemic toxin load and increases oxidative stress. Elevated creatinine or eGFR decline signals accelerated organ aging.",
    markers: "ALT, AST, GGT, Creatinine, eGFR, BUN",
  },
  {
    icon: <Clock className="w-5 h-5 text-red-500" />,
    title: "Immune Function",
    description: "Chronically elevated or suppressed immune markers signal accelerated biological aging. Both persistent infections and immune overactivation create inflammatory burden that ages cells faster.",
    markers: "WBC, Neutrophil/Lymphocyte Ratio, CBC Differential",
  },
];

const HOW_TO_IMPROVE = [
  {
    step: "01",
    title: "Resolve Inflammation First",
    description: "Chronic inflammation is the single most powerful accelerant of biological aging. Removing inflammatory triggers — processed seed oils, excess sugar, food sensitivities, chronic infections, poor sleep — produces rapid improvements in CRP and other inflammatory markers, often within 4-8 weeks.",
  },
  {
    step: "02",
    title: "Optimize Metabolic Health",
    description: "Reverse insulin resistance through time-restricted eating, resistance training, and reducing refined carbohydrates. Even a 20% improvement in fasting insulin dramatically lowers biological age scores. HbA1c improvements of just 0.3-0.5% can reflect years of biological age improvement.",
  },
  {
    step: "03",
    title: "Restore Hormone Balance",
    description: "Sub-optimal testosterone, DHEA, and growth hormone accelerate aging and are often correctable without TRT. Resistance training, optimized sleep, zinc, vitamin D, and specific adaptogens can meaningfully shift hormone profiles within 60-90 days.",
  },
  {
    step: "04",
    title: "Address Nutrient Deficiencies",
    description: "Vitamin D deficiency (below 50 ng/mL) alone can add 3-5 years to biological age scores. Magnesium deficiency impairs over 300 enzymatic reactions. A targeted supplement protocol based on your actual blood levels — not guesswork — is one of the highest-leverage interventions.",
  },
  {
    step: "05",
    title: "Optimize Sleep Architecture",
    description: "Deep sleep is when growth hormone is released, DNA repair happens, and inflammatory debris is cleared from the brain. Tracking and optimizing sleep quality — not just duration — through light management, temperature, and timing can shift biological age biomarkers measurably within 30 days.",
  },
  {
    step: "06",
    title: "Apply Targeted Peptide Protocols",
    description: "Peptides like BPC-157, TB-500, CJC-1295, and Ipamorelin support tissue repair, growth hormone optimization, and cellular regeneration. When applied based on your specific biomarker profile and health goals, peptides can accelerate biological age improvement significantly.",
  },
];

export default function LandingBiologicalAge() {
  const [, setLocation] = useLocation();

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
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="text-red-400 text-xs font-semibold uppercase tracking-widest">Biological Age Calculator</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6">
            How Old Is Your Body{" "}
            <span className="text-red-500">Really?</span>
          </h1>
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Your birthday doesn't tell the whole story. Your blood work does. Calculate your biological age, discover what's driving it, and get a personalized longevity protocol to lower it — using AI and your existing blood tests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation("/register")}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-full text-base transition-colors flex items-center justify-center gap-2"
            >
              Calculate My Biological Age Free
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLocation("/pricing")}
              className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-full text-base transition-colors"
            >
              View Pricing
            </button>
          </div>
          <p className="mt-4 text-white/30 text-sm">Use your existing blood tests — no new labs required</p>
        </div>
        <div className="absolute bottom-8 flex flex-col items-center gap-2 text-white/20">
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* ── WHAT IS BIOLOGICAL AGE ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
              What Is Biological Age — and Why Does It Matter?
            </h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Your chronological age is simply how many years you've been alive. Your biological age is how old your body actually functions — at the cellular, metabolic, and organ level.
            </p>
            <p className="text-white/60 leading-relaxed mb-4">
              Two people can both be 45 years old. One has the biological profile of a 38-year-old: sharp hormones, low inflammation, excellent metabolic health, strong cardiovascular markers. The other has a biological age of 57: chronic inflammation, insulin resistance, declining testosterone, and oxidative stress accumulating in every cell.
            </p>
            <p className="text-white/60 leading-relaxed mb-4">
              The difference is not luck. It is measurable, driven by specific biomarkers in your blood — and most importantly, it is reversible.
            </p>
            <p className="text-white/60 leading-relaxed">
              Human Upgrade OS calculates your Performance Age™ — a biological age score derived from 50+ blood biomarkers — and then builds a personalized longevity protocol to lower it. Most users see their biological age drop by 2-7 years within 6 months of following their protocol.
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-white/40 text-sm uppercase tracking-widest mb-2">Example Comparison</div>
              <div className="text-white/60 text-sm">Same chronological age, very different biological age</div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Chronological Age", a: "45", b: "45", equal: true },
                { label: "Biological Age", a: "38", b: "57", equal: false },
                { label: "CRP (Inflammation)", a: "0.4 mg/L", b: "3.8 mg/L", equal: false },
                { label: "Testosterone", a: "720 ng/dL", b: "290 ng/dL", equal: false },
                { label: "HbA1c", a: "5.1%", b: "6.1%", equal: false },
                { label: "Vitamin D", a: "62 ng/mL", b: "18 ng/mL", equal: false },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-white/40">{row.label}</div>
                  <div className="text-center font-semibold text-green-400">{row.a}</div>
                  <div className={`text-center font-semibold ${row.equal ? "text-white/60" : "text-red-400"}`}>{row.b}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/30">
              <div></div>
              <div className="text-center">Person A</div>
              <div className="text-center">Person B</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT'S CALCULATED ── */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">How Biological Age Is Calculated</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Human Upgrade OS uses a composite biomarker algorithm that weighs and correlates over 50 markers against longevity research databases to produce your Performance Age™ score.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                step: "01",
                title: "Upload Your Blood Test",
                body: "Upload a PDF or photo of any standard blood panel — from your doctor, LabCorp, Quest, or a home test kit. Our AI reads and extracts every marker automatically. No manual entry, no new tests required.",
              },
              {
                step: "02",
                title: "AI Analysis Against Optimal Ranges",
                body: "Unlike standard lab ranges (which are 'not sick'), we compare your markers against optimal longevity ranges derived from centenarian studies, Blue Zone research, and functional medicine benchmarks. Each marker is scored and weighted.",
              },
              {
                step: "03",
                title: "Composite Age Score",
                body: "Your Performance Age™ is calculated by combining weighted scores across inflammation, hormones, metabolic health, cardiovascular markers, nutrient status, and organ function. The result is a single number that reflects your true biological age.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <div className="text-red-500 font-black text-4xl mb-4 font-mono">{item.step}</div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-white/70 text-sm leading-relaxed max-w-3xl mx-auto">
              <strong className="text-white">Important:</strong> Human Upgrade OS is not a medical service. Biological age scores are educational and informational — not a clinical diagnosis. Always consult your physician before making health decisions based on biomarker data.
            </p>
          </div>
        </div>
      </section>

      {/* ── 10 FACTORS ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">10 Biomarker Factors That Drive Biological Age</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">
            These are the most powerful levers in your blood work. Human Upgrade OS analyzes all of them — and tells you exactly which ones to address first.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {FACTORS.map((factor) => (
            <div key={factor.title} className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 hover:border-red-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  {factor.icon}
                </div>
                <h3 className="text-white font-bold text-base">{factor.title}</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-3">{factor.description}</p>
              <div className="text-xs text-red-400/70 font-mono">Key markers: {factor.markers}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW TO IMPROVE ── */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">How to Lower Your Biological Age</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Biological age is not fixed. These six evidence-based strategies — applied in the right sequence based on your biomarkers — are how you reverse it.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {HOW_TO_IMPROVE.map((item) => (
              <div key={item.step} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <div className="text-red-500 font-black text-3xl mb-3 font-mono">{item.step}</div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Why Human Upgrade OS — Not Just Your Doctor</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">
            Standard medicine is designed to keep you from being sick. Longevity medicine is designed to make you thrive. The difference is in how the data is interpreted.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8">
            <h3 className="text-white/40 font-bold text-lg mb-6 uppercase tracking-widest text-sm">Standard Doctor Visit</h3>
            <ul className="space-y-4">
              {[
                "Checks if markers are within broad 'normal' lab ranges",
                "Flags clinically abnormal values that need treatment",
                "Does not correlate multiple markers against each other",
                "Does not provide supplement or lifestyle protocols",
                "15-minute appointment, no follow-up analysis",
                "Normal range designed to detect disease, not optimize health",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/50">
                  <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-600/5 border border-red-500/20 rounded-2xl p-8">
            <h3 className="text-red-400 font-bold text-lg mb-6 uppercase tracking-widest text-sm">Human Upgrade OS</h3>
            <ul className="space-y-4">
              {[
                "Analyzes markers against optimal longevity ranges from research",
                "Cross-correlates 50+ markers to identify root-cause patterns",
                "Calculates your composite biological age score",
                "Builds a personalized supplement and lifestyle protocol",
                "Day-by-day actionable plan, updates with every new upload",
                "Designed to optimize performance and slow biological aging",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white">
                  <Check className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── COMMON QUESTIONS ── */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Common Questions</h2>
          </div>
          <div className="space-y-3">
            <FaqItem
              question="Do I need to order new blood tests?"
              answer="No. You can use any existing blood test results — from an annual physical, your doctor, LabCorp, Quest, or a home test kit like Everlywell. Upload a PDF or photo and the AI reads it automatically. If you want more comprehensive coverage, we recommend specific panels, but you can start immediately with what you have."
            />
            <FaqItem
              question="What exactly is biological age?"
              answer="Biological age is how old your body actually functions at a cellular, metabolic, and organ level — independent of your chronological age. A 50-year-old with excellent biomarkers might have a biological age of 38. A 35-year-old with chronic inflammation, poor metabolic health, and declining hormones might have a biological age of 48. It's determined by specific, measurable markers in your blood."
            />
            <FaqItem
              question="I'm not an athlete. Is this for me?"
              answer="Absolutely. Human Upgrade OS is most commonly used by people who are chronically tired, struggling to lose weight despite diet changes, experiencing declining mental sharpness or libido, or simply feeling older than they should. You do not need to be healthy or athletic to benefit — the platform meets you where you are and builds a protocol around your current biology."
            />
            <FaqItem
              question="How is this different from talking to my doctor?"
              answer="Your doctor is checking if your markers fall outside the clinical normal range — a range designed to detect disease, not optimize performance. Human Upgrade OS compares your markers against optimal longevity ranges from research, cross-references dozens of markers together to find root-cause patterns, and builds a specific protocol to act on the findings. It's the complement to your doctor — not a replacement."
            />
            <FaqItem
              question="How quickly will I feel a difference?"
              answer="Many users notice improvements in energy and sleep within 2-4 weeks of consistently following their protocol. Measurable biomarker changes typically appear in blood work after 60-90 days. Biological age scores can shift by 2-7 years within 6 months of diligent adherence. Your protocol automatically updates with every new blood test upload."
            />
            <FaqItem
              question="Is this a medical service?"
              answer="No. Human Upgrade OS is a health optimization and information platform. It does not diagnose, treat, cure, or prescribe. All insights, scores, and protocols are educational and informational in nature. Always review any protocol changes with your licensed healthcare provider before implementation."
            />
            <FaqItem
              question="What biomarkers are analyzed?"
              answer="Over 50 markers including: CBC with differential, comprehensive metabolic panel, lipid panel (including ApoB and Lp(a) if available), HbA1c and fasting insulin, hormone panel (testosterone, estrogen, DHEA, cortisol, IGF-1), thyroid panel (TSH, Free T3, Free T4), inflammation markers (CRP, homocysteine), vitamin D, B12, magnesium, ferritin, and more. The more comprehensive your panel, the more detailed your protocol."
            />
            <FaqItem
              question="How often should I retest?"
              answer="Most users retest every 60-90 days when actively following a protocol — this gives enough time for meaningful biomarker shifts to appear. Annual testing is a minimum. Human Upgrade OS tracks all your results over time and shows your biological age trend with each upload, so you can see your progress clearly."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
            Find Out How Old Your Body{" "}
            <span className="text-red-500">Actually Is</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed">
            Upload your existing blood test. Get your biological age score, identify the exact markers driving it, and receive a personalized longevity protocol to lower it — starting today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation("/register")}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-full text-base transition-colors flex items-center justify-center gap-2"
            >
              Calculate My Biological Age Free
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLocation("/pricing")}
              className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-full text-base transition-colors"
            >
              View Plans
            </button>
          </div>
          <p className="mt-5 text-white/30 text-sm">No new blood tests required · Use your existing results · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-6 py-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/30">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          </div>
          <p className="text-white/20 text-xs text-center sm:text-right">
            © {new Date().getFullYear()} Human Upgrade OS. Not a medical service.
          </p>
        </div>
      </footer>
    </div>
  );
}
