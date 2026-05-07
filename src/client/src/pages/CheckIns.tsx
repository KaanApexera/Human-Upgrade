import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Redirect } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Moon,
  Zap,
  Smile,
  Brain,
  Heart,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  Watch,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { CheckIn, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MetricSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  testId: string;
  fromWhoop?: boolean;
}

function MetricSlider({ label, value, onChange, icon, testId, fromWhoop }: MetricSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="text-sm font-medium">{label}</Label>
          {fromWhoop && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-cyan-500/40 text-cyan-400">
              WHOOP
            </Badge>
          )}
        </div>
        <span className="text-sm font-bold text-brand-red" data-testid={`${testId}-value`}>
          {value}/10
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        data-testid={testId}
      />
    </div>
  );
}

function getScoreColor(score: number | null | undefined): string {
  if (!score) return "text-muted-foreground";
  if (score >= 8) return "text-emerald-500";
  if (score >= 5) return "text-yellow-500";
  return "text-red-500";
}

interface WhoopSuggestion {
  whoopData: {
    sleepScore: string;
    recoveryScore: string;
    hrv: string;
    strain: string;
    sleepHours: string;
    daysRecorded: number;
  };
  suggested: {
    sleepQuality: number;
    energyLevel: number;
    stressLevel: number;
    trainingConsistency: number;
  };
  aiSummary: string;
}

