import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Copy,
  Gift,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Share2,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

interface Referral {
  id: string;
  referralCode: string;
  referredEmail: string | null;
  status: string;
  creditAmount: string;
  createdAt: string;
  convertedAt: string | null;
}

interface ReferralStats {
  totalReferrals: number;
  convertedReferrals: number;
  pendingReferrals: number;
  totalCredits: number;
  referralCode: string;
}

export default function Referrals() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState("");

  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/user"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referrals/stats"],
  });

  const { data: referrals = [], isLoading: referralsLoading } = useQuery<Referral[]>({
    queryKey: ["/api/referrals"],
  });

  const sendInviteMutation = useMutation({
    mutationFn: (email: string) => apiRequest("POST", "/api/referrals/invite", { email }),
    onSuccess: () => {
      toast({ title: "Invitation sent!", description: "Your friend will receive an email invitation." });
      setEmailInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
    },
    onError: () => {
      toast({ title: "Failed to send invitation", variant: "destructive" });
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const referralLink = `${window.location.origin}/register?ref=${stats?.referralCode || "loading"}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied to clipboard!", description: "Share this link with friends to earn credits." });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      sendInviteMutation.mutate(emailInput.trim());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "credited":
        return <Badge className="bg-green-500/20 text-green-500">Credited</Badge>;
      case "subscribed":
        return <Badge className="bg-blue-500/20 text-blue-500">Subscribed</Badge>;
      case "signed_up":
        return <Badge className="bg-yellow-500/20 text-yellow-500">Signed Up</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Gift className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Referral Program</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground">
            Invite friends and earn $4.99 credit when they subscribe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-brand-red/20">
                  <Users className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.totalReferrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Converted</p>
                  <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.convertedReferrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{statsLoading ? "-" : stats?.pendingReferrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-brand-red/20">
                  <DollarSign className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Earned</p>
                  <p className="text-2xl font-bold">${statsLoading ? "-" : stats?.totalCredits || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-brand-red" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="input-referral-link"
                />
                <Button
                  onClick={copyToClipboard}
                  className="bg-brand-red hover:bg-brand-red/90"
                  data-testid="button-copy-link"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Share this link with friends. When they sign up and subscribe, you get $4.99 credit!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-red" />
                Send Email Invitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  data-testid="input-invite-email"
                />
                <Button
                  type="submit"
                  disabled={sendInviteMutation.isPending || !emailInput.trim()}
                  className="bg-brand-red hover:bg-brand-red/90"
                  data-testid="button-send-invite"
                >
                  {sendInviteMutation.isPending ? "Sending..." : "Send Invite"}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-4">
                We'll send them a personalized invitation with your referral code.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-brand-red" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referralsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">No Referrals Yet</h3>
                <p className="text-muted-foreground">
                  Share your link above to start earning credits!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {referrals.map((referral) => (
                  <div key={referral.id} className="py-4 flex items-center justify-between gap-4" data-testid={`referral-${referral.id}`}>
                    <div>
                      <p className="font-medium">{referral.referredEmail || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {format(new Date(referral.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {parseFloat(referral.creditAmount) > 0 && (
                        <span className="text-green-500 font-semibold">${referral.creditAmount}</span>
                      )}
                      {getStatusBadge(referral.status || "pending")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
