import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  Lock,
  MapPin,
  Target,
  Zap,
  Trophy,
  Star,
  ArrowRight
} from "lucide-react";

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming" | "locked";
  weekNumber: number;
  icon: typeof CheckCircle;
}

interface ProtocolRoadmapProps {
  milestones?: RoadmapMilestone[];
  currentWeek?: number;
}

const DEFAULT_MILESTONES: RoadmapMilestone[] = [
  { id: "baseline", title: "Baseline Assessment", description: "Initial bloodwork analysis completed", status: "completed", weekNumber: 1, icon: MapPin },
  { id: "protocol_start", title: "Protocol Initiated", description: "Started personalized optimization protocol", status: "completed", weekNumber: 2, icon: Target },
  { id: "first_check", title: "First Check-in", description: "2-week progress evaluation", status: "current", weekNumber: 4, icon: Zap },
  { id: "optimization", title: "Optimization Phase", description: "Fine-tuning based on response", status: "upcoming", weekNumber: 8, icon: Star },
  { id: "mastery", title: "Mastery Achieved", description: "Optimal biomarker ranges reached", status: "locked", weekNumber: 12, icon: Trophy },
];

const STATUS_STYLES = {
  completed: { bg: "bg-emerald-500/20", border: "border-emerald-500/50", icon: "text-emerald-400", line: "bg-emerald-500" },
  current: { bg: "bg-blue-500/20", border: "border-blue-500/50", icon: "text-blue-400", line: "bg-blue-500" },
  upcoming: { bg: "bg-white/5", border: "border-white/20", icon: "text-muted-foreground", line: "bg-white/20" },
  locked: { bg: "bg-white/5", border: "border-white/10", icon: "text-muted-foreground/50", line: "bg-white/10" },
};

export function ProtocolRoadmap({ milestones = DEFAULT_MILESTONES, currentWeek = 3 }: ProtocolRoadmapProps) {
  return (
    <Card className="glass-card border-white/10" data-testid="card-protocol-roadmap">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-red" />
          Optimization Roadmap
        </CardTitle>
        <Badge variant="outline">Week {currentWeek}</Badge>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {milestones.map((milestone, index) => {
            const styles = STATUS_STYLES[milestone.status];
            const Icon = milestone.icon;
            const StatusIcon = milestone.status === "completed" ? CheckCircle : 
                               milestone.status === "locked" ? Lock : Circle;
            
            return (
              <div key={milestone.id} className="relative" data-testid={`roadmap-milestone-${milestone.id}`}>
                {index < milestones.length - 1 && (
                  <div 
                    className={`absolute left-5 top-12 w-0.5 h-12 ${styles.line}`}
                  />
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div className={`relative p-2.5 rounded-full ${styles.bg} border ${styles.border}`}>
                    <Icon className={`w-5 h-5 ${styles.icon}`} />
                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${styles.bg} border ${styles.border}`}>
                      <StatusIcon className={`w-3 h-3 ${styles.icon}`} />
                    </div>
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${milestone.status === "locked" ? "text-muted-foreground" : ""}`}>
                        {milestone.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Week {milestone.weekNumber}
                      </Badge>
                      {milestone.status === "current" && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="text-sm">
            <span className="text-muted-foreground">Next milestone in </span>
            <span className="font-semibold text-blue-400">1 week</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>View full journey</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MiniRoadmap({ currentPhase = 2, totalPhases = 5 }: { currentPhase?: number; totalPhases?: number }) {
  return (
    <div className="flex items-center gap-2" data-testid="mini-roadmap">
      {Array.from({ length: totalPhases }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div 
            className={`w-3 h-3 rounded-full ${
              i < currentPhase ? "bg-emerald-500" : 
              i === currentPhase ? "bg-blue-500" : "bg-white/20"
            }`}
          />
          {i < totalPhases - 1 && (
            <div className={`w-6 h-0.5 ${i < currentPhase ? "bg-emerald-500" : "bg-white/20"}`} />
          )}
        </div>
      ))}
      <span className="text-xs text-muted-foreground ml-2">Phase {currentPhase + 1}/{totalPhases}</span>
    </div>
  );
}
