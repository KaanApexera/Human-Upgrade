import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Pill,
  Target,
  Zap,
  X
} from "lucide-react";

interface SmartNotification {
  id: string;
  type: "improvement" | "alert" | "reminder" | "achievement" | "insight";
  title: string;
  message: string;
  action?: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
  icon: typeof Bell;
}

const NOTIFICATION_STYLES = {
  improvement: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-400" },
  alert: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400" },
  reminder: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "text-blue-400" },
  achievement: { bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "text-purple-400" },
  insight: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: "text-cyan-400" },
};

interface SmartNotificationsProps {
  notifications?: SmartNotification[];
  onDismiss?: (id: string) => void;
  onAction?: (id: string) => void;
}

const DEFAULT_NOTIFICATIONS: SmartNotification[] = [
  {
    id: "1",
    type: "improvement",
    title: "Testosterone Trending Up",
    message: "Your testosterone levels have improved 15% over the last 30 days. Keep up the great work!",
    timestamp: new Date(),
    priority: "medium",
    icon: TrendingUp,
  },
  {
    id: "2",
    type: "alert",
    title: "Vitamin D Below Optimal",
    message: "Your Vitamin D is at 28 ng/mL. Consider increasing supplementation to reach optimal levels (50-80 ng/mL).",
    action: "View Protocol",
    timestamp: new Date(Date.now() - 3600000),
    priority: "high",
    icon: AlertTriangle,
  },
  {
    id: "3",
    type: "reminder",
    title: "Retest Due in 2 Weeks",
    message: "Schedule your follow-up bloodwork to track progress and adjust protocols.",
    action: "Schedule Now",
    timestamp: new Date(Date.now() - 86400000),
    priority: "medium",
    icon: Calendar,
  },
  {
    id: "4",
    type: "insight",
    title: "Pattern Detected",
    message: "Your sleep quality correlates strongly with your HRV scores. Prioritizing sleep may accelerate recovery.",
    timestamp: new Date(Date.now() - 172800000),
    priority: "low",
    icon: Zap,
  },
];

export function SmartNotifications({ 
  notifications = DEFAULT_NOTIFICATIONS,
  onDismiss,
  onAction
}: SmartNotificationsProps) {
  const highPriorityCount = notifications.filter(n => n.priority === "high").length;

  return (
    <Card className="glass-card border-white/10" data-testid="card-smart-notifications">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-brand-red" />
            {highPriorityCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red rounded-full text-xs flex items-center justify-center text-white">
                {highPriorityCount}
              </span>
            )}
          </div>
          <CardTitle className="text-lg">Smart Insights</CardTitle>
        </div>
        <Badge variant="outline">{notifications.length} new</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss ? () => onDismiss(notification.id) : undefined}
            onAction={onAction ? () => onAction(notification.id) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function NotificationItem({ 
  notification, 
  onDismiss, 
  onAction 
}: { 
  notification: SmartNotification; 
  onDismiss?: () => void;
  onAction?: () => void;
}) {
  const styles = NOTIFICATION_STYLES[notification.type];
  const Icon = notification.icon;
  
  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <div 
      className={`relative p-3 rounded-lg ${styles.bg} border ${styles.border}`}
      data-testid={`notification-${notification.id}`}
    >
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded hover-elevate"
          data-testid={`button-dismiss-${notification.id}`}
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-full ${styles.bg}`}>
          <Icon className={`w-4 h-4 ${styles.icon}`} />
        </div>
        
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            {notification.priority === "high" && (
              <Badge className="bg-red-500/20 text-red-400 text-xs">Priority</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {notification.action && onAction && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onAction}
                className="text-xs"
                data-testid={`button-action-${notification.id}`}
              >
                {notification.action}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationBanner({ notification }: { notification: SmartNotification }) {
  const styles = NOTIFICATION_STYLES[notification.type];
  const Icon = notification.icon;

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg ${styles.bg} border ${styles.border}`}
      data-testid="notification-banner"
    >
      <Icon className={`w-5 h-5 ${styles.icon}`} />
      <div className="flex-1">
        <span className="font-medium text-sm">{notification.title}: </span>
        <span className="text-sm text-muted-foreground">{notification.message}</span>
      </div>
    </div>
  );
}
