import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { OnboardingTour } from "@/components/OnboardingTour";
import { NotificationBell } from "@/components/NotificationBell";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardCard,
  MetricDisplay,
  ProtocolItem,
  StatusBadge,
  PerformanceAgeDisplay,
  RiskItemDisplay,
} from "@/components/DashboardCard";
import { UploadDialog } from "@/components/UploadDialog";
import { QuestionnaireDialog } from "@/components/QuestionnaireDialog";
import { SocialShare } from "@/components/SocialShare";
import { PrintableGuidelines } from "@/components/PrintableGuidelines";
import { CycleOptimizer } from "@/components/CycleOptimizer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Zap,
  Activity,
  Heart,
  Flame,
  Sun,
  Moon,
  Pill,
  Dumbbell,
  AlertTriangle,
  FileText,
  LogOut,
  Settings,
  CreditCard,
  Syringe,
  Brain,
  Crosshair,
  Award,
  TrendingUp,
  BookOpen,
  ClipboardList,
  UserCircle,
  Flag,
  Calendar,
  Watch,
  Utensils,
  Handshake,
} from "lucide-react";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";
import {
  DailyScoreWidget,
  TodaysProtocolWidget,
  StreakLevelWidget,
  BenchmarkWidget,
  WeeklyReportPreview,
} from "@/components/GamificationWidgets";
import type { User, Protocol } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserMetrics {
  id: string;
  userId: string;
  heightCm: number;
  weightKg: number;
  bodyFatPercent?: number;
  age: number;
  gender: string;
  fitnessGoal: string;
  activityLevel?: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [questionnaireFromUpload, setQuestionnaireFromUpload] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [guidelinesDialogOpen, setGuidelinesDialogOpen] = useState(false);
  const [cycleOptimizerDialogOpen, setCycleOptimizerDialogOpen] = useState(false);
  const [reportIssueDialogOpen, setReportIssueDialogOpen] = useState(false);


  // Sync subscription status when returning from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      // Clear the URL parameter
      window.history.replaceState({}, "", window.location.pathname);
      // Sync subscription from Stripe
      apiRequest("POST", "/api/sync-subscription")
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        })
        .catch(console.error);
    }
  }, []);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: protocol, isLoading: protocolLoading } = useQuery<Protocol | null>({
    queryKey: ["/api/protocol"],
  });

  const { data: userMetrics } = useQuery<UserMetrics | null>({
    queryKey: ["/api/user-metrics"],
  });

  // Auto-open upload for first-time users (no protocol yet)
  useEffect(() => {
    if (protocolLoading) return;
    const hasSeenWelcome = localStorage.getItem("hu_welcome_seen");
    if (!protocol && !hasSeenWelcome) {
      localStorage.setItem("hu_welcome_seen", "true");
      const timer = setTimeout(() => setUploadDialogOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [protocol, protocolLoading]);

  // Show onboarding tour only after protocol is loaded
  useEffect(() => {
    if (!protocol) return;
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [protocol]);

  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/generate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protocol"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const isPremium = user?.subscriptionPlan === "premium_monthly" || user?.subscriptionPlan === "premium_annual";
  const isBasic = user?.subscriptionPlan === "basic";
  const isTrial = user?.subscriptionPlan === "trial";
  const hasSubscription = isPremium || isBasic || isTrial;
  const remainingUploads = (isBasic || isTrial) ? Math.max(0, 1 - (user?.pdfUploadsThisMonth || 0)) : 999;
  const isExpired = user?.subscriptionStatus === "expired" || user?.subscriptionStatus === "cancelled";
  
  // Calculate trial days remaining
  const trialDaysRemaining = isTrial && user?.trialEndsAt 
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleUpgrade = () => setLocation("/pricing");
  
  // Check if user has complete metrics (including fitness goal) before upload
  const hasCompleteMetrics = userMetrics && userMetrics.fitnessGoal;
  
  const handleUploadClick = () => {
    if (!hasCompleteMetrics) {
      setQuestionnaireFromUpload(true);
      setQuestionnaireOpen(true);
    } else {
      setUploadDialogOpen(true);
    }
  };
  
  const handleEditProfile = () => {
    setQuestionnaireFromUpload(false);
    setQuestionnaireOpen(true);
  };
  
  const handleQuestionnaireComplete = () => {
    setQuestionnaireOpen(false);
    // Only open upload dialog if this was triggered from upload flow
    if (questionnaireFromUpload) {
      setUploadDialogOpen(true);
    }
    setQuestionnaireFromUpload(false);
  };
  
  const handleBillingPortal = async () => {
    try {
      const response = await apiRequest("GET", "/api/billing-portal");
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Failed to open billing portal");
    }
  };

  if (userLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!hasSubscription || isExpired) {
    return (
      <div className="flex flex-col relative overflow-hidden h-full">
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-brand-red mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold mb-2">
              {isExpired ? "Subscription Expired" : "No Active Subscription"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isExpired
                ? "Your subscription has expired. Renew now to continue accessing your health optimization protocols."
                : "Choose a plan to unlock personalized health optimization."}
            </p>
            <div className="flex gap-3 justify-center">
              {isExpired && (
                <Button onClick={handleBillingPortal} variant="outline">
                  Manage Billing
                </Button>
              )}
              <Button
                onClick={() => setLocation("/pricing")}
                className="bg-brand-red hover:bg-brand-red/90 rounded-full"
              >
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <OnboardingTour 
        run={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />

      {isTrial && (
        <TrialBanner daysRemaining={trialDaysRemaining} onUpgrade={handleUpgrade} />
      )}

      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            {!isPremium && remainingUploads !== undefined && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {remainingUploads}/1 uploads
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              size="sm"
              className="rounded-full"
              data-testid="button-upload-document"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              size="sm"
              className="bg-brand-red hover:bg-brand-red/90 rounded-full"
              data-testid="button-generate-protocol"
            >
              <Zap className="w-4 h-4 mr-2" />
              {generateMutation.isPending ? "Generating..." : "Generate"}
            </Button>
            <NotificationBell />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!protocol && !protocolLoading ? (
          <EmptyDashboard onUpload={handleUploadClick} isTrial={isTrial} />
        ) : protocolLoading ? (
          <DashboardGridSkeleton />
        ) : (
          <DashboardGrid 
            protocol={protocol!} 
            isPremium={isPremium} 
            isTrial={isTrial} 
            onUpgrade={handleUpgrade}
            guidelinesDialogOpen={guidelinesDialogOpen}
            setGuidelinesDialogOpen={setGuidelinesDialogOpen}
            cycleOptimizerDialogOpen={cycleOptimizerDialogOpen}
            setCycleOptimizerDialogOpen={setCycleOptimizerDialogOpen}
            reportIssueDialogOpen={reportIssueDialogOpen}
            setReportIssueDialogOpen={setReportIssueDialogOpen}
          />
        )}
      </main>

      <QuestionnaireDialog
        open={questionnaireOpen}
        onOpenChange={setQuestionnaireOpen}
        onComplete={handleQuestionnaireComplete}
        initialData={userMetrics ? {
          heightCm: String(userMetrics.heightCm),
          weightKg: String(userMetrics.weightKg),
          bodyFatPercent: userMetrics.bodyFatPercent ? String(userMetrics.bodyFatPercent) : undefined,
          age: userMetrics.age,
          gender: userMetrics.gender,
          fitnessGoal: userMetrics.fitnessGoal,
          activityLevel: userMetrics.activityLevel,
        } : undefined}
      />

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        remainingUploads={remainingUploads}
        isUnlimited={isPremium}
        onUploadComplete={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/protocol"] });
        }}
      />

      <AIChatAssistant protocolData={protocol} />
    </div>
  );
}

function TrialBanner({ daysRemaining, onUpgrade }: { daysRemaining: number; onUpgrade: () => void }) {
  return (
    <div className="bg-brand-red/10 border-b border-brand-red/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-red" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Free Trial: <span className="text-brand-red font-bold">{daysRemaining} days remaining</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Upload 1 PDF and see your Performance Age. Subscribe for full access.
              </p>
            </div>
          </div>
          <Button
            onClick={onUpgrade}
            size="sm"
            className="bg-brand-red hover:bg-brand-red/90 rounded-full"
            data-testid="button-trial-upgrade"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}


function EmptyDashboard({ onUpload, isTrial }: { onUpload: () => void; isTrial?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-brand-red/10 border border-brand-red/20 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-brand-red" />
      </div>
      <h2 className="font-heading text-3xl font-bold mb-3">
        Let's build your protocol
      </h2>
      <p className="text-muted-foreground mb-10 max-w-md leading-relaxed">
        Upload your blood work and we'll calculate your Performance Age, analyse 40+ biomarkers, and generate a personalised protocol in minutes.
      </p>

      <div className="grid grid-cols-3 gap-4 w-full mb-10">
        {[
          { step: "1", icon: <Upload className="w-5 h-5 text-brand-red" />, title: "Upload labs", desc: "PDF or image, any lab" },
          { step: "2", icon: <Activity className="w-5 h-5 text-brand-red" />, title: "Get your age", desc: "Biological vs chronological" },
          { step: "3", icon: <Zap className="w-5 h-5 text-brand-red" />, title: "Get your protocol", desc: "Supplements, sleep, peptides" },
        ].map(({ step, icon, title, desc }) => (
          <div key={step} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="w-8 h-8 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
              {icon}
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={onUpload}
        className="bg-brand-red hover:bg-brand-red/90 rounded-full font-semibold px-8 py-5 text-base"
        data-testid="button-upload-empty"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Your Blood Work
      </Button>
      {isTrial && (
        <p className="text-xs text-muted-foreground mt-3">Free plan includes 1 analysis</p>
      )}
    </div>
  );
}

function WearableInsightsCard({ isPremium, onUpgrade }: { isPremium: boolean; onUpgrade: () => void }) {
  const [, setLocation] = useLocation();
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/wearables/insights"],
    enabled: isPremium,
  });

  const { data: connections } = useQuery({
    queryKey: ["/api/integrations/connections"],
    enabled: isPremium,
  });

  const hasConnections = connections && (connections as any[]).length > 0;
  const hasData = insights && (insights as any).sleepTrend;

  if (!isPremium) {
    return (
      <DashboardCard 
        title="Wearable Insights" 
        icon={<Watch className="w-5 h-5" />}
        isPremium={true}
        isLocked={true}
        onUpgrade={onUpgrade}
      >
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Connect Oura, WHOOP, or Apple Watch to get personalized daily routines
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onUpgrade}
            data-testid="button-unlock-wearables"
          >
            Unlock with Premium
          </Button>
        </div>
      </DashboardCard>
    );
  }

  if (isLoading) {
    return (
      <DashboardCard title="Wearable Insights" icon={<Watch className="w-5 h-5" />}>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </DashboardCard>
    );
  }

  if (!hasConnections) {
    return (
      <DashboardCard title="Wearable Insights" icon={<Watch className="w-5 h-5" />}>
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Watch className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Connect a wearable device to unlock personalized daily routines
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/integrations")}
            data-testid="button-connect-wearable"
          >
            Connect Device
          </Button>
        </div>
      </DashboardCard>
    );
  }

  const insightsData = insights as any;
  const sleepAvg = insightsData?.sleepTrend?.average;
  const hrvAvg = insightsData?.hrvTrend?.average;
  const recoveryStatus = insightsData?.recoveryStatus || 'good';
  const flags = insightsData?.flags || [];

  return (
    <DashboardCard title="Wearable Insights" icon={<Watch className="w-5 h-5" />}>
      <div className="space-y-4">
        {sleepAvg && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Sleep</span>
            </div>
            <span className="text-sm font-medium">{(sleepAvg / 60).toFixed(1)}h</span>
          </div>
        )}
        {hrvAvg && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg HRV</span>
            </div>
            <span className="text-sm font-medium">{Math.round(hrvAvg)} ms</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Recovery</span>
          </div>
          <Badge variant={recoveryStatus === 'good' ? 'default' : recoveryStatus === 'moderate' ? 'secondary' : 'destructive'}>
            {recoveryStatus}
          </Badge>
        </div>
        {flags.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Flags:</p>
            {flags.slice(0, 2).map((flag: string, i: number) => (
              <p key={i} className="text-xs text-amber-500">{flag}</p>
            ))}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => setLocation("/integrations")}
          data-testid="button-view-wearables"
        >
          View All Insights
        </Button>
      </div>
    </DashboardCard>
  );
}

function DashboardGrid({
  protocol,
  isPremium,
  isTrial,
  onUpgrade,
  guidelinesDialogOpen,
  setGuidelinesDialogOpen,
  cycleOptimizerDialogOpen,
  setCycleOptimizerDialogOpen,
  reportIssueDialogOpen,
  setReportIssueDialogOpen,
}: {
  protocol: Protocol;
  isPremium: boolean;
  isTrial?: boolean;
  onUpgrade: () => void;
  guidelinesDialogOpen: boolean;
  setGuidelinesDialogOpen: (open: boolean) => void;
  cycleOptimizerDialogOpen: boolean;
  setCycleOptimizerDialogOpen: (open: boolean) => void;
  reportIssueDialogOpen: boolean;
  setReportIssueDialogOpen: (open: boolean) => void;
}) {
  const [, setLocation] = useLocation();
  const peptideReadiness = (protocol.peptideReadiness as any) || {};
  const hormoneStatus = (protocol.hormoneStatus as any) || {};
  const metabolicStatus = (protocol.metabolicStatus as any) || {};
  const inflammation = (protocol.inflammation as any) || {};
  const morningRoutine = (protocol.morningRoutine as any[]) || [];
  const eveningRoutine = (protocol.eveningRoutine as any[]) || [];
  const supplementProtocol = (protocol.supplementProtocol as any[]) || [];
  const workoutPlan = (protocol.workoutPlan as any[]) || [];
  const risks = (protocol.risks as any[]) || [];

  // Calculate derived metrics
  const vitalEnergyIndex = Math.round(
    100 - ((metabolicStatus.homaIr || 1.5) * 5) - ((inflammation.crp || 0.8) * 10)
  );
  const neuralActivation = Math.round(
    85 + (hormoneStatus.testosterone > 500 ? 10 : 0) - ((inflammation.homocysteine || 8) > 10 ? 15 : 0)
  );
  const recoveryDebt = Math.round(
    (inflammation.crp || 0.8) * 10 + ((metabolicStatus.homaIr || 1.5) - 1) * 15
  );

  // Trial users get: Performance Age (main hook) + 2 locked preview cards
  // Everything else locked to encourage subscription
  const isLockedForTrial = isTrial && !isPremium;

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/80">
        <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
        <p>
          <strong className="text-amber-300">Not medical advice.</strong> AI-generated protocols and recommendations are for informational purposes only. Consult a qualified healthcare provider before making changes to your diet, supplements, or health routine.
        </p>
      </div>

      {/* Gamification Section - Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyScoreWidget />
        <TodaysProtocolWidget />
      </div>
      
      {/* Streak/Level + Benchmark Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StreakLevelWidget />
        <BenchmarkWidget />
        <WeeklyReportPreview />
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Performance Age - FREE for trial users (the hook) */}
      <DashboardCard title="Performance Age™" icon={<Activity className="w-5 h-5" />}>
        <PerformanceAgeDisplay chronologicalAge={35} performanceAge={protocol.performanceAge || 32} />
        <div className="flex justify-center gap-2 mt-4">
          <SocialShare performanceAge={protocol.performanceAge || 32} chronologicalAge={35} />
          {!isTrial && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/progress")}
              data-testid="button-view-progress"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Progress
            </Button>
          )}
        </div>
        {isTrial && (
          <p className="text-xs text-brand-red mt-3 text-center">
            Subscribe to track your Performance Age over time
          </p>
        )}
      </DashboardCard>

      {/* Vital Energy Index - Show partial for trial (teaser) */}
      <DashboardCard 
        title="Vital Energy Index" 
        icon={<Zap className="w-5 h-5" />}
        isPremium={isTrial}
        isLocked={isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="text-center">
          <div className="text-4xl font-bold text-brand-red mb-2">{isLockedForTrial ? "??" : vitalEnergyIndex}</div>
          <div className="text-sm text-muted-foreground">Energy Score</div>
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-brand-red"
              style={{ width: isLockedForTrial ? "50%" : `${Math.min(100, vitalEnergyIndex)}%` }}
            />
          </div>
        </div>
      </DashboardCard>

      {/* Brain Performance - Locked for trial */}
      <DashboardCard 
        title="Brain Performance" 
        icon={<Brain className="w-5 h-5" />}
        isPremium={isTrial}
        isLocked={isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground mb-2">{isLockedForTrial ? "??" : `${neuralActivation}%`}</div>
          <div className="text-sm text-muted-foreground">Cognitive Performance</div>
          <div className="mt-3 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  !isLockedForTrial && i < Math.floor(neuralActivation / 20)
                    ? "bg-brand-red"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Recovery Debt - Locked for trial */}
      <DashboardCard 
        title="Recovery Debt" 
        icon={<Activity className="w-5 h-5" />}
        isPremium={isTrial}
        isLocked={isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${
            isLockedForTrial ? "text-muted-foreground" :
            recoveryDebt > 30 ? "text-brand-red" : recoveryDebt > 15 ? "text-yellow-500" : "text-emerald-500"
          }`}>
            {isLockedForTrial ? "??" : recoveryDebt}
          </div>
          <div className="text-sm text-muted-foreground">Recovery Load</div>
          {!isLockedForTrial && (
            <StatusBadge status={recoveryDebt > 30 ? "critical" : recoveryDebt > 15 ? "needs-attention" : "optimal"} />
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Peptide Readiness"
        icon={<Syringe className="w-5 h-5" />}
        isPremium
        isLocked={!isPremium || isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Readiness Score</span>
            <StatusBadge status={peptideReadiness.status || "good"} />
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {(() => {
              // Helper function to normalize peptide data from both legacy (boolean) and new (object) formats
              const normalizePeptide = (peptide: any) => {
                if (typeof peptide === 'boolean') return peptide;
                if (typeof peptide === 'object' && peptide !== null) return peptide.recommended;
                return false;
              };
              
              const peptides = [
                { label: "BPC-157", key: "bpc157" },
                { label: "TB-500", key: "tb500" },
                { label: "NAD+", key: "nadPlus" },
                { label: "MOTS-c", key: "motsc" },
                { label: "Sermorelin", key: "sermorelin" },
                { label: "Ipamorelin", key: "ipamorelin" },
                { label: "CJC-1295", key: "cjc1295" },
                { label: "Epithalon", key: "epithalon" },
                { label: "TA-1", key: "thymosinAlpha1" },
                { label: "SS-31", key: "ss31" },
              ];
              
              return peptides.map(({ label, key }) => {
                const isRecommended = normalizePeptide(peptideReadiness[key]);
                return (
                  <MetricDisplay 
                    key={key}
                    label={label} 
                    value={isRecommended ? "Yes" : "No"} 
                    status={isRecommended ? "good" : "neutral"} 
                  />
                );
              });
            })()}
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">{peptideReadiness.ghStatus || "GH axis functioning normally"}</p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Hormone Status"
        icon={<Heart className="w-5 h-5" />}
      >
        <div className="space-y-2">
          {isLockedForTrial ? (
            <>
              {[
                { label: "Testosterone", status: hormoneStatus.testosteroneStatus || "needs-attention" },
                { label: "Free T",       status: "good" },
                { label: "Estradiol",    status: "good" },
                { label: "SHBG",         status: hormoneStatus.shbgStatus || "good" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between py-0.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <StatusBadge status={status as any} />
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-border text-center">
                <p className="text-xs text-muted-foreground mb-2">Exact values & optimization plan locked</p>
                <Button size="sm" onClick={onUpgrade} className="w-full bg-brand-red hover:bg-brand-red/90 rounded-full text-xs" data-testid="button-upgrade-hormone">
                  Unlock Full Panel →
                </Button>
              </div>
            </>
          ) : (
            <>
              <MetricDisplay label="Testosterone" value={hormoneStatus.testosterone || 612} unit="ng/dL" status={hormoneStatus.testosteroneStatus || "good"} />
              <MetricDisplay label="Free T" value={hormoneStatus.freeT || 18.5} unit="pg/mL" status="good" />
              <MetricDisplay label="Estradiol" value={hormoneStatus.estradiol || 28} unit="pg/mL" status="good" />
              <MetricDisplay label="SHBG" value={hormoneStatus.shbg || 32} unit="nmol/L" status="good" />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Metabolic Status"
        icon={<Flame className="w-5 h-5" />}
      >
        <div className="space-y-2">
          {isLockedForTrial ? (
            <>
              {[
                { label: "Fasting Glucose", status: metabolicStatus.glucoseStatus || "good" },
                { label: "HbA1c",           status: metabolicStatus.hba1cStatus  || "good" },
                { label: "Insulin",          status: metabolicStatus.insulinStatus || "needs-attention" },
                { label: "HOMA-IR",          status: metabolicStatus.homaIrStatus || "needs-attention" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between py-0.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <StatusBadge status={status as any} />
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-border text-center">
                <p className="text-xs text-muted-foreground mb-2">Exact values & optimization plan locked</p>
                <Button size="sm" onClick={onUpgrade} className="w-full bg-brand-red hover:bg-brand-red/90 rounded-full text-xs" data-testid="button-upgrade-metabolic">
                  Unlock Full Panel →
                </Button>
              </div>
            </>
          ) : (
            <>
              <MetricDisplay label="Fasting Glucose" value={metabolicStatus.glucose || 92} unit="mg/dL" status="good" />
              <MetricDisplay label="HbA1c" value={metabolicStatus.hba1c || 5.2} unit="%" status="good" />
              <MetricDisplay label="Insulin" value={metabolicStatus.insulin || 6.8} unit="uIU/mL" status="good" />
              <MetricDisplay label="HOMA-IR" value={metabolicStatus.homaIr || 1.5} status="good" />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Inflammation"
        icon={<AlertTriangle className="w-5 h-5" />}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Overall Status</span>
            <StatusBadge status={inflammation.status || "good"} />
          </div>
          {isLockedForTrial ? (
            <>
              {[
                { label: "hs-CRP",       status: inflammation.crpStatus         || "needs-attention" },
                { label: "Homocysteine", status: inflammation.homocysteineStatus || "good" },
                { label: "Ferritin",     status: inflammation.ferritinStatus     || "good" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between py-0.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <StatusBadge status={status as any} />
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-border text-center">
                <p className="text-xs text-muted-foreground mb-2">Exact values & inflammation protocol locked</p>
                <Button size="sm" onClick={onUpgrade} className="w-full bg-brand-red hover:bg-brand-red/90 rounded-full text-xs" data-testid="button-upgrade-inflammation">
                  Unlock Full Panel →
                </Button>
              </div>
            </>
          ) : (
            <>
              <MetricDisplay label="hs-CRP" value={inflammation.crp || 0.8} unit="mg/L" status="good" />
              <MetricDisplay label="Homocysteine" value={inflammation.homocysteine || 8.2} unit="umol/L" status="good" />
              <MetricDisplay label="Ferritin" value={inflammation.ferritin || 95} unit="ng/mL" status="good" />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Morning Routine"
        icon={<Sun className="w-5 h-5" />}
        isPremium={!isPremium && !isLockedForTrial}
        isLocked={!isPremium && !isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="space-y-2">
          {/* First item always visible for trial */}
          {isLockedForTrial ? (
            <>
              <ProtocolItem
                name={morningRoutine[0]?.action || "Wake + Sun Exposure"}
                dosage={morningRoutine[0]?.details || "10-15 min"}
                timing={morningRoutine[0]?.time || "6:00 AM"}
                priority="high"
              />
              <div className="relative mt-1">
                <div className="blur-sm pointer-events-none space-y-2 select-none">
                  <ProtocolItem name="Cold Exposure" dosage="2-3 min cold shower" timing="6:15 AM" priority="medium" />
                  <ProtocolItem name="Hydration Protocol" dosage="500ml + electrolytes" timing="6:20 AM" priority="high" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="sm" onClick={onUpgrade} className="bg-brand-red hover:bg-brand-red/90 rounded-full text-xs shadow-lg">
                    Unlock full routine →
                  </Button>
                </div>
              </div>
            </>
          ) : morningRoutine.length > 0 ? (
            morningRoutine.slice(0, 4).map((item: any, i: number) => (
              <ProtocolItem key={i} name={item.action} dosage={item.details} timing={item.time} priority={item.priority} />
            ))
          ) : (
            <>
              <ProtocolItem name="Wake + Sun Exposure" dosage="10-15 min" timing="6:00 AM" priority="high" />
              <ProtocolItem name="Cold Exposure" dosage="2-3 min cold shower" timing="6:15 AM" priority="medium" />
              <ProtocolItem name="Hydration" dosage="500ml + electrolytes" timing="6:20 AM" priority="high" />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Evening Routine"
        icon={<Moon className="w-5 h-5" />}
        isPremium
        isLocked={!isPremium || isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="space-y-2">
          {eveningRoutine.length > 0 ? (
            eveningRoutine.slice(0, 4).map((item: any, i: number) => (
              <ProtocolItem
                key={i}
                name={item.action}
                dosage={item.details}
                timing={item.time}
                priority={item.priority}
              />
            ))
          ) : (
            <>
              <ProtocolItem name="Blue Light Block" dosage="Glasses on" timing="7:00 PM" priority="high" />
              <ProtocolItem name="Magnesium" dosage="400mg Glycinate" timing="8:30 PM" priority="medium" />
              <ProtocolItem name="Sleep" dosage="Target 7-8 hours" timing="10:00 PM" priority="high" />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Supplement Protocol"
        icon={<Pill className="w-5 h-5" />}
        isPremium={!isPremium && !isLockedForTrial}
        isLocked={!isPremium && !isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="space-y-2">
          {isLockedForTrial ? (
            <>
              <ProtocolItem
                name={supplementProtocol[0]?.name || "Vitamin D3"}
                dosage={supplementProtocol[0]?.dosage || "2000 IU"}
                timing={supplementProtocol[0]?.timing || "Morning with fat"}
                priority="high"
              />
              <div className="relative mt-1">
                <div className="blur-sm pointer-events-none space-y-2 select-none">
                  <ProtocolItem name="Omega-3" dosage="2-3g EPA/DHA" timing="With meals" priority="medium" />
                  <ProtocolItem name="Magnesium Glycinate" dosage="300-400mg" timing="Before bed" priority="high" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="sm" onClick={onUpgrade} className="bg-brand-red hover:bg-brand-red/90 rounded-full text-xs shadow-lg">
                    {supplementProtocol.length > 1 ? `+${supplementProtocol.length - 1} more supplements →` : "Unlock full protocol →"}
                  </Button>
                </div>
              </div>
            </>
          ) : supplementProtocol.length > 0 ? (
            supplementProtocol.slice(0, 4).map((item: any, i: number) => (
              <ProtocolItem key={i} name={item.name} dosage={item.dosage} timing={item.timing} priority="medium" />
            ))
          ) : (
            <>
              <ProtocolItem name="Vitamin D3" dosage="1000-2000 IU" timing="Morning with fat" priority="high" />
              <ProtocolItem name="Omega-3" dosage="2-3g EPA/DHA" timing="With meals" priority="medium" />
              <ProtocolItem name="Magnesium Glycinate" dosage="300-400mg" timing="Before bed" priority="high" />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Workout Plan"
        icon={<Dumbbell className="w-5 h-5" />}
        isPremium
        isLocked={!isPremium || isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="space-y-2">
          {workoutPlan.length > 0 ? (
            workoutPlan.slice(0, 4).map((item: any, i: number) => (
              <ProtocolItem
                key={i}
                name={item.day}
                dosage={item.type}
                timing={item.duration}
                frequency={item.intensity}
                priority="medium"
              />
            ))
          ) : (
            <>
              <ProtocolItem name="Monday" dosage="Upper Body Push" timing="45 min" frequency="High intensity" priority="high" />
              <ProtocolItem name="Wednesday" dosage="Lower Body" timing="50 min" frequency="Moderate" priority="medium" />
              <ProtocolItem name="Friday" dosage="Upper Body Pull" timing="45 min" frequency="High intensity" priority="high" />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard title="Risks & Alerts" icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-2">
          {risks.length > 0 ? (
            risks.slice(0, 3).map((risk: any, i: number) => (
              <RiskItemDisplay
                key={i}
                category={risk.category}
                level={risk.level}
                description={risk.description}
                recommendation={risk.recommendation}
              />
            ))
          ) : (
            <>
              <RiskItemDisplay
                category="Vitamin D"
                level="moderate"
                description="Levels slightly below optimal range"
                recommendation="Consider 5000 IU daily supplementation"
              />
              <RiskItemDisplay
                category="Sleep"
                level="low"
                description="All markers within normal range"
              />
            </>
          )}
        </div>
      </DashboardCard>

      <DashboardCard 
        title="Optimization Playbook" 
        icon={<BookOpen className="w-5 h-5" />}
        isPremium
        isLocked={!isPremium || isLockedForTrial}
        onUpgrade={onUpgrade}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Access your personalized optimization tools based on your biomarker analysis.
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={() => setGuidelinesDialogOpen(true)}
              disabled={!isPremium || isLockedForTrial}
              data-testid="button-open-guidelines"
            >
              <ClipboardList className="h-5 w-5 text-green-500 shrink-0" />
              <span className="flex flex-col items-start">
                <span className="text-sm font-medium">Do's & Don'ts Guidelines</span>
                <span className="text-xs text-muted-foreground font-normal">Printable</span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={() => setCycleOptimizerDialogOpen(true)}
              disabled={!isPremium || isLockedForTrial}
              data-testid="button-open-cycle-optimizer"
            >
              <Syringe className="h-5 w-5 text-red-500 shrink-0" />
              <span className="flex flex-col items-start">
                <span className="text-sm font-medium">Peptide & TRT Optimizer</span>
                <span className="text-xs text-muted-foreground font-normal">Advanced</span>
              </span>
            </Button>
          </div>
        </div>
      </DashboardCard>

      <WearableInsightsCard isPremium={isPremium} onUpgrade={onUpgrade} />

      <DashboardCard title="Notes" icon={<Brain className="w-5 h-5" />} className="md:col-span-2">
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-muted-foreground">
            {protocol.notes ||
              "Based on your biomarker analysis, your overall health profile is good with some areas for optimization. Focus on vitamin D supplementation, maintaining consistent sleep patterns, and following the recommended peptide protocol for tissue repair and recovery."}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Something not right with your protocol?</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setReportIssueDialogOpen(true)}
            data-testid="button-report-issue"
          >
            <Flag className="w-4 h-4 mr-2" />
            Report an Issue
          </Button>
        </div>
      </DashboardCard>
      </div>

      <Dialog open={guidelinesDialogOpen} onOpenChange={setGuidelinesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Health Optimization Guidelines</DialogTitle>
          </DialogHeader>
          <PrintableGuidelines 
            existingData={protocol?.dosAndDonts as any} 
            onClose={() => setGuidelinesDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={cycleOptimizerDialogOpen} onOpenChange={setCycleOptimizerDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Peptide & TRT Cycle Optimizer</DialogTitle>
          </DialogHeader>
          <CycleOptimizer 
            existingData={protocol?.cycleRecommendations as any}
            onClose={() => setCycleOptimizerDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ReportIssueDialog 
        open={reportIssueDialogOpen} 
        onOpenChange={setReportIssueDialogOpen}
        protocolId={protocol?.id}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardGridSkeleton />
      </main>
    </div>
  );
}

function DashboardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 11 }).map((_, i) => (
        <Skeleton key={i} className={`h-64 rounded-lg ${i === 10 ? "md:col-span-2" : ""}`} />
      ))}
    </div>
  );
}
