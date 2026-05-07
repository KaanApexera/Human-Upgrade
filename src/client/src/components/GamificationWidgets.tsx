import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Flame,
  TrendingUp,
  Award,
  Moon,
  Dumbbell,
  Utensils,
  ChevronRight,
  Trophy,
  Zap,
  Users,
  Star,
} from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface DailyScore {
  id: string;
  userId: string;
  date: string;
  score: number;
  drivers: Array<{
    name: string;
    impact: "positive" | "negative" | "neutral";
    value: number;
    description: string;
  }>;
  sleepComponent: number;
  activityComponent: number;
  recoveryComponent: number;
  habitsComponent: number;
  dataSource: string;
}

interface DailyProtocol {
  id: string;
  userId: string;
  date: string;
  items: Array<{
    id: string;
    type: "sleep" | "training" | "nutrition";
    text: string;
    completed: boolean;
  }>;
  completed: boolean[];
}

interface UserProgress {
  id: string;
  userId: string;
  level: string;
  points: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
}

interface BenchmarkData {
  cohort: {
    cohortKey: string;
    ageRange: string;
    gender: string;
    activityLevel: string;
    sampleSize: number;
    metrics: {
      avgScore: number;
      avgSleepHours: number;
      avgHrv: number;
      avgSteps: number;
      avgProtocolCompletion: number;
    };
  };
  userScore: number;
  userLevel: string;
  percentile: number;
}

interface WeeklyReport {
  id: string;
  userId: string;
  weekStartDate: string;
  content: {
    summary: string;
    highlights: string[];
    improvements: string[];
    recommendations: string[];
  };
  scoreTrend: {
    values: number[];
    average: number;
    change: number;
  };
  habitsConsistency: number;
  viewedAt: string | null;
}

const levelColors: Record<string, string> = {
  novus: "bg-zinc-500",
  initiate: "bg-blue-500",
  adept: "bg-purple-500",
  elite: "bg-amber-500",
  apex: "bg-brand-red",
};

const levelLabels: Record<string, string> = {
  novus: "Novus",
  initiate: "Initiate",
  adept: "Adept",
  elite: "Elite",
  apex: "Apex",
};

