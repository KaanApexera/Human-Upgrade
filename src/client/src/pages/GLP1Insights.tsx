import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Syringe, FlaskConical, ChevronRight, ShieldCheck, AlertTriangle, Sparkles, TrendingDown, Brain, Heart, Zap, Star } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@shared/schema";

const GLP1_DRUGS = [
  {
    name: "Semaglutide",
    brand: "Ozempic / Wegovy",
    mechanism: "GLP-1 receptor agonist — reduces appetite, slows gastric emptying, improves insulin sensitivity",
    weightLoss: "15–20%",
    hba1cReduction: "1.5–2.0%",
    frequency: "Once weekly injection",
    bestFor: ["Type 2 diabetes + obesity", "High cardiovascular risk", "HbA1c > 7.5%", "BMI > 30"],
    sideEffects: ["Nausea (common, transient)", "Vomiting", "Constipation", "Rare: pancreatitis"],
    peptideStack: ["BPC-157 (gut protection)", "GHK-Cu (anti-inflammatory)", "MOTS-C (metabolic boost)"],
    color: "from-blue-500/20 to-blue-600/10",
    accent: "#3B82F6",
    badge: "Most Prescribed",
  },
  {
    name: "Tirzepatide",
    brand: "Mounjaro / Zepbound",
    mechanism: "Dual GIP + GLP-1 receptor agonist — superior appetite suppression, enhanced insulin secretion, more metabolic targets",
    weightLoss: "20–26%",
    hba1cReduction: "2.0–2.5%",
    frequency: "Once weekly injection",
    bestFor: ["Maximum weight loss goal", "Insulin resistance", "HbA1c > 8.0%", "BMI > 35", "Metabolic syndrome"],
    sideEffects: ["Nausea (common)", "Diarrhea", "Decreased appetite", "Rare: gallbladder issues"],
    peptideStack: ["BPC-157 (GI protection)", "Ipamorelin (GH optimization)", "Epithalon (metabolic longevity)", "MOTS-C (insulin sensitivity)"],
    color: "from-red-500/20 to-orange-600/10",
    accent: "#EF4444",
    badge: "Best Results",
  },
  {
    name: "Liraglutide",
    brand: "Saxenda / Victoza",
    mechanism: "GLP-1 receptor agonist — daily dosing, established cardiovascular safety profile, proven in multiple populations",
    weightLoss: "8–12%",
    hba1cReduction: "1.0–1.5%",
    frequency: "Daily injection",
    bestFor: ["First-line GLP-1 therapy", "Established CV safety needed", "HbA1c 7.0–8.0%", "Moderate weight loss"],
    sideEffects: ["Nausea", "Headache", "Dizziness", "Injection site reactions"],
    peptideStack: ["BPC-157 (GI protection)", "Selank (appetite mood balance)", "TB-500 (metabolic support)"],
    color: "from-purple-500/20 to-purple-600/10",
    accent: "#A855F7",
    badge: "Most Studied",
  },
];

