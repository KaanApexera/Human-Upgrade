import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Clock, Zap } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isPremium?: boolean;
  isLocked?: boolean;
  onUpgrade?: () => void;
  className?: string;
  headerAction?: ReactNode;
}

export function DashboardCard({
  title,
  icon,
  children,
  isPremium = false,
  isLocked = false,
  onUpgrade,
  className = "",
  headerAction,
}: DashboardCardProps) {
  const isPerformanceAge = title.includes("Performance Age");
  
  return (
    <Card
      className={`glass-card rounded-lg transition-all duration-300 hover:translate-y-[-2px] relative ${
        isPerformanceAge ? "glow-pulse-subtle luxury-border-gradient" : ""
      } ${className}`}
      data-testid={`card-${title.toLowerCase().replace(/[™\s]+/g, "-")}`}
    >
      {isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-brand-red/20 text-brand-red border-brand-red/30 text-xs">
            Premium
          </Badge>
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-brand-red">{icon}</span>}
          <CardTitle className="font-heading text-base font-semibold tracking-wide text-foreground">
            {title}
          </CardTitle>
        </div>
        {headerAction}
      </CardHeader>

      <CardContent className="relative">
        {isLocked ? (
          <div className="relative">
            <div className="premium-blur pointer-events-none select-none">
              {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-md">
              <Lock className="w-8 h-8 text-brand-red mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Premium Feature</p>
              <Button
                size="sm"
                onClick={onUpgrade}
                className="bg-brand-red hover:bg-brand-red/90 text-white rounded-full"
                data-testid="button-upgrade-card"
              >
                Upgrade to Unlock
              </Button>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  status?: "good" | "warning" | "critical" | "neutral";
}

export function MetricDisplay({ label, value, unit, trend, status = "neutral" }: MetricDisplayProps) {
  const statusColors = {
    good: "text-green-400",
    warning: "text-yellow-400",
    critical: "text-red-400",
    neutral: "text-foreground",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${statusColors[status]}`}>
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </span>
        {trend && (
          <TrendIcon
            className={`w-4 h-4 ${
              trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
            }`}
          />
        )}
      </div>
    </div>
  );
}

interface ProtocolItemProps {
  name: string;
  dosage: string;
  timing: string;
  frequency?: string;
  priority?: "high" | "medium" | "low";
}

export function ProtocolItem({ name, dosage, timing, frequency, priority = "medium" }: ProtocolItemProps) {
  const priorityColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="p-3 bg-background/50 rounded-md border border-border/30 mb-2 last:mb-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-foreground text-sm">{name}</h4>
        {priority && (
          <Badge variant="outline" className={`text-xs ${priorityColors[priority]}`}>
            {priority}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {dosage}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timing}
        </span>
        {frequency && <span>{frequency}</span>}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "optimal" | "good" | "needs-attention" | "critical";
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    optimal: { icon: CheckCircle2, color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Optimal" },
    good: { icon: CheckCircle2, color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Good" },
    "needs-attention": { icon: AlertTriangle, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", text: "Needs Attention" },
    critical: { icon: AlertTriangle, color: "bg-red-500/20 text-red-400 border-red-500/30", text: "Critical" },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} text-xs`}>
      <Icon className="w-3 h-3 mr-1" />
      {label || config.text}
    </Badge>
  );
}

interface PerformanceAgeDisplayProps {
  chronologicalAge: number;
  performanceAge: number;
}

export function PerformanceAgeDisplay({ chronologicalAge, performanceAge }: PerformanceAgeDisplayProps) {
  const difference = chronologicalAge - performanceAge;
  const isYounger = difference > 0;

  return (
    <div className="text-center py-4">
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 bg-brand-red opacity-20 blur-xl rounded-full" />
        <div className="relative">
          <div className="text-5xl font-heading font-bold text-brand-red">
            {performanceAge}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Performance Age</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Chronological: {chronologicalAge}</span>
        {difference !== 0 && (
          <Badge
            variant="outline"
            className={isYounger ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}
          >
            {isYounger ? `-${difference}` : `+${Math.abs(difference)}`} years
          </Badge>
        )}
      </div>
    </div>
  );
}

interface RiskItemDisplayProps {
  category: string;
  level: "low" | "moderate" | "high" | "critical";
  description: string;
  recommendation?: string;
}

export function RiskItemDisplay({ category, level, description, recommendation }: RiskItemDisplayProps) {
  const levelConfig = {
    low: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
    moderate: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
    critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  };

  const config = levelConfig[level];

  return (
    <div className={`p-3 rounded-md border ${config.bg} ${config.border} mb-2 last:mb-0`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-foreground">{category}</span>
        <Badge variant="outline" className={`text-xs ${config.color} border-current`}>
          {level.toUpperCase()}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {recommendation && (
        <p className="text-xs text-brand-red mt-2">
          <strong>Recommendation:</strong> {recommendation}
        </p>
      )}
    </div>
  );
}
