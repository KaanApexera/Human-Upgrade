import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap } from "lucide-react";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: number;
  period: "month" | "year";
  description: string;
  features: PricingFeature[];
  variant: "basic" | "premium" | "annual";
  isPopular?: boolean;
  savingsPercent?: number;
  onSelect: () => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
  discountedPrice?: number | null;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  variant,
  isPopular = false,
  savingsPercent,
  onSelect,
  isLoading = false,
  isCurrentPlan = false,
  discountedPrice,
}: PricingCardProps) {
  const variantStyles = {
    basic: {
      border: "border-border hover:border-muted-foreground/50",
      button: "bg-secondary hover:bg-secondary/80 text-foreground",
      glow: "",
      icon: Zap,
      accent: "text-muted-foreground",
    },
    premium: {
      border: "border-brand-red/50 hover:border-brand-red",
      button: "bg-brand-red hover:bg-brand-red/90",
      glow: "shadow-glow-red",
      icon: Crown,
      accent: "text-brand-red",
    },
    annual: {
      border: "border-brand-red/30 hover:border-brand-red/50",
      button: "bg-brand-red hover:bg-brand-red/90",
      glow: "",
      icon: Sparkles,
      accent: "text-brand-red",
    },
  };

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <Card
      className={`
        relative bg-card rounded-lg transition-all duration-300
        ${styles.border} ${isPopular ? styles.glow : ""}
        hover:translate-y-[-4px] hover:shadow-card-hover
      `}
      data-testid={`card-pricing-${variant}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-brand-red text-white border-0 px-4 py-1 text-xs font-semibold">
            Most Popular
          </Badge>
        </div>
      )}

      {savingsPercent && (
        <div className="absolute -top-3 right-4 z-10">
          <Badge className="bg-green-600 text-white border-0 px-3 py-1 text-xs font-semibold">
            Save {savingsPercent}%
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pt-8 pb-4">
        <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center ${styles.accent}`}>
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="font-heading text-xl font-bold">{name}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm mt-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center pb-4">
        <div className="mb-6">
          {discountedPrice != null ? (
            <>
              <span className="text-2xl font-heading text-muted-foreground line-through mr-2">${price}</span>
              <span className="text-4xl font-heading font-bold text-green-500">
                ${Number.isInteger(discountedPrice) ? discountedPrice : discountedPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-4xl font-heading font-bold text-foreground">${price}</span>
          )}
          <span className="text-muted-foreground text-sm">/{period}</span>
          {period === "year" && (
            <div className="text-xs text-muted-foreground mt-1">
              (${Math.round(price / 12)}/month)
            </div>
          )}
        </div>

        <ul className="space-y-3 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  feature.included ? "text-green-400" : "text-muted-foreground/30"
                }`}
              />
              <span
                className={`text-sm ${
                  feature.included ? "text-foreground" : "text-muted-foreground/50 line-through"
                }`}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4 pb-6">
        <Button
          onClick={onSelect}
          disabled={isLoading || isCurrentPlan}
          className={`w-full rounded-full font-semibold ${styles.button} text-white`}
          data-testid={`button-select-${variant}`}
        >
          {isCurrentPlan ? "Current Plan" : isLoading ? "Processing..." : "Get Started"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingComparisonTable() {
  const features = [
    { name: "PDF Uploads", basic: "1/month", premium: "Unlimited", annual: "Unlimited" },
    { name: "Protocol Generation", basic: "Basic", premium: "Full", annual: "Full + Priority" },
    { name: "Performance Age", basic: true, premium: true, annual: true },
    { name: "Hormone Analysis", basic: "Basic", premium: "Advanced", annual: "Advanced" },
    { name: "Peptide Optimization", basic: false, premium: true, annual: true },
    { name: "Workout & Meal Plans", basic: false, premium: true, annual: true },
    { name: "Supplement Protocol", basic: false, premium: true, annual: true },
    { name: "PDF Export", basic: false, premium: true, annual: true },
    { name: "Biomarker Tracking", basic: false, premium: true, annual: true },
    { name: "Priority Support", basic: false, premium: true, annual: true },
    { name: "Early Access Features", basic: false, premium: false, annual: true },
    { name: "Genetic Protocol Beta", basic: false, premium: false, annual: true },
  ];

  return (
    <div className="mt-16 overflow-x-auto" data-testid="pricing-comparison-table">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 text-foreground font-heading font-semibold border-b border-border">
              Features
            </th>
            <th className="text-center p-4 text-muted-foreground font-heading font-semibold border-b border-border">
              Basic
            </th>
            <th className="text-center p-4 text-brand-red font-heading font-semibold border-b border-border">
              Premium
            </th>
            <th className="text-center p-4 text-brand-red font-heading font-semibold border-b border-border">
              Annual
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
              <td className="p-4 text-sm text-foreground">{feature.name}</td>
              <td className="p-4 text-center">
                <FeatureValue value={feature.basic} />
              </td>
              <td className="p-4 text-center">
                <FeatureValue value={feature.premium} />
              </td>
              <td className="p-4 text-center">
                <FeatureValue value={feature.annual} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-green-400 mx-auto" />
    ) : (
      <span className="text-muted-foreground/30">—</span>
    );
  }
  return <span className="text-sm text-muted-foreground">{value}</span>;
}
