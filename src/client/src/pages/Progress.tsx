import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  TrendingUp, TrendingDown, Target, Calendar, Plus, Trash2, 
  Activity, ArrowLeft, CheckCircle2, Clock
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Goal, Protocol } from "@shared/schema";
import { format } from "date-fns";

interface BiomarkerHistory {
  [name: string]: Array<{
    value: string | null;
    date: string | null;
    uploadId: string;
  }>;
}

interface ProtocolHistory {
  id: string;
  performanceAge: number | null;
  date: string | null;
  uploadId: string | null;
}

export default function Progress() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    biomarkerName: "",
    targetValue: "",
    currentValue: "",
    unit: "",
    direction: "lower",
    targetDate: "",
  });

  const { data: biomarkerHistory, isLoading: loadingBiomarkers } = useQuery<BiomarkerHistory>({
    queryKey: ["/api/biomarkers/history"],
  });

  const { data: protocolHistory, isLoading: loadingProtocols } = useQuery<ProtocolHistory[]>({
    queryKey: ["/api/protocols/history"],
  });

  const { data: goals, isLoading: loadingGoals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: typeof newGoal) => {
      return apiRequest("POST", "/api/goals", goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowGoalDialog(false);
      setNewGoal({
        biomarkerName: "",
        targetValue: "",
        currentValue: "",
        unit: "",
        direction: "lower",
        targetDate: "",
      });
      toast({ title: "Goal created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      return apiRequest("DELETE", `/api/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted" });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/goals/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated" });
    },
  });

  const biomarkerNames = biomarkerHistory ? Object.keys(biomarkerHistory) : [];
  
  const performanceAgeData = protocolHistory?.map(p => ({
    date: p.date ? format(new Date(p.date), "MMM d") : "Unknown",
    fullDate: p.date,
    age: p.performanceAge,
  })).reverse() || [];

  const getSelectedBiomarkerData = () => {
    if (!selectedBiomarker || !biomarkerHistory?.[selectedBiomarker]) return [];
    return biomarkerHistory[selectedBiomarker]
      .map(b => ({
        date: b.date ? format(new Date(b.date), "MMM d") : "Unknown",
        fullDate: b.date,
        value: b.value ? parseFloat(b.value) : 0,
      }))
      .reverse();
  };

  const getGoalProgress = (goal: Goal) => {
    const current = parseFloat(goal.currentValue || "0");
    const target = parseFloat(goal.targetValue || "0");
    
    if (goal.direction === "lower") {
      const startValue = current * 1.5;
      const progress = ((startValue - current) / (startValue - target)) * 100;
      return Math.min(100, Math.max(0, progress));
    } else {
      const progress = (current / target) * 100;
      return Math.min(100, Math.max(0, progress));
    }
  };

  const isLoading = loadingBiomarkers || loadingProtocols || loadingGoals;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-title">Progress Tracking</h1>
              <p className="text-muted-foreground">Monitor your health improvements over time</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Loading your progress...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Performance Age Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Performance Age Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {performanceAgeData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceAgeData}>
                        <defs>
                          <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="age" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorAge)" 
                          strokeWidth={2}
                          name="Performance Age"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Upload lab results to see your Performance Age over time</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Biomarker Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Biomarker Trends
                  </span>
                  <Select value={selectedBiomarker || ""} onValueChange={setSelectedBiomarker}>
                    <SelectTrigger className="w-[200px]" data-testid="select-biomarker">
                      <SelectValue placeholder="Select biomarker" />
                    </SelectTrigger>
                    <SelectContent>
                      {biomarkerNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBiomarker && getSelectedBiomarkerData().length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getSelectedBiomarkerData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                          name={selectedBiomarker}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{biomarkerNames.length > 0 
                        ? "Select a biomarker to view its trend" 
                        : "Upload multiple lab results to see trends"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Health Goals
                  </span>
                  <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-goal">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Health Goal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Biomarker Name</Label>
                          <Input
                            placeholder="e.g., CRP, Testosterone, HbA1c"
                            value={newGoal.biomarkerName}
                            onChange={(e) => setNewGoal({ ...newGoal, biomarkerName: e.target.value })}
                            data-testid="input-goal-biomarker"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Current Value</Label>
                            <Input
                              type="number"
                              placeholder="Current"
                              value={newGoal.currentValue}
                              onChange={(e) => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                              data-testid="input-goal-current"
                            />
                          </div>
                          <div>
                            <Label>Target Value</Label>
                            <Input
                              type="number"
                              placeholder="Target"
                              value={newGoal.targetValue}
                              onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                              data-testid="input-goal-target"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Unit</Label>
                            <Input
                              placeholder="mg/dL, ng/dL, etc."
                              value={newGoal.unit}
                              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                              data-testid="input-goal-unit"
                            />
                          </div>
                          <div>
                            <Label>Direction</Label>
                            <Select 
                              value={newGoal.direction} 
                              onValueChange={(v) => setNewGoal({ ...newGoal, direction: v })}
                            >
                              <SelectTrigger data-testid="select-goal-direction">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lower">Lower is better</SelectItem>
                                <SelectItem value="higher">Higher is better</SelectItem>
                                <SelectItem value="maintain">Maintain range</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Target Date (optional)</Label>
                          <Input
                            type="date"
                            value={newGoal.targetDate}
                            onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                            data-testid="input-goal-date"
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => createGoalMutation.mutate(newGoal)}
                          disabled={!newGoal.biomarkerName || !newGoal.targetValue || createGoalMutation.isPending}
                          data-testid="button-save-goal"
                        >
                          {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goals && goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div 
                        key={goal.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border"
                        data-testid={`goal-card-${goal.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{goal.biomarkerName}</span>
                            {goal.status === "achieved" ? (
                              <Badge variant="default" className="bg-green-500/20 text-green-400">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Achieved
                              </Badge>
                            ) : goal.status === "active" ? (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </Badge>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {goal.direction === "lower" ? (
                                <TrendingDown className="w-4 h-4 inline mr-1" />
                              ) : (
                                <TrendingUp className="w-4 h-4 inline mr-1" />
                              )}
                              {goal.currentValue || "?"} → {goal.targetValue} {goal.unit}
                            </span>
                            {goal.targetDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(goal.targetDate), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${getGoalProgress(goal)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {goal.status === "active" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateGoalMutation.mutate({ id: goal.id, status: "achieved" })}
                              data-testid={`button-complete-goal-${goal.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteGoalMutation.mutate(goal.id)}
                            data-testid={`button-delete-goal-${goal.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No goals set yet</p>
                    <p className="text-sm mt-2">Create a goal to track your health targets</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {protocolHistory?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Lab Reports Analyzed</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {biomarkerNames.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Biomarkers Tracked</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {goals?.filter(g => g.status === "achieved").length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Goals Achieved</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
