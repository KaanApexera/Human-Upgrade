import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CreditCard,
  Upload,
  FileText,
  Shield,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FeedbackReport, BiomarkerDictionaryEntry } from "@shared/schema";

interface AdminMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  totalUploads: number;
  totalProtocols: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  planBreakdown: { trial: number; basic: number; premium_monthly: number; premium_annual: number };
  recentUsers: { id: string; name: string; email: string; plan: string; status: string; createdAt: string | null }[];
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackReport | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [biomarkerDialogOpen, setBiomarkerDialogOpen] = useState(false);
  const [editingBiomarker, setEditingBiomarker] = useState<BiomarkerDictionaryEntry | null>(null);
  const [biomarkerForm, setBiomarkerForm] = useState({
    name: "",
    aliases: "",
    category: "",
    unit: "",
    optimalRangeLow: "",
    optimalRangeHigh: "",
    description: "",
  });

  const { data: adminCheck, isLoading: adminCheckLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<AdminMetrics>({
    queryKey: ["/api/admin/metrics"],
    enabled: adminCheck?.isAdmin === true,
  });

  const { data: feedbackReports, isLoading: feedbackLoading } = useQuery<FeedbackReport[]>({
    queryKey: ["/api/admin/feedback"],
    enabled: adminCheck?.isAdmin === true,
  });

  const { data: biomarkerDictionary, isLoading: dictionaryLoading } = useQuery<BiomarkerDictionaryEntry[]>({
    queryKey: ["/api/admin/biomarker-dictionary"],
    enabled: adminCheck?.isAdmin === true,
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      apiRequest("PATCH", `/api/admin/feedback/${id}`, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      setFeedbackDialogOpen(false);
      setSelectedFeedback(null);
    },
  });

  const createBiomarkerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/biomarker-dictionary", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/biomarker-dictionary"] });
      setBiomarkerDialogOpen(false);
      resetBiomarkerForm();
    },
  });

  const updateBiomarkerMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      apiRequest("PATCH", `/api/admin/biomarker-dictionary/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/biomarker-dictionary"] });
      setBiomarkerDialogOpen(false);
      setEditingBiomarker(null);
      resetBiomarkerForm();
    },
  });

  const deleteBiomarkerMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/biomarker-dictionary/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/biomarker-dictionary"] });
    },
  });

  const resetBiomarkerForm = () => {
    setBiomarkerForm({
      name: "",
      aliases: "",
      category: "",
      unit: "",
      optimalRangeLow: "",
      optimalRangeHigh: "",
      description: "",
    });
  };

  const handleEditBiomarker = (entry: BiomarkerDictionaryEntry) => {
    setEditingBiomarker(entry);
    setBiomarkerForm({
      name: entry.name,
      aliases: entry.aliases?.join(", ") || "",
      category: entry.category,
      unit: entry.unit,
      optimalRangeLow: entry.optimalRangeLow || "",
      optimalRangeHigh: entry.optimalRangeHigh || "",
      description: entry.description || "",
    });
    setBiomarkerDialogOpen(true);
  };

  const handleSaveBiomarker = () => {
    const data = {
      name: biomarkerForm.name,
      aliases: biomarkerForm.aliases ? biomarkerForm.aliases.split(",").map((a) => a.trim()) : [],
      category: biomarkerForm.category,
      unit: biomarkerForm.unit,
      optimalRangeLow: biomarkerForm.optimalRangeLow || undefined,
      optimalRangeHigh: biomarkerForm.optimalRangeHigh || undefined,
      description: biomarkerForm.description || undefined,
    };

    if (editingBiomarker) {
      updateBiomarkerMutation.mutate({ id: editingBiomarker.id, ...data });
    } else {
      createBiomarkerMutation.mutate(data);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "reviewed":
        return "default";
      case "resolved":
        return "outline";
      case "dismissed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking access...</div>
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold mb-2" data-testid="text-access-denied">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-6">
              You do not have administrator privileges to access this page.
            </p>
            <Button onClick={() => setLocation("/dashboard")} data-testid="button-back-dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList data-testid="tabs-admin">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback" data-testid="tab-feedback">Feedback Reports</TabsTrigger>
            <TabsTrigger value="biomarkers" data-testid="tab-biomarkers">Biomarker Dictionary</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {metricsLoading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader>
                    <CardContent><Skeleton className="h-8 w-12" /></CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Total Users</CardTitle>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{metrics?.totalUsers ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">New Today</CardTitle>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-500">{metrics?.newUsersToday ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">This Week</CardTitle>
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{metrics?.newUsersThisWeek ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Active Subs</CardTitle>
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{metrics?.activeSubscriptions ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Uploads</CardTitle>
                      <Upload className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{metrics?.totalUploads ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">Protocols</CardTitle>
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{metrics?.totalProtocols ?? 0}</div></CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Plan breakdown */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Plan Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Trial", value: metrics.planBreakdown.trial, color: "text-yellow-500" },
                      { label: "Basic", value: metrics.planBreakdown.basic, color: "text-blue-500" },
                      { label: "Premium Monthly", value: metrics.planBreakdown.premium_monthly, color: "text-brand-red" },
                      { label: "Premium Annual", value: metrics.planBreakdown.premium_annual, color: "text-purple-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent signups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" /> Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(metrics?.recentUsers ?? []).map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.plan.startsWith("premium") ? "default" : "secondary"} className="text-xs">
                              {u.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium ${u.status === "active" ? "text-green-500" : u.status === "trial" ? "text-yellow-500" : "text-muted-foreground"}`}>
                              {u.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("tr-TR") : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Feedback Reports
                </CardTitle>
                <CardDescription>
                  Review and manage user feedback and issue reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : feedbackReports && feedbackReports.length > 0 ? (
                  <Table data-testid="table-feedback">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedbackReports.map((report) => (
                        <TableRow key={report.id} data-testid={`row-feedback-${report.id}`}>
                          <TableCell className="font-medium capitalize">
                            {report.category}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {report.description}
                          </TableCell>
                          <TableCell>{report.sectionReported || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(report.status || "pending")}
                              data-testid={`badge-status-${report.id}`}
                            >
                              {report.status || "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(report.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  data-testid={`button-feedback-actions-${report.id}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFeedback(report);
                                    setFeedbackDialogOpen(true);
                                  }}
                                >
                                  Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No feedback reports found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biomarkers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Biomarker Dictionary
                  </CardTitle>
                  <CardDescription>
                    Manage biomarker definitions and optimal ranges
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingBiomarker(null);
                    resetBiomarkerForm();
                    setBiomarkerDialogOpen(true);
                  }}
                  data-testid="button-add-biomarker"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </CardHeader>
              <CardContent>
                {dictionaryLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : biomarkerDictionary && biomarkerDictionary.length > 0 ? (
                  <Table data-testid="table-biomarkers">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Optimal Range</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {biomarkerDictionary.map((entry) => (
                        <TableRow key={entry.id} data-testid={`row-biomarker-${entry.id}`}>
                          <TableCell className="font-medium">{entry.name}</TableCell>
                          <TableCell className="capitalize">{entry.category}</TableCell>
                          <TableCell>{entry.unit}</TableCell>
                          <TableCell>
                            {entry.optimalRangeLow && entry.optimalRangeHigh
                              ? `${entry.optimalRangeLow} - ${entry.optimalRangeHigh}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditBiomarker(entry)}
                                data-testid={`button-edit-biomarker-${entry.id}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteBiomarkerMutation.mutate(entry.id)}
                                data-testid={`button-delete-biomarker-${entry.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No biomarker entries found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Feedback Status</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="capitalize">{selectedFeedback.category}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedFeedback.description}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={selectedFeedback.status || "pending"}
                  onValueChange={(value) => {
                    setSelectedFeedback({ ...selectedFeedback, status: value });
                  }}
                >
                  <SelectTrigger data-testid="select-feedback-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add notes about this feedback..."
                  defaultValue={selectedFeedback.adminNotes || ""}
                  onChange={(e) =>
                    setSelectedFeedback({ ...selectedFeedback, adminNotes: e.target.value })
                  }
                  data-testid="input-admin-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedFeedback) {
                  updateFeedbackMutation.mutate({
                    id: selectedFeedback.id,
                    status: selectedFeedback.status || "pending",
                    adminNotes: selectedFeedback.adminNotes || undefined,
                  });
                }
              }}
              disabled={updateFeedbackMutation.isPending}
              data-testid="button-save-feedback-status"
            >
              {updateFeedbackMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={biomarkerDialogOpen} onOpenChange={setBiomarkerDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBiomarker ? "Edit Biomarker Entry" : "Add Biomarker Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={biomarkerForm.name}
                onChange={(e) => setBiomarkerForm({ ...biomarkerForm, name: e.target.value })}
                placeholder="e.g., Testosterone"
                data-testid="input-biomarker-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aliases">Aliases (comma-separated)</Label>
              <Input
                id="aliases"
                value={biomarkerForm.aliases}
                onChange={(e) => setBiomarkerForm({ ...biomarkerForm, aliases: e.target.value })}
                placeholder="e.g., Total Testosterone, T"
                data-testid="input-biomarker-aliases"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={biomarkerForm.category}
                  onValueChange={(value) => setBiomarkerForm({ ...biomarkerForm, category: value })}
                >
                  <SelectTrigger data-testid="select-biomarker-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hormones">Hormones</SelectItem>
                    <SelectItem value="lipids">Lipids</SelectItem>
                    <SelectItem value="glucose">Glucose</SelectItem>
                    <SelectItem value="inflammation">Inflammation</SelectItem>
                    <SelectItem value="liver">Liver</SelectItem>
                    <SelectItem value="kidney">Kidney</SelectItem>
                    <SelectItem value="thyroid">Thyroid</SelectItem>
                    <SelectItem value="cbc">CBC</SelectItem>
                    <SelectItem value="vitamins">Vitamins</SelectItem>
                    <SelectItem value="minerals">Minerals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={biomarkerForm.unit}
                  onChange={(e) => setBiomarkerForm({ ...biomarkerForm, unit: e.target.value })}
                  placeholder="e.g., ng/dL"
                  data-testid="input-biomarker-unit"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optimalRangeLow">Optimal Range Low</Label>
                <Input
                  id="optimalRangeLow"
                  type="number"
                  value={biomarkerForm.optimalRangeLow}
                  onChange={(e) =>
                    setBiomarkerForm({ ...biomarkerForm, optimalRangeLow: e.target.value })
                  }
                  placeholder="e.g., 300"
                  data-testid="input-biomarker-range-low"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optimalRangeHigh">Optimal Range High</Label>
                <Input
                  id="optimalRangeHigh"
                  type="number"
                  value={biomarkerForm.optimalRangeHigh}
                  onChange={(e) =>
                    setBiomarkerForm({ ...biomarkerForm, optimalRangeHigh: e.target.value })
                  }
                  placeholder="e.g., 1000"
                  data-testid="input-biomarker-range-high"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={biomarkerForm.description}
                onChange={(e) =>
                  setBiomarkerForm({ ...biomarkerForm, description: e.target.value })
                }
                placeholder="Brief description of this biomarker..."
                data-testid="input-biomarker-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBiomarkerDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBiomarker}
              disabled={
                createBiomarkerMutation.isPending ||
                updateBiomarkerMutation.isPending ||
                !biomarkerForm.name ||
                !biomarkerForm.category ||
                !biomarkerForm.unit
              }
              data-testid="button-save-biomarker"
            >
              {createBiomarkerMutation.isPending || updateBiomarkerMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
