import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PricingCard, PricingComparisonTable } from "@/components/PricingCard";
import { ArrowLeft, Tag, Check, X, Loader2, Zap } from "lucide-react";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const PRICING_PLANS = {
  basic: {
    name: "Free",
    price: 0,
    period: "month" as const,
    description: "Start optimizing your biology",
    variant: "basic" as const,
    priceId: "free",
    features: [
      { text: "1 lab upload per month", included: true },
      { text: "Biomarker extraction", included: true },
      { text: "Performance Age™ score", included: true },
      { text: "Basic protocol", included: true },
      { text: "Unlimited uploads", included: false },
      { text: "Peptide & GLP-1 protocols", included: false },
      { text: "AI meal plan", included: false },
      { text: "Wearable sync", included: false },
      { text: "Priority support", included: false },
    ],
  },
  premium_monthly: {
    name: "Pro",
    price: 29,
    period: "month" as const,
    description: "Full access to every feature",
    variant: "premium" as const,
    priceId: "premium_monthly",
    isPopular: true,
    features: [
      { text: "Unlimited lab uploads", included: true },
      { text: "Biomarker extraction", included: true },
      { text: "Performance Age™ score", included: true },
      { text: "Full protocol generation", included: true },
      { text: "Peptide & GLP-1 protocols", included: true },
      { text: "AI meal plan generator", included: true },
      { text: "Wearable sync (Oura, WHOOP)", included: true },
      { text: "Weekly upgrade report", included: true },
      { text: "Priority support", included: true },
    ],
  },
  premium_annual: {
    name: "Pro Annual",
    price: 199,
    period: "year" as const,
    description: "Save 43% — best value",
    variant: "annual" as const,
    priceId: "premium_annual",
    savingsPercent: 43,
    features: [
      { text: "Unlimited lab uploads", included: true },
      { text: "Biomarker extraction", included: true },
      { text: "Performance Age™ score", included: true },
      { text: "Full protocol generation", included: true },
      { text: "Peptide & GLP-1 protocols", included: true },
      { text: "AI meal plan generator", included: true },
      { text: "Wearable sync (Oura, WHOOP)", included: true },
      { text: "Weekly upgrade report", included: true },
      { text: "Priority support", included: true },
    ],
  },
};

interface PromoValidation {
  valid: boolean;
  couponId?: string;
  percentOff?: number;
  amountOff?: number;
  name?: string;
}

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const validatePromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/validate-promo", { code });
      return response.json() as Promise<PromoValidation>;
    },
    onSuccess: (data) => {
      if (data.valid) {
        setPromoValidation(data);
        setPromoError(null);
      } else {
        setPromoValidation(null);
        setPromoError("Invalid or expired promo code");
      }
    },
    onError: () => {
      setPromoValidation(null);
      setPromoError("Failed to validate promo code");
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await apiRequest("POST", "/api/subscribe", { 
        priceId,
        promoCode: promoValidation?.valid ? promoCode.trim().toUpperCase() : undefined
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleApplyPromo = () => {
    const code = promoCode.trim();
    if (!code) return;
    setPromoError(null);
    validatePromoMutation.mutate(code);
  };

  const handleClearPromo = () => {
    setPromoCode("");
    setPromoValidation(null);
    setPromoError(null);
  };

  const handleSelectPlan = (priceId: string) => {
    setSelectedPlan(priceId);
    if (!user) {
      const url = promoValidation?.valid 
        ? `/register?plan=${priceId}&promo=${promoCode.trim().toUpperCase()}`
        : `/register?plan=${priceId}`;
      setLocation(url);
      return;
    }
    subscribeMutation.mutate(priceId);
  };

  const getDiscountedPrice = (originalPrice: number) => {
    if (!promoValidation?.valid) return null;
    if (promoValidation.percentOff) {
      return originalPrice * (1 - promoValidation.percentOff / 100);
    }
    if (promoValidation.amountOff) {
      return Math.max(0, originalPrice - promoValidation.amountOff);
    }
    return null;
  };

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/dashboard" className="cursor-pointer" data-testid="link-logo-home">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/dashboard")}
                  data-testid="button-back-dashboard"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/login")}
                    data-testid="button-login"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setLocation("/register")}
                    className="bg-brand-red hover:bg-brand-red/90 rounded-full"
                    data-testid="button-register"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Upgrade Your Health
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your optimization journey. All plans include advanced biomarker analysis.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Have a promo code?</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={promoValidation?.valid}
                className="uppercase"
                data-testid="input-promo-code"
              />
              {promoValidation?.valid && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={handleClearPromo}
                  data-testid="button-clear-promo"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || validatePromoMutation.isPending || promoValidation?.valid}
              variant="outline"
              data-testid="button-apply-promo"
            >
              {validatePromoMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {promoError && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <X className="w-3 h-3" />
              {promoError}
            </p>
          )}
          {promoValidation?.valid && (
            <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" />
              {promoValidation.percentOff 
                ? `${promoValidation.percentOff}% discount applied!`
                : promoValidation.amountOff
                  ? `$${promoValidation.amountOff} discount applied!`
                  : "Discount applied!"}
            </p>
          )}
        </div>

        {/* Beta Access Banner */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="relative overflow-hidden rounded-2xl border-2 border-brand-red bg-brand-red/5 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full">
                      Limited — First 50 Users Only
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">Beta Access — $1/month</h3>
                  <p className="text-sm text-muted-foreground">Full Pro access at founder pricing. Lock in before public launch.</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Unlimited uploads", "Full protocol", "Wearable sync", "AI meal plan"].map(f => (
                    <span key={f} className="text-xs text-foreground/80 flex items-center gap-1">
                      <Check className="w-3 h-3 text-brand-red" /> {f}
                    </span>
                  ))}
                </div>
                <Button
                  onClick={() => handleSelectPlan("beta_monthly")}
                  disabled={subscribeMutation.isPending && selectedPlan === "beta_monthly"}
                  className="bg-brand-red hover:bg-brand-red/90 rounded-full px-8 mt-1"
                >
                  {subscribeMutation.isPending && selectedPlan === "beta_monthly" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Get Beta Access — $1"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            {...PRICING_PLANS.basic}
            onSelect={() => handleSelectPlan(PRICING_PLANS.basic.priceId)}
            isLoading={subscribeMutation.isPending && selectedPlan === PRICING_PLANS.basic.priceId}
            isCurrentPlan={user?.subscriptionPlan === "basic"}
            discountedPrice={getDiscountedPrice(PRICING_PLANS.basic.price)}
          />
          <PricingCard
            {...PRICING_PLANS.premium_monthly}
            onSelect={() => handleSelectPlan(PRICING_PLANS.premium_monthly.priceId)}
            isLoading={subscribeMutation.isPending && selectedPlan === PRICING_PLANS.premium_monthly.priceId}
            isCurrentPlan={user?.subscriptionPlan === "premium_monthly"}
            discountedPrice={getDiscountedPrice(PRICING_PLANS.premium_monthly.price)}
          />
          <PricingCard
            {...PRICING_PLANS.premium_annual}
            onSelect={() => handleSelectPlan(PRICING_PLANS.premium_annual.priceId)}
            isLoading={subscribeMutation.isPending && selectedPlan === PRICING_PLANS.premium_annual.priceId}
            isCurrentPlan={user?.subscriptionPlan === "premium_annual"}
            discountedPrice={getDiscountedPrice(PRICING_PLANS.premium_annual.price)}
          />
        </div>

        <PricingComparisonTable />

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Secure payments powered by Stripe. Your data is encrypted and never shared.
          </p>
        </div>
      </main>
    </div>
  );
}
