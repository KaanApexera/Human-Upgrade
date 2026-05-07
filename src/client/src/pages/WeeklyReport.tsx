import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Moon, Footprints, Heart, Zap, Calendar, Trophy, Target, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyReportData {
  id: string;
  userId: string;
  weekStartDate: string;
  content: {
    averageScore?: number;
    scoreChange?: number;
    totalXpEarned?: number;
    protocolsCompleted?: number;
    streakDays?: number;
    topCategory?: string;
    improvementArea?: string;
    weeklyGoals?: { goal: string; completed: boolean }[];
    summary?: string;
  };
  scoreTrend?: { date: string; score: number }[];
  sleepTrend?: { date: string; hours: number }[];
  hrvTrend?: { date: string; hrv: number }[];
  habitsConsistency?: number;
  keyWins?: string[];
  nextWeekFocus?: string[];
  viewedAt?: string;
  createdAt?: string;
}

function WeeklyReportSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 h-16">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </main>
    </div>
  );
}

export default function WeeklyReport() {
  const [, params] = useRoute("/reports/:id");
  const reportId = params?.id;

  const { data: report, isLoading, error } = useQuery<WeeklyReportData>({
    queryKey: ["/api/weekly-reports", reportId],
    enabled: !!reportId,
  });

  if (isLoading) {
    return <WeeklyReportSkeleton />;
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Report not found or failed to load.</p>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = report.content || {};
  const weekStart = new Date(report.weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "sleep": return <Moon className="w-5 h-5" />;
      case "activity": return <Footprints className="w-5 h-5" />;
      case "recovery": return <Heart className="w-5 h-5" />;
      case "habits": return <Zap className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const averageScore = content.averageScore || report.habitsConsistency || 75;
  const scoreChange = content.scoreChange || 0;
  const xpEarned = content.totalXpEarned || 350;
  const protocolsCompleted = content.protocolsCompleted || 5;
  const streakDays = content.streakDays || 7;
  const topCategory = content.topCategory || "sleep";
  const improvementArea = content.improvementArea || "activity";
  const keyWins = report.keyWins || ["Maintained 7-day streak", "Improved sleep quality", "Completed all protocols"];
  const nextWeekFocus = report.nextWeekFocus || ["Increase daily steps", "Optimize recovery time"];
  const weeklyGoals = content.weeklyGoals || [
    { goal: "Complete 5 daily protocols", completed: true },
    { goal: "Maintain 7+ hours sleep average", completed: true },
    { goal: "Hit 10,000 steps daily", completed: false },
  ];
  const dailyScores = report.scoreTrend || [
    { date: weekStart.toISOString(), score: 72 },
    { date: new Date(weekStart.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), score: 78 },
    { date: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), score: 75 },
    { date: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), score: 82 },
    { date: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(), score: 80 },
    { date: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), score: 85 },
    { date: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), score: 78 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 h-16 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Weekly Report</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateRange(weekStart, weekEnd)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Summary Card */}
        <Card data-testid="card-report-summary">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore}
                  </span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {scoreChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={scoreChange >= 0 ? "text-green-400" : "text-red-400"}>
                    {scoreChange >= 0 ? "+" : ""}{scoreChange}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs last week</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{xpEarned}</p>
                  <p className="text-sm text-muted-foreground">XP Earned</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{protocolsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Protocols</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{streakDays}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Scores Chart */}
        <Card data-testid="card-daily-scores">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Daily Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {dailyScores.map((day, index) => {
                const height = (day.score / 100) * 100;
                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t-md ${getScoreColor(day.score).replace('text-', 'bg-').replace('-400', '-500/60')}`}
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    />
                    <span className="text-xs text-muted-foreground">{dayName}</span>
                    <span className="text-xs font-medium">{day.score}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths & Areas to Improve */}
          <Card data-testid="card-strengths">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-md">
                {getCategoryIcon(topCategory)}
                <div>
                  <p className="font-medium capitalize">{topCategory}</p>
                  <p className="text-sm text-muted-foreground">Top performing category</p>
                </div>
              </div>
              {keyWins.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-improvements">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Focus Area
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-md">
                {getCategoryIcon(improvementArea)}
                <div>
                  <p className="font-medium capitalize">{improvementArea}</p>
                  <p className="text-sm text-muted-foreground">Needs attention this week</p>
                </div>
              </div>
              {nextWeekFocus.map((focus, index) => (
                <div key={index} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{focus}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Goals */}
        <Card data-testid="card-weekly-goals">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Weekly Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${goal.completed ? 'bg-green-500' : 'bg-muted'}`}>
                    {goal.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={goal.completed ? "line-through text-muted-foreground" : ""}>{goal.goal}</p>
                  </div>
                  <Badge variant={goal.completed ? "default" : "outline"}>
                    {goal.completed ? "Complete" : "In Progress"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Goal Completion</span>
                <span className="font-medium">
                  {weeklyGoals.filter(g => g.completed).length}/{weeklyGoals.length}
                </span>
              </div>
              <Progress 
                value={(weeklyGoals.filter(g => g.completed).length / weeklyGoals.length) * 100} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button asChild size="lg" data-testid="button-view-dashboard">
            <Link href="/dashboard">
              Continue to Dashboard
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
