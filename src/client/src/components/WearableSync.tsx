import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Watch, 
  Smartphone, 
  Link2, 
  Unlink,
  CheckCircle,
  Clock,
  Activity,
  Heart,
  Moon,
  Zap,
  Lock,
  Sparkles
} from "lucide-react";

interface WearableDevice {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: Date;
  metrics: string[];
}

interface WearableSyncProps {
  isPremium?: boolean;
  devices?: WearableDevice[];
  onConnect?: (deviceId: string) => void;
  onDisconnect?: (deviceId: string) => void;
  onUpgrade?: () => void;
}

const DEFAULT_DEVICES: WearableDevice[] = [
  { 
    id: "whoop", 
    name: "WHOOP", 
    icon: "W",
    connected: false, 
    metrics: ["HRV", "Recovery", "Strain", "Sleep"] 
  },
  { 
    id: "oura", 
    name: "Oura Ring", 
    icon: "O",
    connected: false, 
    metrics: ["Sleep Score", "Readiness", "Activity", "HRV"] 
  },
  { 
    id: "apple_watch", 
    name: "Apple Watch", 
    icon: "\uF8FF",
    connected: false, 
    metrics: ["Heart Rate", "Steps", "Workouts", "Sleep"] 
  },
  { 
    id: "garmin", 
    name: "Garmin", 
    icon: "G",
    connected: false, 
    metrics: ["Training Load", "VO2 Max", "Sleep", "Stress"] 
  },
];

export function WearableSync({ 
  isPremium = false, 
  devices = DEFAULT_DEVICES,
  onConnect,
  onDisconnect,
  onUpgrade
}: WearableSyncProps) {
  const [syncEnabled, setSyncEnabled] = useState(true);

  if (!isPremium) {
    return (
      <Card className="glass-card border-white/10 relative overflow-hidden" data-testid="card-wearable-sync-locked">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="p-2 rounded-full bg-cyan-500/20">
            <Watch className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              Wearable Integration
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-4 opacity-50">
            {devices.slice(0, 4).map((device) => (
              <div 
                key={device.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                  {device.icon}
                </div>
                <span className="text-sm">{device.name}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col items-center py-4 text-center">
            <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Sync your wearable data to enhance protocol recommendations
            </p>
            <Button onClick={onUpgrade} className="gap-2" data-testid="button-upgrade-wearable">
              <Sparkles className="w-4 h-4" />
              Join VIP Waitlist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const connectedDevices = devices.filter(d => d.connected);

  return (
    <Card className="glass-card border-white/10" data-testid="card-wearable-sync">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-cyan-500/20">
            <Watch className="w-5 h-5 text-cyan-400" />
          </div>
          <CardTitle className="text-lg">Wearable Integration</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Auto-sync</span>
          <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedDevices.length > 0 && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">{connectedDevices.length} device(s) connected</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Last sync: 5 min ago</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {devices.map((device) => (
            <DeviceItem 
              key={device.id}
              device={device}
              onConnect={onConnect ? () => onConnect(device.id) : undefined}
              onDisconnect={onDisconnect ? () => onDisconnect(device.id) : undefined}
            />
          ))}
        </div>

        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-muted-foreground mb-2">Synced Metrics</p>
          <div className="flex flex-wrap gap-2">
            <MetricBadge icon={Heart} label="HRV" value="45ms" />
            <MetricBadge icon={Activity} label="Recovery" value="72%" />
            <MetricBadge icon={Moon} label="Sleep" value="7.2h" />
            <MetricBadge icon={Zap} label="Strain" value="12.4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeviceItem({ 
  device, 
  onConnect, 
  onDisconnect 
}: { 
  device: WearableDevice; 
  onConnect?: () => void; 
  onDisconnect?: () => void; 
}) {
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
      data-testid={`device-${device.id}`}
    >
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
        {device.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{device.name}</span>
          {device.connected && (
            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Connected</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {device.metrics.join(" · ")}
        </p>
      </div>

      {device.connected ? (
        <Button 
          size="sm" 
          variant="ghost"
          onClick={onDisconnect}
          className="gap-1 text-muted-foreground"
          data-testid={`button-disconnect-${device.id}`}
        >
          <Unlink className="w-3 h-3" />
          Disconnect
        </Button>
      ) : (
        <Button 
          size="sm" 
          variant="outline"
          onClick={onConnect}
          className="gap-1"
          data-testid={`button-connect-${device.id}`}
        >
          <Link2 className="w-3 h-3" />
          Connect
        </Button>
      )}
    </div>
  );
}

function MetricBadge({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
      <Icon className="w-3 h-3 text-cyan-400" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
