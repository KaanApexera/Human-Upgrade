import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Link2,
  RefreshCw,
  Unlink,
  Watch,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type { WearableConnection, User } from "@shared/schema";

interface ConnectionCardProps {
  provider: "oura" | "whoop" | "apple_health";
  title: string;
  description: string;
  icon: JSX.Element;
  connection?: WearableConnection;
  onConnect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
  isSyncing: boolean;
}

function ConnectionCard({
  provider,
  title,
  description,
  icon,
  connection,
  onConnect,
  onSync,
  onDisconnect,
  isConnecting,
  isSyncing,
}: ConnectionCardProps) {
  const isConnected = connection?.status === "connected";

  return (
    <Card data-testid={`card-connection-${provider}`}>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {isConnected ? (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Not Connected
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isConnected && connection?.lastSyncedAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            Last synced: {new Date(connection.lastSyncedAt).toLocaleString()}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {provider === "apple_health" ? (
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                To connect Apple Watch, install our iOS app and enable Apple Health permissions.
                The iOS app will sync your data to Human Upgrade.
              </p>
              {isConnected && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDisconnect}
                  data-testid={`button-disconnect-${provider}`}
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>
          ) : isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                data-testid={`button-sync-${provider}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDisconnect}
                data-testid={`button-disconnect-${provider}`}
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              data-testid={`button-connect-${provider}`}
            >
              <Link2 className="w-4 h-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const isPremium = user?.subscriptionPlan === "premium_monthly" || user?.subscriptionPlan === "premium_annual";

  // Redirect free tier users to pricing
  if (!userLoading && user && !isPremium) {
    return <Redirect to="/pricing" />;
  }

  const { data: connections, isLoading } = useQuery<WearableConnection[]>({
    queryKey: ["/api/integrations/connections"],
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");

    if (success) {
      toast({
        title: "Connected successfully",
        description: `${success.charAt(0).toUpperCase() + success.slice(1)} has been connected to your account.`,
      });
      window.history.replaceState({}, "", "/integrations");
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
    }

    if (error) {
      toast({
        title: "Connection failed",
        description: `Failed to connect. Please try again.`,
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/integrations");
    }
  }, [toast]);

  const handleConnectOura = () => {
    window.location.href = "/api/integrations/oura/connect";
  };

  const handleConnectWhoop = () => {
    window.location.href = "/api/integrations/whoop/connect";
  };

  const syncOura = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/integrations/oura/sync");
    },
    onSuccess: () => {
      toast({
        title: "Sync complete",
        description: "Oura data has been synced successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/insights"] });
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Failed to sync Oura data",
        variant: "destructive",
      });
    },
  });

  const syncWhoop = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/integrations/whoop/sync");
    },
    onSuccess: () => {
      toast({
        title: "Sync complete",
        description: "WHOOP data has been synced successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/insights"] });
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Failed to sync WHOOP data",
        variant: "destructive",
      });
    },
  });

  const disconnect = useMutation({
    mutationFn: async (provider: string) => {
      await apiRequest("DELETE", `/api/integrations/${provider}/disconnect`);
    },
    onSuccess: (_, provider) => {
      toast({
        title: "Disconnected",
        description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} has been disconnected`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
    },
    onError: () => {
      toast({
        title: "Disconnect failed",
        description: "Failed to disconnect device",
        variant: "destructive",
      });
    },
  });

  const getConnection = (provider: string) =>
    connections?.find(c => c.provider === provider);

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Watch className="w-5 h-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold">Device Integrations</h1>
            <p className="text-sm text-muted-foreground">
              Connect your wearable devices
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Connect Your Devices</h2>
            <p className="text-muted-foreground">
              Sync your sleep, HRV, recovery, and activity data to get personalized daily routines
              and optimization recommendations.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* WHOOP — pending partner approval */}
              <Card data-testid="card-connection-whoop">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">WHOOP</CardTitle>
                    <CardDescription>Recovery, strain, sleep, and heart rate data</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Coming Soon
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    WHOOP integration is currently awaiting partner approval. We'll notify you as soon as it's available.
                  </p>
                </CardContent>
              </Card>

              {/* Oura Ring — coming soon */}
              {/* Apple Health — coming soon */}
            </div>
          )}

          <Separator className="my-8" />

          <div>
            <h2 className="text-xl font-semibold mb-4">What You Get</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Smart Daily Routines</CardTitle>
                  <CardDescription>
                    Get personalized morning and evening routines based on your recovery and sleep data
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trend Analysis</CardTitle>
                  <CardDescription>
                    Track your HRV, sleep, and activity trends over time with insights
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Smart Exercise Recommendations</CardTitle>
                  <CardDescription>
                    Know when to push hard and when to recover based on your body's signals
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recovery Optimization</CardTitle>
                  <CardDescription>
                    Get recovery protocols tailored to your current state
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