export function DailyScoreWidget() {
  const { t } = useTranslation();
  
  const { data: score, isLoading } = useQuery<DailyScore>({
    queryKey: ["/api/gamification/daily-score"],
  });

  const { data: scoreHistory } = useQuery<DailyScore[]>({
    queryKey: ["/api/gamification/score-history"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreValue = score?.score || 0;
  const scoreColor = scoreValue >= 80 ? "text-green-500" : scoreValue >= 60 ? "text-amber-500" : "text-red-500";
  
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (scoreValue / 100) * circumference;

  return (
    <Card data-testid="card-daily-score">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-red" />
            Daily Upgrade Score
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {score?.dataSource === "wearable" ? "Wearable Data" : "Check-in"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={scoreColor}
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-heading text-3xl font-bold ${scoreColor}`}>{scoreValue}</span>
              <span className="text-xs text-muted-foreground">of 100</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-muted-foreground mb-2">Score Breakdown</div>
            <div className="space-y-1.5">
              <ScoreBar label="Sleep" value={score?.sleepComponent || 0} max={25} icon={<Moon className="w-3 h-3" />} />
              <ScoreBar label="Activity" value={score?.activityComponent || 0} max={25} icon={<Dumbbell className="w-3 h-3" />} />
              <ScoreBar label="Recovery" value={score?.recoveryComponent || 0} max={25} icon={<TrendingUp className="w-3 h-3" />} />
              <ScoreBar label="Habits" value={score?.habitsComponent || 0} max={25} icon={<Star className="w-3 h-3" />} />
            </div>
          </div>
        </div>

        {scoreHistory && scoreHistory.length > 1 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Last 7 Days</div>
            <div className="flex items-end gap-1 h-12">
              {scoreHistory.slice(0, 7).reverse().map((day, i) => {
                const height = (day.score / 100) * 100;
                const color = day.score >= 80 ? "bg-green-500" : day.score >= 60 ? "bg-amber-500" : "bg-red-500/70";
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${color}`}
                    style={{ height: `${height}%` }}
                    title={`${day.score}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, value, max, icon }: { label: string; value: number; max: number; icon: JSX.Element }) {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-16 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-red rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium">{value}</span>
    </div>
  );
}

export function TodaysProtocolWidget() {
  const { data: protocol, isLoading } = useQuery<DailyProtocol>({
    queryKey: ["/api/gamification/daily-protocol"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean[] }) => {
      return apiRequest("PATCH", `/api/gamification/daily-protocol/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/progress"] });
    },
  });

  const handleToggle = (index: number) => {
    if (!protocol) return;
    const newCompleted = [...(protocol.completed as boolean[])];
    newCompleted[index] = !newCompleted[index];
    updateMutation.mutate({ id: protocol.id, completed: newCompleted });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = protocol?.items || [];
  const completed = protocol?.completed as boolean[] || [false, false, false];
  const completedCount = completed.filter(Boolean).length;

  const iconMap: Record<string, JSX.Element> = {
    sleep: <Moon className="w-4 h-4 text-indigo-400" />,
    training: <Dumbbell className="w-4 h-4 text-green-400" />,
    nutrition: <Utensils className="w-4 h-4 text-amber-400" />,
  };

  return (
    <Card data-testid="card-daily-protocol">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-brand-red" />
            Today's Protocol
          </CardTitle>
          <Badge variant={completedCount === 3 ? "default" : "secondary"} className="text-xs">
            {completedCount}/3 Complete
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Complete all 3 to earn 50 XP and maintain your streak
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item: any, index: number) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                completed[index] ? "bg-green-500/10 border-green-500/30" : "bg-card border-border hover-elevate"
              }`}
              data-testid={`protocol-item-${item.type}`}
            >
              <Checkbox
                checked={completed[index]}
                onCheckedChange={() => handleToggle(index)}
                className="mt-0.5"
                disabled={updateMutation.isPending}
                data-testid={`checkbox-${item.type}`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {iconMap[item.type]}
                  <span className={`text-sm font-medium ${completed[index] ? "line-through text-muted-foreground" : ""}`}>
                    {item.text}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakLevelWidget() {
  const { data: progress, isLoading } = useQuery<UserProgress>({
    queryKey: ["/api/gamification/progress"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const level = progress?.level || "novus";
  const points = progress?.points || 0;
  const streak = progress?.currentStreak || 0;
  const longestStreak = progress?.longestStreak || 0;

  const levelThresholds: Record<string, number> = {
    novus: 0,
    initiate: 250,
    adept: 1000,
    elite: 2500,
    apex: 5000,
  };

  const nextLevel = level === "apex" ? "apex" : 
    level === "elite" ? "apex" :
    level === "adept" ? "elite" :
    level === "initiate" ? "adept" : "initiate";
  
  const currentThreshold = levelThresholds[level];
  const nextThreshold = levelThresholds[nextLevel];
  const progressToNext = level === "apex" ? 100 : 
    ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return (
    <Card data-testid="card-streak-level">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${levelColors[level]} flex items-center justify-center`}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Level</div>
              <div className="font-heading text-lg font-bold">{levelLabels[level]}</div>
              <div className="text-xs text-muted-foreground">{points.toLocaleString()} XP</div>
            </div>
          </div>
          
          <div className="h-12 w-px bg-border" />
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
              <div className="font-heading text-lg font-bold">{streak} days</div>
              <div className="text-xs text-muted-foreground">Best: {longestStreak}</div>
            </div>
          </div>
        </div>

        {level !== "apex" && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress to {levelLabels[nextLevel]}</span>
              <span>{Math.round(progressToNext)}%</span>
            </div>
            <Progress value={progressToNext} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BenchmarkWidget() {
  const { data: benchmark, isLoading } = useQuery<BenchmarkData>({
    queryKey: ["/api/gamification/benchmark"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const percentile = benchmark?.percentile || 50;
  const cohortSize = benchmark?.cohort?.sampleSize || 0;
  const avgScore = benchmark?.cohort?.metrics?.avgScore || 0;
  const userScore = benchmark?.userScore || 0;

  const percentileLabel = percentile >= 90 ? "Top 10%" :
    percentile >= 75 ? "Top 25%" :
    percentile >= 50 ? "Above Average" : "Building Momentum";

  return (
    <Card data-testid="card-benchmark">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-red" />
          Your Ranking
        </CardTitle>
        <CardDescription className="text-xs">
          Anonymous benchmarking against similar users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-heading font-bold text-brand-red">
              {percentileLabel}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Your score: {userScore} vs. Avg: {avgScore}
            </div>
          </div>
          
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted/20"
              />
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 25}
                strokeDashoffset={(2 * Math.PI * 25) * (1 - percentile / 100)}
                className="text-brand-red"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-lg font-bold">{percentile}%</span>
            </div>
          </div>
        </div>
        
        {cohortSize > 10 && (
          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            Compared to {cohortSize.toLocaleString()} users in your demographic
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WeeklyReportPreview() {
  const [, setLocation] = useLocation();
  
  const { data: report, isLoading } = useQuery<WeeklyReport | null>({
    queryKey: ["/api/gamification/weekly-report"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card data-testid="card-weekly-report-empty">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-red" />
            Weekly Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Your first weekly report will be available after 7 days of tracking.
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUnread = !report.viewedAt;
  const change = report.scoreTrend?.change || 0;
  const changeLabel = change > 0 ? `+${change}%` : `${change}%`;
  const changeColor = change >= 0 ? "text-green-500" : "text-red-500";

  return (
    <Card data-testid="card-weekly-report" className={isUnread ? "ring-2 ring-brand-red/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-red" />
            Weekly Report
          </CardTitle>
          {isUnread && (
            <Badge variant="default" className="bg-brand-red text-xs">
              New
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{report.content?.summary?.slice(0, 60)}...</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>Avg Score: {report.scoreTrend?.average || 0}</span>
              <span className={changeColor}>{changeLabel}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/weekly-report")}
            data-testid="button-view-report"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
