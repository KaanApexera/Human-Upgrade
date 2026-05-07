import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Users, Clock, Sparkles, CheckCircle } from "lucide-react";

interface VIPWaitlistProps {
  onJoinWaitlist?: (email: string) => void;
  waitlistCount?: number;
  spotsRemaining?: number;
  isJoined?: boolean;
}

export function VIPWaitlist({ 
  onJoinWaitlist, 
  waitlistCount = 2847, 
  spotsRemaining = 153,
  isJoined = false
}: VIPWaitlistProps) {
  const [email, setEmail] = useState("");
  const [displayCount, setDisplayCount] = useState(waitlistCount);
  const [joined, setJoined] = useState(isJoined);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setDisplayCount(prev => prev + 1);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = () => {
    if (email && onJoinWaitlist) {
      onJoinWaitlist(email);
      setJoined(true);
    }
  };

  return (
    <Card 
      className="relative overflow-hidden p-6 glass-card border-amber-500/30"
      style={{ boxShadow: "0 0 30px rgba(251, 191, 36, 0.15)" }}
      data-testid="card-vip-waitlist"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-bl-full" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">VIP Early Access</h3>
            <p className="text-sm text-muted-foreground">Exclusive features coming Q1 2025</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">On Waitlist</span>
            </div>
            <p className="text-2xl font-bold">{displayCount.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Spots Left</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{spotsRemaining}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Voice Briefings</span>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Wearable Integrations</span>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>1-on-1 Protocol Coaching</span>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
        </div>

        {joined ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm">You're on the list! We'll notify you when spots open.</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              data-testid="input-waitlist-email"
            />
            <Button 
              onClick={handleJoin}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold"
              data-testid="button-join-waitlist"
            >
              Join VIP
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3 text-center">
          VIP members get 50% off new features for life
        </p>
      </div>
    </Card>
  );
}

export function VIPBanner({ spotsRemaining = 153 }: { spotsRemaining?: number }) {
  return (
    <div 
      className="flex items-center justify-center gap-3 py-2 px-4 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border-y border-amber-500/30"
      data-testid="vip-banner"
    >
      <Crown className="w-4 h-4 text-amber-400" />
      <span className="text-sm">
        <strong className="text-amber-400">{spotsRemaining} spots</strong> remaining for VIP Early Access
      </span>
      <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400">
        Learn More
      </Button>
    </div>
  );
}