const PEPTIDE_SYNERGY_STACKS = [
  {
    name: "Metabolic Reset Stack",
    tier: "Premium",
    description: "Designed to enhance GLP-1 therapy outcomes by targeting insulin sensitivity, gut health, and mitochondrial function simultaneously.",
    peptides: [
      { name: "BPC-157", dose: "250–500 mcg/day", purpose: "GI protection & gut mucosal healing during GLP-1 therapy" },
      { name: "MOTS-C", dose: "5–10 mg/week", purpose: "Mitochondrial activation, insulin sensitizer, exercise mimetic" },
      { name: "Ipamorelin", dose: "200–300 mcg/night", purpose: "Growth hormone pulse for lean mass preservation during caloric deficit" },
    ],
    bestWith: ["Semaglutide", "Tirzepatide"],
    icon: TrendingDown,
    accentColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    name: "Longevity + GLP-1 Protocol",
    tier: "Elite",
    description: "Combines GLP-1 weight loss efficacy with cellular longevity peptides for anti-aging benefit beyond metabolic correction.",
    peptides: [
      { name: "Epithalon", dose: "5–10 mg/cycle", purpose: "Telomere support & cellular longevity during metabolic reset" },
      { name: "GHK-Cu", dose: "1–2 mg/day", purpose: "Anti-inflammatory, collagen synthesis, skin elasticity during weight loss" },
      { name: "MOTS-C", dose: "5 mg/week", purpose: "NAD+ pathway activation, metabolic flexibility" },
      { name: "BPC-157", dose: "250 mcg/day", purpose: "Full GI tract protection & systemic healing" },
    ],
    bestWith: ["Tirzepatide"],
    icon: Sparkles,
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/30",
  },
  {
    name: "Neuro-Metabolic Stack",
    tier: "Premium",
    description: "Targets the gut-brain axis — enhancing GLP-1's neurological appetite suppression while reducing anxiety from caloric restriction.",
    peptides: [
      { name: "Selank", dose: "250 mcg/day", purpose: "Anxiety reduction, appetite regulation via gut-brain axis" },
      { name: "Semax", dose: "300 mcg/day", purpose: "Cognitive clarity during caloric restriction & metabolic change" },
      { name: "BPC-157", dose: "250 mcg/day", purpose: "GI + neuro protective, serotonin pathway support" },
    ],
    bestWith: ["Semaglutide", "Liraglutide"],
    icon: Brain,
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30",
  },
];

const BIOMARKER_SIGNALS = [
  { marker: "HbA1c > 7.5%", recommendation: "Strong candidate for GLP-1 therapy", icon: "🩸" },
  { marker: "Fasting glucose > 126 mg/dL", recommendation: "Consider Tirzepatide — dual GIP/GLP-1", icon: "📊" },
  { marker: "BMI > 30", recommendation: "Wegovy / Zepbound approved indication", icon: "⚖️" },
  { marker: "Triglycerides > 200 mg/dL", recommendation: "GLP-1 + MOTS-C stack recommended", icon: "💧" },
  { marker: "Insulin resistance (HOMA-IR > 2.5)", recommendation: "Tirzepatide superior for IR correction", icon: "🔬" },
  { marker: "hsCRP > 3 mg/L (inflammation)", recommendation: "Add GHK-Cu + BPC-157 to protocol", icon: "🔥" },
];

