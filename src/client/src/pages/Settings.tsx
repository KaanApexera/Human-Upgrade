import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download, Trash2, AlertTriangle, Watch, Unlink, Settings as SettingsIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { User, WearableConnection } from "@shared/schema";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wearableDeleteDialogOpen, setWearableDeleteDialogOpen] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: wearableConnections } = useQuery<WearableConnection[]>({
    queryKey: ["/api/integrations/connections"],
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/account/export", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "account-data.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export successful",
        description: "Your account data has been downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Failed to export your account data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/account", { confirmEmail });
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Deletion failed",
        description: "Failed to delete your account. Please verify your email and try again.",
        variant: "destructive",
      });
    },
  });

  const isEmailMatch = user?.email && confirmEmail.toLowerCase() === user.email.toLowerCase();

  const disconnectWearableMutation = useMutation({
    mutationFn: async (provider: string) => {
      await apiRequest("DELETE", `/api/integrations/${provider}/disconnect`);
    },
    onSuccess: () => {
      toast({
        title: "Device disconnected",
        description: "The wearable device has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
    },
    onError: () => {
      toast({
        title: "Disconnect failed",
        description: "Failed to disconnect device. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAllWearableDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/wearables/data/all");
    },
    onSuccess: () => {
      toast({
        title: "Data deleted",
        description: "All your wearable data has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wearables/insights"] });
      setWearableDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Deletion failed",
        description: "Failed to delete wearable data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (isEmailMatch) {
      deleteMutation.mutate();
      setDeleteDialogOpen(false);
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "oura": return "Oura Ring";
      case "whoop": return "WHOOP";
      case "apple_health": return "Apple Health";
      default: return provider;
    }
  };

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-settings-title">Account Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
              <CardDescription>
                Download a copy of all your account data including your profile, protocols, and biomarker history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                variant="outline"
                data-testid="button-export-data"
              >
                <Download className="w-4 h-4 mr-2" />
                {exportMutation.isPending ? "Exporting..." : "Export Account Data"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Watch className="w-5 h-5" />
                Wearable Data Privacy
              </CardTitle>
              <CardDescription>
                Manage your connected wearable devices and their data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wearableConnections && wearableConnections.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <Label>Connected Devices</Label>
                    {wearableConnections.map((conn) => (
                      <div key={conn.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <Watch className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{getProviderName(conn.provider)}</span>
                          <Badge variant={conn.status === "connected" ? "default" : "secondary"}>
                            {conn.status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnectWearableMutation.mutate(conn.provider)}
                          disabled={disconnectWearableMutation.isPending}
                          data-testid={`button-disconnect-${conn.provider}`}
                        >
                          <Unlink className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Delete all your wearable data including sleep, HRV, activity metrics, and generated routines.
                    </p>
                    <AlertDialog open={wearableDeleteDialogOpen} onOpenChange={setWearableDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-destructive border-destructive/50 hover:bg-destructive/10"
                          data-testid="button-delete-wearable-data"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete All Wearable Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete All Wearable Data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all your sleep, HRV, activity data, and generated daily routines from all connected devices. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-wearable-delete">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAllWearableDataMutation.mutate()}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteAllWearableDataMutation.isPending}
                            data-testid="button-confirm-wearable-delete"
                          >
                            {deleteAllWearableDataMutation.isPending ? "Deleting..." : "Delete All Data"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    No wearable devices connected. Connect a device to start tracking your health metrics.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation("/integrations")}
                    data-testid="button-go-to-integrations"
                  >
                    <Watch className="w-4 h-4 mr-2" />
                    Connect a Device
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-md">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-destructive mb-1">Warning: This action is permanent</p>
                  <p>
                    Deleting your account will permanently remove all your data including your profile,
                    uploaded documents, protocols, biomarker history, and subscription. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-email" data-testid="label-confirm-email">
                  Type your email to confirm: <span className="font-mono text-muted-foreground">{user?.email}</span>
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="Enter your email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  data-testid="input-confirm-email"
                />
              </div>

              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={!isEmailMatch}
                    data-testid="button-delete-account"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                      disabled={deleteMutation.isPending}
                      data-testid="button-confirm-delete"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
