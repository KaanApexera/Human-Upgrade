import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, Star, Zap, Flame, Shield, Award, TrendingUp } from "lucide-react";
import type { PrestigeLevel } from "@shared/schema";

interface PrestigeLevelConfig {
  label: string;
  description: string;
  icon: typeof Crown;
  color: string;
  glowColor: string;
  minPoints: number;
  maxPoints: number;
}

const PRESTIGE_LEVELS: Record<PrestigeLevel, PrestigeLevelConfig> = {
  novus: {
    label: "Novus",
    description: "Beginning your optimization journey",
    icon: Shield,
    color: "from-gray-400 to-gray-600",
    glowColor: "rgba(156, 163, 175, 0.4)",
    minPoints: 0,
    maxPoints: 99,
  },
  initiate: {
    label: "Initiate",
    description: "Learning the fundamentals of optimization",
    icon: Star,
    color: "from-emerald-400 to-emerald-600",
    glowColor: "rgba(52, 211, 153, 0.4)",
    minPoints: 100,
    maxPoints: 499,
  },
  adept: {
    label: "Adept",
    description: "Mastering biomarker optimization",
    icon: Zap,
    color: "from-blue-400 to-blue-600",
    glowColor: "rgba(59, 130, 246, 0.4)",
    minPoints: 500,
    maxPoints: 1499,
  },
  elite: {
    label: "Elite",
    description: "Peak performance achieved",
    icon: Flame,
    color: "from-purple-400 to-purple-600",
    glowColor: "rgba(168, 85, 247, 0.4)",
    minPoints: 1500,
    maxPoints: 4999,
  },
  apex: {
    label: "Apex",
    description: "Legendary optimizer status",
    icon: Crown,
    color: "from-amber-400 to-amber-600",
    glowColor: "rgba(251, 191, 36, 0.4)",
    minPoints: 5000,
    maxPoints: Infinity,
  },
};

interface PrestigeBadgeProps {
  level?: PrestigeLevel;
  points?: number;
  showPoints?: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function PrestigeBadge({ 
  level = "novus", 
  points = 0, 
  showPoints = false,
  size = "md",
  showTooltip = true
}: PrestigeBadgeProps) {
  const config = PRESTIGE_LEVELS[level];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const badgeContent = (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${config.color} ${sizeClasses[size]} font-medium text-white`}
      style={{ boxShadow: `0 0 12px ${config.glowColor}` }}
      data-testid={`badge-prestige-${level}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      {showPoints && (
        <span className="opacity-75 text-xs">({points.toLocaleString()} pts)</span>
      )}
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.label} Level</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {points.toLocaleString()} / {config.maxPoints === Infinity ? "\u221E" : config.maxPoints.toLocaleString()} points
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

interface PrestigeProgressProps {
  level: PrestigeLevel;
  points: number;
  currentStreak?: number;
  longestStreak?: number;
}

export function PrestigeProgress({ level, points, currentStreak = 0, longestStreak = 0 }: PrestigeProgressProps) {
  const config = PRESTIGE_LEVELS[level];
  const nextLevel = getNextLevel(level);
  const nextConfig = nextLevel ? PRESTIGE_LEVELS[nextLevel] : null;
  
  const progressPercent = nextConfig 
    ? ((points - config.minPoints) / (nextConfig.minPoints - config.minPoints)) * 100
    : 100;

  return (
    <div className="glass-card p-4 rounded-xl" data-testid="prestige-progress">
      <div className="flex items-center justify-between mb-3">
        <PrestigeBadge level={level} points={points} showPoints showTooltip={false} />
        {nextLevel && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Next:</span>
            <PrestigeBadge level={nextLevel} size="sm" showTooltip={false} />
          </div>
        )}
      </div>
      
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <div>
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <p className="font-semibold">{currentStreak} days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <div>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
            <p className="font-semibold">{longestStreak} days</p>
          </div>
        </div>
      </div>

      {nextLevel && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {nextConfig!.minPoints - points} points to {nextConfig!.label}
        </p>
      )}
    </div>
  );
}

function getNextLevel(current: PrestigeLevel): PrestigeLevel | null {
  const levels: PrestigeLevel[] = ["novus", "initiate", "adept", "elite", "apex"];
  const index = levels.indexOf(current);
  return index < levels.length - 1 ? levels[index + 1] : null;
}

export function calculatePrestigeLevel(points: number): PrestigeLevel {
  if (points >= 5000) return "apex";
  if (points >= 1500) return "elite";
  if (points >= 500) return "adept";
  if (points >= 100) return "initiate";
  return "novus";
}