export default function CheckIns() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const isPremium = user?.subscriptionPlan === "premium_monthly" || user?.subscriptionPlan === "premium_annual";

  if (!userLoading && user && !isPremium) {
    return <Redirect to="/pricing" />;
  }

  const [sleepQuality, setSleepQuality] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mood, setMood] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [libido, setLibido] = useState(5);
  const [trainingConsistency, setTrainingConsistency] = useState(5);
  const [notes, setNotes] = useState("");
  const [whoopSuggestion, setWhoopSuggestion] = useState<WhoopSuggestion | null>(null);
  const [whoopFields, setWhoopFields] = useState<Set<string>>(new Set());

  const { data: checkIns, isLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins"],
  });

  // Check if WHOOP is connected
  const { data: wearableConnections } = useQuery<any[]>({
    queryKey: ["/api/integrations/connections"],
  });
  const whoopConnected = wearableConnections?.some((c: any) => c.provider === "whoop" && c.isActive);

  const whoopImportMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/check-ins/from-whoop", {});
      return res.json() as Promise<WhoopSuggestion>;
    },
    onSuccess: (data) => {
      setWhoopSuggestion(data);
      setSleepQuality(data.suggested.sleepQuality);
      setEnergyLevel(data.suggested.energyLevel);
      setStressLevel(data.suggested.stressLevel);
      setTrainingConsistency(data.suggested.trainingConsistency);
      setWhoopFields(new Set(["sleep", "energy", "stress", "training"]));
      setNotes(data.aiSummary);
      toast({
        title: "WHOOP data imported",
        description: `${data.whoopData.daysRecorded} days of data analysed. Review and adjust before submitting.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "WHOOP import failed",
        description: err?.message || "Could not fetch WHOOP data. Make sure your device has synced recently.",
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/check-ins", {
        sleepQuality,
        energyLevel,
        moodScore: mood,
        stressLevel,
        libido,
        trainingConsistency,
        notes: notes || undefined,
        weekStartDate: getWeekStartDate(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      toast({
        title: "Check-in submitted",
        description: "Your weekly health check-in has been recorded.",
      });
      setSleepQuality(5);
      setEnergyLevel(5);
      setMood(5);
      setStressLevel(5);
      setLibido(5);
      setTrainingConsistency(5);
      setNotes("");
      setWhoopSuggestion(null);
      setWhoopFields(new Set());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  function getWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }

  const chartData = checkIns
    ?.slice()
    .reverse()
    .map((checkIn) => ({
      date: format(new Date(checkIn.weekStartDate), "MMM d"),
      Sleep: checkIn.sleepQuality,
      Energy: checkIn.energyLevel,
      Mood: checkIn.moodScore,
      Stress: checkIn.stressLevel,
      Libido: checkIn.libido,
      Training: checkIn.trainingConsistency,
    })) || [];

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Check-ins</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-brand-red" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold" data-testid="text-page-title">
                Weekly Check-ins
              </h1>
              <p className="text-muted-foreground text-sm">
                Track your subjective health metrics over time
              </p>
            </div>
          </div>

          {whoopConnected && (
            <Button
              variant="outline"
              onClick={() => whoopImportMutation.mutate()}
              disabled={whoopImportMutation.isPending}
              className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 gap-2"
              data-testid="button-import-whoop"
            >
              {whoopImportMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Watch className="w-4 h-4" />
              )}
              Import from WHOOP
            </Button>
          )}
        </div>

        {/* WHOOP summary banner */}
        {whoopSuggestion && (
          <Card className="mb-6 border-cyan-500/30 bg-cyan-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-cyan-400">WHOOP Analysis</span>
                    <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400">
                      {whoopSuggestion.whoopData.daysRecorded} days
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {whoopSuggestion.aiSummary}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Sleep Score", value: `${whoopSuggestion.whoopData.sleepScore}/100` },
                      { label: "Recovery", value: `${whoopSuggestion.whoopData.recoveryScore}/100` },
                      { label: "HRV", value: `${whoopSuggestion.whoopData.hrv}ms` },
                      { label: "Strain", value: `${whoopSuggestion.whoopData.strain}/21` },
                      { label: "Sleep", value: `${whoopSuggestion.whoopData.sleepHours}h` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-background/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                        <div className="text-sm font-bold text-cyan-400">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => whoopImportMutation.mutate()}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Check-in</CardTitle>
              <CardDescription>
                {whoopSuggestion
                  ? "WHOOP data pre-filled below. Adjust if needed and add mood & libido manually."
                  : "Rate your health metrics for this week (1 = Poor, 10 = Excellent)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MetricSlider
                label="Sleep Quality"
                value={sleepQuality}
                onChange={setSleepQuality}
                icon={<Moon className="w-4 h-4 text-muted-foreground" />}
                testId="slider-sleep"
                fromWhoop={whoopFields.has("sleep")}
              />
              <MetricSlider
                label="Energy Level"
                value={energyLevel}
                onChange={setEnergyLevel}
                icon={<Zap className="w-4 h-4 text-muted-foreground" />}
                testId="slider-energy"
                fromWhoop={whoopFields.has("energy")}
              />
              <MetricSlider
                label="Mood"
                value={mood}
                onChange={setMood}
                icon={<Smile className="w-4 h-4 text-muted-foreground" />}
                testId="slider-mood"
              />
              <MetricSlider
                label="Stress Level"
                value={stressLevel}
                onChange={setStressLevel}
                icon={<Brain className="w-4 h-4 text-muted-foreground" />}
                testId="slider-stress"
                fromWhoop={whoopFields.has("stress")}
              />
              <MetricSlider
                label="Libido"
                value={libido}
                onChange={setLibido}
                icon={<Heart className="w-4 h-4 text-muted-foreground" />}
                testId="slider-libido"
              />
              <MetricSlider
                label="Training Consistency"
                value={trainingConsistency}
                onChange={setTrainingConsistency}
                icon={<Dumbbell className="w-4 h-4 text-muted-foreground" />}
                testId="slider-training"
                fromWhoop={whoopFields.has("training")}
              />

              <div className="space-y-2">
                <Label htmlFor="notes">
                  Notes {whoopSuggestion ? <span className="text-xs text-cyan-400">(pre-filled by AI)</span> : "(optional)"}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about your week..."
                  className="resize-none"
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>

              <Button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="w-full bg-brand-red hover:bg-brand-red/90"
                data-testid="button-submit"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Check-in"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-red" />
                <CardTitle className="text-lg">Trends Over Time</CardTitle>
              </div>
              <CardDescription>
                Your health metrics over the past weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Sleep"    stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                    <Line type="monotone" dataKey="Energy"   stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
                    <Line type="monotone" dataKey="Mood"     stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
                    <Line type="monotone" dataKey="Stress"   stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                    <Line type="monotone" dataKey="Libido"   stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899" }} />
                    <Line type="monotone" dataKey="Training" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No check-in data yet. Submit your first check-in to see trends.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Check-in History</CardTitle>
            <CardDescription>View all your past weekly check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : checkIns && checkIns.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead className="text-center">Sleep</TableHead>
                      <TableHead className="text-center">Energy</TableHead>
                      <TableHead className="text-center">Mood</TableHead>
                      <TableHead className="text-center">Stress</TableHead>
                      <TableHead className="text-center">Libido</TableHead>
                      <TableHead className="text-center">Training</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkIns.map((checkIn, index) => (
                      <TableRow key={checkIn.id} data-testid={`row-checkin-${index}`}>
                        <TableCell className="font-medium">
                          {format(new Date(checkIn.weekStartDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${getScoreColor(checkIn.sleepQuality)}`}>
                          {checkIn.sleepQuality ?? "-"}
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${getScoreColor(checkIn.energyLevel)}`}>
                          {checkIn.energyLevel ?? "-"}
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${getScoreColor(checkIn.moodScore)}`}>
                          {checkIn.moodScore ?? "-"}
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${getScoreColor(checkIn.stressLevel)}`}>
                          {checkIn.stressLevel ?? "-"}
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${getScoreColor(checkIn.libido)}`}>
                          {checkIn.libido ?? "-"}
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${getScoreColor(checkIn.trainingConsistency)}`}>
                          {checkIn.trainingConsistency ?? "-"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {checkIn.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No check-ins recorded yet. Submit your first check-in above.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
