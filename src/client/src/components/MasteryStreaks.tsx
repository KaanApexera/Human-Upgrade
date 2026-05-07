import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Flame, 
  CheckCircle, 
  Circle, 
  Trophy, 
  Calendar,
  Zap,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface StreakCategory {
  id: string;
  name: string;
  icon: typeof Flame;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  color: string;
}

interface MasteryStreaksProps {
  categories?: StreakCategory[];
  onCheckIn?: (categoryId: string) => void;
}

const DEFAULT_CATEGORIES: StreakCategory[] = [
  {
    id: "supplements",
    name: "Supplements",
    icon: Sparkles,
    currentStreak: 12,
    longestStreak: 28,
    completedToday: true,
    color: "text-emerald-400",
  },
  {
    id: "morning_routine",
    name: "Morning Routine",
    icon: Zap,
    currentStreak: 7,
    longestStreak: 14,
    completedToday: true,
    color: "text-amber-400",
  },
  {
    id: "workout",
    name: "Workout",
    icon: TrendingUp,
    currentStreak: 5,
    longestStreak: 21,
    completedToday: false,
    color: "text-blue-400",
  },
  {
    id: "sleep",
    name: "Sleep Protocol",
    icon: Calendar,
    currentStreak: 18,
    longestStreak: 45,
    completedToday: true,
    color: "text-purple-400",
  },
];

export function MasteryStreaks({ 
  categories = DEFAULT_CATEGORIES, 
  onCheckIn 
}: MasteryStreaksProps) {
  const totalStreak = categories.reduce((sum, cat) => sum + cat.currentStreak, 0);
  const completedToday = categories.filter(c => c.completedToday).length;
  
  return (
    <Card className="glass-card border-white/10" data-testid="card-mastery-streaks">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <CardTitle className="text-lg">Mastery Streaks</CardTitle>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{totalStreak} total days</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <Progress value={(completedToday / categories.length) * 100} className="h-2" />
          </div>
          <span className="text-sm text-muted-foreground">
            {completedToday}/{categories.length} today
          </span>
        </div>

        {categories.map((category) => (
          <StreakItem 
            key={category.id} 
            category={category} 
            onCheckIn={onCheckIn ? () => onCheckIn(category.id) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface StreakItemProps {
  category: StreakCategory;
  onCheckIn?: () => void;
}

function StreakItem({ category, onCheckIn }: StreakItemProps) {
  const Icon = category.icon;
  const [isHovered, setIsHovered] = useState(false);
  
  const streakIntensity = Math.min(category.currentStreak / 30, 1);
  
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`streak-item-${category.id}`}
    >
      <div className={`p-2 rounded-full bg-white/5 ${category.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{category.name}</span>
          {category.currentStreak >= 7 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-amber-400">
              {category.currentStreak >= 30 ? "Legendary" : category.currentStreak >= 14 ? "Hot" : "Rising"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flame className={`w-3 h-3 ${category.currentStreak > 0 ? "text-orange-400" : ""}`} />
          <span>{category.currentStreak} day streak</span>
          <span className="opacity-50">|</span>
          <span>Best: {category.longestStreak}</span>
        </div>
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          {category.completedToday ? (
            <div className="p-1.5 rounded-full bg-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
          ) : onCheckIn ? (
            <Button 
              size="icon" 
              variant="ghost"
              onClick={onCheckIn}
              className="w-8 h-8"
              data-testid={`button-checkin-${category.id}`}
            >
              <Circle className="w-4 h-4 text-muted-foreground" />
            </Button>
          ) : (
            <div className="p-1.5 rounded-full bg-white/5">
              <Circle className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {category.completedToday ? "Completed today" : "Not completed yet"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

interface WeeklyStreakCalendarProps {
  weekData?: boolean[];
}

export function WeeklyStreakCalendar({ weekData = [true, true, true, true, true, false, false] }: WeeklyStreakCalendarProps) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  
  return (
    <div className="flex items-center gap-1" data-testid="weekly-streak-calendar">
      {days.map((day, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <div 
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-all ${
                weekData[index] 
                  ? "bg-emerald-500/30 text-emerald-400 border border-emerald-500/50" 
                  : "bg-white/5 text-muted-foreground border border-white/10"
              }`}
            >
              {day}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {weekData[index] ? "Completed" : "Missed"}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export function StreakMilestoneCard({ streak, milestone }: { streak: number; milestone: number }) {
  const progress = (streak / milestone) * 100;
  const isAchieved = streak >= milestone;
  
  return (
    <div 
      className={`p-3 rounded-lg border ${isAchieved ? "border-amber-500/50 bg-amber-500/10" : "border-white/10 bg-white/5"}`}
      data-testid={`milestone-${milestone}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className={`w-4 h-4 ${isAchieved ? "text-amber-400" : "text-muted-foreground"}`} />
          <span className="font-medium text-sm">{milestone}-Day Milestone</span>
        </div>
        {isAchieved && (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        )}
      </div>
      <Progress value={Math.min(progress, 100)} className="h-1.5" />
      <p className="text-xs text-muted-foreground mt-1">
        {isAchieved ? "Achieved" : `${milestone - streak} days remaining`}
      </p>
    </div>
  );
}
