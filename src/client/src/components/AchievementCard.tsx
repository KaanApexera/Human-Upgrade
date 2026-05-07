import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Share2, 
  Trophy, 
  Flame, 
  Star, 
  Target,
  Zap,
  Award,
  Crown,
  Download
} from "lucide-react";
import { SiInstagram, SiX, SiFacebook } from "react-icons/si";
import type { PrestigeLevel } from "@shared/schema";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

const RARITY_STYLES = {
  common: { bg: "from-gray-500 to-gray-700", glow: "rgba(107, 114, 128, 0.3)", label: "Common" },
  rare: { bg: "from-blue-500 to-blue-700", glow: "rgba(59, 130, 246, 0.4)", label: "Rare" },
  epic: { bg: "from-purple-500 to-purple-700", glow: "rgba(168, 85, 247, 0.4)", label: "Epic" },
  legendary: { bg: "from-amber-400 to-amber-600", glow: "rgba(251, 191, 36, 0.5)", label: "Legendary" },
};

interface AchievementCardProps {
  achievement: Achievement;
  onShare?: () => void;
  shareable?: boolean;
}

export function AchievementCard({ achievement, onShare, shareable = true }: AchievementCardProps) {
  const Icon = achievement.icon;
  const rarity = RARITY_STYLES[achievement.rarity];
  const isUnlocked = !!achievement.unlockedAt;
  
  return (
    <Card 
      className={`relative overflow-visible p-4 ${isUnlocked ? "glass-card" : "bg-white/5 opacity-60"}`}
      style={isUnlocked ? { boxShadow: `0 0 20px ${rarity.glow}` } : {}}
      data-testid={`achievement-card-${achievement.id}`}
    >
      <div className="flex items-start gap-3">
        <div 
          className={`p-3 rounded-xl bg-gradient-to-br ${rarity.bg}`}
          style={{ boxShadow: `0 0 12px ${rarity.glow}` }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{achievement.title}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r ${rarity.bg} text-white`}>
              {rarity.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
          
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${rarity.bg} transition-all`}
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {achievement.progress} / {achievement.maxProgress}
              </p>
            </div>
          )}
          
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Unlocked {achievement.unlockedAt.toLocaleDateString()}
            </p>
          )}
        </div>

        {shareable && isUnlocked && onShare && (
          <Button 
            size="icon" 
            variant="ghost"
            onClick={onShare}
            data-testid={`button-share-${achievement.id}`}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

interface ShareableAchievementProps {
  userName: string;
  achievement: Achievement;
  prestigeLevel: PrestigeLevel;
  performanceAge?: number;
}

export function ShareableAchievementPreview({ 
  userName, 
  achievement, 
  prestigeLevel,
  performanceAge 
}: ShareableAchievementProps) {
  const Icon = achievement.icon;
  const rarity = RARITY_STYLES[achievement.rarity];
  
  return (
    <div 
      className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-[#0A0612] to-[#1a1025] border border-white/20"
      style={{ boxShadow: `0 0 40px ${rarity.glow}` }}
      data-testid="shareable-achievement-preview"
    >
      <div className="absolute top-4 right-4 text-xs text-muted-foreground">
        humanupgrade.os
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div 
          className={`p-4 rounded-2xl bg-gradient-to-br ${rarity.bg} mb-4`}
          style={{ boxShadow: `0 0 20px ${rarity.glow}` }}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
        
        <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${rarity.bg} text-white mb-2`}>
          {rarity.label} Achievement
        </span>
        
        <h2 className="text-xl font-bold mb-1">{achievement.title}</h2>
        <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
        
        <div className="w-full h-px bg-white/10 mb-4" />
        
        <div className="flex items-center justify-center gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Optimizer</p>
            <p className="font-semibold">{userName}</p>
          </div>
          {performanceAge && (
            <>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-muted-foreground">Performance Age</p>
                <p className="font-semibold text-brand-red">{performanceAge}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ShareButtons({ onShare }: { onShare: (platform: string) => void }) {
  return (
    <div className="flex items-center gap-2" data-testid="share-buttons">
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onShare("instagram")}
        className="gap-2"
        data-testid="button-share-instagram"
      >
        <SiInstagram className="w-4 h-4" />
        Instagram
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onShare("x")}
        className="gap-2"
        data-testid="button-share-x"
      >
        <SiX className="w-4 h-4" />
        X
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onShare("facebook")}
        className="gap-2"
        data-testid="button-share-facebook"
      >
        <SiFacebook className="w-4 h-4" />
        Facebook
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => onShare("download")}
        className="gap-2"
        data-testid="button-share-download"
      >
        <Download className="w-4 h-4" />
        Save
      </Button>
    </div>
  );
}

export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  { id: "first_upload", title: "First Steps", description: "Upload your first bloodwork", icon: Target, rarity: "common", unlockedAt: new Date() },
  { id: "week_streak", title: "Consistency King", description: "Maintain a 7-day protocol streak", icon: Flame, rarity: "rare", unlockedAt: new Date() },
  { id: "optimized", title: "Fully Optimized", description: "Achieve optimal range in all biomarkers", icon: Star, rarity: "epic" },
  { id: "performance_drop", title: "Age Defier", description: "Reduce Performance Age by 5+ years", icon: Zap, rarity: "legendary" },
  { id: "apex_status", title: "Apex Predator", description: "Reach Apex prestige level", icon: Crown, rarity: "legendary" },
];