export default function GLP1Insights() {
  const { data: user } = useQuery<User>({ queryKey: ["/api/user"] });
  const isPremium = user?.subscriptionPlan === "basic" || user?.subscriptionPlan === "premium_monthly" || user?.subscriptionPlan === "premium_annual";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-background to-orange-950/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-600/10 border border-red-500/20">
              <Syringe className="h-5 w-5 text-red-400" />
            </div>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-semibold tracking-wider uppercase">
              Premium Intelligence
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            GLP-1 & Peptide Insights
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Evidence-based GLP-1 medication comparison with personalized peptide synergy stacks.
            Optimized for your biomarker profile.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/80 max-w-2xl">
            <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
            <p>
              <strong className="text-amber-300">Not medical advice.</strong> GLP-1 medications and peptide protocols require a prescription and medical supervision. This content is for informational purposes only. Always consult a licensed healthcare provider before starting any medication or protocol.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-10 max-w-6xl mx-auto">

        {/* Biomarker Signal Panel */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="h-4 w-4 text-red-400" />
            <h2 className="text-lg font-semibold">Biomarker Candidacy Signals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BIOMARKER_SIGNALS.map((signal) => (
              <div
                key={signal.marker}
                className="flex gap-3 p-4 rounded-xl border border-border/60 bg-card/50 hover:border-red-500/30 transition-colors"
              >
                <span className="text-xl flex-shrink-0">{signal.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{signal.marker}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{signal.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" />
            Upload a blood panel PDF to get personalized candidacy scoring against your actual values.
          </p>
        </section>

        {/* GLP-1 Drug Comparison */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Syringe className="h-4 w-4 text-red-400" />
            <h2 className="text-lg font-semibold">GLP-1 Medication Comparison</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {GLP1_DRUGS.map((drug, i) => (
              <motion.div
                key={drug.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <Card className={`h-full border-border/60 bg-gradient-to-b ${drug.color} backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all hover:border-opacity-50`}
                  style={{ "--tw-border-opacity": "0.4" } as React.CSSProperties}>
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${drug.accent}, transparent)` }} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge className="text-xs mb-2" style={{ backgroundColor: `${drug.accent}20`, color: drug.accent, borderColor: `${drug.accent}40` }}>
                          {drug.badge}
                        </Badge>
                        <CardTitle className="text-lg">{drug.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{drug.brand}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3">
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: drug.accent }}>{drug.weightLoss}</p>
                        <p className="text-xs text-muted-foreground">Weight Loss</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: drug.accent }}>{drug.hba1cReduction}</p>
                        <p className="text-xs text-muted-foreground">HbA1c ↓</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="text-xs text-muted-foreground leading-relaxed">{drug.mechanism}</p>

                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <Zap className="h-3 w-3" style={{ color: drug.accent }} /> Best For
                      </p>
                      <ul className="space-y-1">
                        {drug.bestFor.map(item => (
                          <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: drug.accent }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <FlaskConical className="h-3 w-3 text-emerald-400" /> Recommended Peptide Stack
                      </p>
                      <ul className="space-y-1">
                        {drug.peptideStack.map(p => (
                          <li key={p} className="text-xs text-emerald-400/80 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-400" /> Side Effects
                      </p>
                      <ul className="space-y-1">
                        {drug.sideEffects.map(s => (
                          <li key={s} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-amber-500/60 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-muted-foreground/60 border-t border-border/40 pt-2">
                      📅 {drug.frequency}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Peptide Synergy Stacks — Premium Locked */}
        <section className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="text-lg font-semibold">Peptide Synergy Protocols</h2>
            {!isPremium && (
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs ml-2">
                Premium
              </Badge>
            )}
          </div>

          <div className={`space-y-4 ${!isPremium ? "pointer-events-none" : ""}`}>
            {PEPTIDE_SYNERGY_STACKS.map((stack, i) => {
              const Icon = stack.icon;
              return (
                <motion.div
                  key={stack.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl border ${stack.borderColor} bg-card/60 overflow-hidden ${!isPremium && i > 0 ? "blur-sm" : ""}`}
                >
                  {i > 0 && !isPremium && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl">
                      <Lock className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-white/5 ${stack.accentColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base">{stack.name}</h3>
                          <Badge className="text-xs bg-white/5 text-muted-foreground border-white/10">
                            {stack.tier}
                          </Badge>
                          <div className="flex gap-1 flex-wrap">
                            {stack.bestWith.map(drug => (
                              <Badge key={drug} className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                + {drug}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{stack.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stack.peptides.map(p => (
                        <div key={p.name} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-medium ${stack.accentColor}`}>{p.name}</p>
                            <span className="text-xs text-muted-foreground/60">{p.dose}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">{p.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {!isPremium && (
            <div className="mt-4 p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 to-orange-950/20 text-center">
              <Star className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground mb-1">Unlock All Peptide Stacks</p>
              <p className="text-xs text-muted-foreground mb-4">
                Get the full Longevity + Elite protocols and personalized stack recommendations based on your biomarkers.
              </p>
              <Link href="/pricing">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Medical Disclaimer + Doctor CTA */}
        <section className="rounded-2xl border border-border/40 bg-card/40 p-6">
          <div className="flex gap-4 items-start">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/20 flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">Medical Guidance Required</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                GLP-1 medications and peptide protocols require physician supervision. This analysis is educational —
                candidacy, dosing, and safety monitoring must be evaluated by a licensed healthcare provider familiar
                with your full medical history.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-950/30"
                  onClick={() => window.open("https://www.zocdoc.com/", "_blank")}
                >
                  <Heart className="h-3.5 w-3.5 mr-1.5" />
                  Find a Longevity Doctor
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                  Learn More About GLP-1s
                </Button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
