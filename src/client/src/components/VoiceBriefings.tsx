import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Volume2, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Clock,
  Mic,
  Sparkles,
  Lock
} from "lucide-react";

interface VoiceBriefingsProps {
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export function VoiceBriefings({ isPremium = false, onUpgrade }: VoiceBriefingsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const briefings = [
    { id: "morning", title: "Morning Optimization Brief", duration: "2:34", time: "7:00 AM" },
    { id: "protocol", title: "Protocol Reminder", duration: "1:15", time: "12:00 PM" },
    { id: "evening", title: "Evening Wind-Down", duration: "3:02", time: "9:00 PM" },
  ];

  if (!isPremium) {
    return (
      <Card className="glass-card border-white/10 relative overflow-hidden" data-testid="card-voice-briefings-locked">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="p-2 rounded-full bg-purple-500/20">
            <Mic className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              Voice Briefings
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-20">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Get daily audio summaries of your protocol and personalized optimization tips.
            </p>
            <Button onClick={onUpgrade} className="gap-2" data-testid="button-upgrade-voice">
              <Sparkles className="w-4 h-4" />
              Join VIP Waitlist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10" data-testid="card-voice-briefings">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-2 rounded-full bg-purple-500/20">
          <Mic className="w-5 h-5 text-purple-400" />
        </div>
        <CardTitle className="text-lg">Voice Briefings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium">Morning Optimization Brief</p>
              <p className="text-sm text-muted-foreground">Today's personalized summary</p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400">New</Badge>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              data-testid="button-play-briefing"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <div className="flex-1">
              <Slider 
                value={[progress]} 
                onValueChange={(v) => setProgress(v[0])} 
                max={100}
                className="cursor-pointer"
              />
            </div>
            <span className="text-xs text-muted-foreground">2:34</span>
          </div>
          
          <div className="flex items-center justify-between">
            <Button size="sm" variant="ghost" className="gap-1">
              <SkipBack className="w-4 h-4" />
              15s
            </Button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Volume2 className="w-4 h-4" />
              <Slider value={[80]} max={100} className="w-20" />
            </div>
            <Button size="sm" variant="ghost" className="gap-1">
              15s
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Scheduled Briefings</p>
          {briefings.map((briefing) => (
            <div 
              key={briefing.id}
              className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
              data-testid={`briefing-${briefing.id}`}
            >
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{briefing.title}</p>
                <p className="text-xs text-muted-foreground">{briefing.time}</p>
              </div>
              <span className="text-xs text-muted-foreground">{briefing.duration}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
