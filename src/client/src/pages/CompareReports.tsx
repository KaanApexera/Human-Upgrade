import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import type { Biomarker, Upload, User } from "@shared/schema";
import { format } from "date-fns";

export default function CompareReports() {
  const [, setLocation] = useLocation();
  const [selectedUpload1, setSelectedUpload1] = useState<string>("");
  const [selectedUpload2, setSelectedUpload2] = useState<string>("");

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const isPremium = user?.subscriptionPlan === "premium_monthly" || user?.subscriptionPlan === "premium_annual";

  // Redirect free tier users to pricing
  if (!userLoading && user && !isPremium) {
    return <Redirect to="/pricing" />;
  }

  const { data: uploads = [], isLoading: uploadsLoading } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
  });

  interface BiomarkerResponse {
    biomarkers: Biomarker[];
    isLimited: boolean;
    totalCount: number;
    visibleCount: number;
  }

  const { data: biomarkerData1 } = useQuery<BiomarkerResponse>({
    queryKey: ["/api/biomarkers", selectedUpload1],
    enabled: !!selectedUpload1,
  });
  const biomarkers1 = biomarkerData1?.biomarkers || [];
  const isLimited1 = biomarkerData1?.isLimited || false;

  const { data: biomarkerData2 } = useQuery<BiomarkerResponse>({
    queryKey: ["/api/biomarkers", selectedUpload2],
    enabled: !!selectedUpload2,
  });
  const biomarkers2 = biomarkerData2?.biomarkers || [];
  const isLimited2 = biomarkerData2?.isLimited || false;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  const getChangeIndicator = (current: number, previous: number, direction: "higher" | "lower" | "maintain") => {
    const diff = current - previous;
    const percentChange = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : "N/A";

    if (Math.abs(diff) < 0.01) {
      return { icon: Minus, color: "text-muted-foreground", text: "No change" };
    }

    const isImprovement =
      (direction === "higher" && diff > 0) ||
      (direction === "lower" && diff < 0);

    return {
      icon: diff > 0 ? ArrowUp : ArrowDown,
      color: isImprovement ? "text-green-500" : "text-red-500",
      text: `${diff > 0 ? "+" : ""}${percentChange}%`,
    };
  };

  const allBiomarkerNames = Array.from(new Set([
    ...biomarkers1.map(b => b.name),
    ...biomarkers2.map(b => b.name),
  ])).sort();

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Compare Reports</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Compare Reports</h1>
          <p className="text-muted-foreground">
            Select two blood work reports to see how your biomarkers have changed over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">First Report (Earlier)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedUpload1} onValueChange={setSelectedUpload1}>
                <SelectTrigger data-testid="select-report-1">
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  {uploads.map((upload) => (
                    <SelectItem key={upload.id} value={upload.id}>
                      {upload.fileName} - {format(new Date(upload.uploadedAt!), "MMM d, yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Second Report (Later)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedUpload2} onValueChange={setSelectedUpload2}>
                <SelectTrigger data-testid="select-report-2">
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  {uploads.map((upload) => (
                    <SelectItem key={upload.id} value={upload.id}>
                      {upload.fileName} - {format(new Date(upload.uploadedAt!), "MMM d, yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {(isLimited1 || isLimited2) && (
          <Card className="mb-6 bg-brand-red/10 border-brand-red/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-red" />
                  <span className="text-sm">
                    Showing 3 of {biomarkerData1?.totalCount || biomarkerData2?.totalCount || "many"} biomarkers. Upgrade to Premium to see all.
                  </span>
                </div>
                <Link href="/subscribe">
                  <Button size="sm" className="bg-brand-red hover:bg-brand-red/90" data-testid="button-upgrade-compare">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedUpload1 && selectedUpload2 && allBiomarkerNames.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-red" />
                Biomarker Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Biomarker</th>
                      <th className="text-center py-3 px-4 font-medium">First Report</th>
                      <th className="text-center py-3 px-4 font-medium">Second Report</th>
                      <th className="text-center py-3 px-4 font-medium">Change</th>
                      <th className="text-center py-3 px-4 font-medium">Reference Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBiomarkerNames.map((name) => {
                      const bio1 = biomarkers1.find(b => b.name === name);
                      const bio2 = biomarkers2.find(b => b.name === name);
                      const val1 = bio1?.value ? parseFloat(bio1.value) : null;
                      const val2 = bio2?.value ? parseFloat(bio2.value) : null;

                      let change = null;
                      if (val1 !== null && val2 !== null) {
                        change = getChangeIndicator(val2, val1, "lower");
                      }

                      return (
                        <tr key={name} className="border-b border-border/50 hover-elevate" data-testid={`row-biomarker-${name}`}>
                          <td className="py-3 px-4 font-medium">{name}</td>
                          <td className="text-center py-3 px-4">
                            {val1 !== null ? (
                              <span className="font-mono">{val1.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                            {bio1?.unit && <span className="text-xs text-muted-foreground ml-1">{bio1.unit}</span>}
                          </td>
                          <td className="text-center py-3 px-4">
                            {val2 !== null ? (
                              <span className="font-mono">{val2.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                            {bio2?.unit && <span className="text-xs text-muted-foreground ml-1">{bio2.unit}</span>}
                          </td>
                          <td className="text-center py-3 px-4">
                            {change ? (
                              <div className={`flex items-center justify-center gap-1 ${change.color}`}>
                                <change.icon className="w-4 h-4" />
                                <span className="text-sm">{change.text}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4 text-sm text-muted-foreground">
                            {bio1?.referenceRangeLow && bio1?.referenceRangeHigh
                              ? `${bio1.referenceRangeLow} - ${bio1.referenceRangeHigh}`
                              : bio2?.referenceRangeLow && bio2?.referenceRangeHigh
                                ? `${bio2.referenceRangeLow} - ${bio2.referenceRangeHigh}`
                                : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">Select Reports to Compare</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {uploads.length < 2
                  ? "You need at least 2 uploaded reports to compare. Upload more blood work documents to track your progress over time."
                  : "Choose two reports above to see how your biomarkers have changed."}
              </p>
              {uploads.length < 2 && (
                <Button
                  className="mt-6 bg-brand-red hover:bg-brand-red/90 rounded-full"
                  onClick={() => setLocation("/dashboard")}
                  data-testid="button-go-dashboard"
                >
                  Go to Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
