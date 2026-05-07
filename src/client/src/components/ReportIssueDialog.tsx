import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle } from "lucide-react";

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocolId?: string;
}

const CATEGORIES = [
  { value: "inaccurate", label: "Inaccurate" },
  { value: "harmful", label: "Harmful" },
  { value: "confusing", label: "Confusing" },
  { value: "other", label: "Other" },
];

const SECTIONS = [
  { value: "supplements", label: "Supplements" },
  { value: "peptides", label: "Peptides" },
  { value: "workout", label: "Workout" },
  { value: "routines", label: "Routines" },
  { value: "hormones", label: "Hormones" },
  { value: "other", label: "Other" },
];

export function ReportIssueDialog({ open, onOpenChange, protocolId }: ReportIssueDialogProps) {
  const { toast } = useToast();
  const [category, setCategory] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/feedback", {
        category,
        sectionReported: section,
        description,
        protocolId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for reporting this issue. We'll review it shortly.",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCategory("");
    setSection("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    submitMutation.mutate();
  };

  const isFormValid = category && section && description.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-card border-card-border sm:max-w-md"
        data-testid="dialog-report-issue"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-red" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting any issues with your protocol recommendations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                id="category"
                data-testid="select-category"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem 
                    key={cat.value} 
                    value={cat.value}
                    data-testid={`select-category-${cat.value}`}
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger 
                id="section"
                data-testid="select-section"
              >
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((sec) => (
                  <SelectItem 
                    key={sec.value} 
                    value={sec.value}
                    data-testid={`select-section-${sec.value}`}
                  >
                    {sec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              data-testid="textarea-description"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || submitMutation.isPending}
              className="bg-brand-red hover:bg-brand-red/90"
              data-testid="button-submit-report"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
