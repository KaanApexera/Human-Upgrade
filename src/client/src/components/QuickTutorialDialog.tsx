import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Activity,
  ClipboardList,
  TrendingUp,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

interface QuickTutorialDialogProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    title: "Welcome to Human Upgrade! 🎉",
    description:
      "You're now part of the first 50 beta users. Here's how to get the most out of your membership in just 4 steps.",
    tip: null,
  },
  {
    icon: Upload,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
    title: "Step 1 — Upload Your Lab Results",
    description:
      'Click the "Upload Lab Results" button on your dashboard. You can upload a PDF or image of your blood test. Our AI will extract all biomarkers automatically.',
    tip: "Tip: Any standard blood panel works — from your doctor, a lab, or a home test kit.",
  },
  {
    icon: Activity,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    title: "Step 2 — See Your Performance Age™",
    description:
      "After upload, you'll get your biological age score based on your biomarkers. This tells you if your body is performing younger or older than your real age.",
    tip: "Tip: Most users are surprised — your biological age can differ by 5–15 years from your actual age.",
  },
  {
    icon: ClipboardList,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
    title: "Step 3 — Follow Your Protocol",
    description:
      "Your personalized protocol includes supplements, sleep recommendations, nutrition adjustments, and exercise guidance — all based on your specific biomarkers.",
    tip: "Tip: Start with the top 3 items in your protocol. Small consistent changes compound fast.",
  },
  {
    icon: TrendingUp,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/30",
    title: "Step 4 — Track & Improve",
    description:
      "Upload new labs every month to track how your biomarkers are improving. Your protocol updates automatically as your biology changes.",
    tip: "Tip: 30 days of following your protocol can measurably shift your Performance Age™ score.",
  },
];

export function QuickTutorialDialog({ open, onClose }: QuickTutorialDialogProps) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Quick Tutorial</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto ${current.bg}`}>
            <Icon className={`w-7 h-7 ${current.color}`} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-brand-red"
                    : i < step
                    ? "w-3 bg-brand-red/50"
                    : "w-3 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center space-y-2 px-2">
            <h3 className="font-heading text-lg font-bold text-foreground">
              {current.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>
            {current.tip && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground text-left">
                💡 {current.tip}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            {!isFirst && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-brand-red hover:bg-brand-red/90 rounded-full"
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Let's go!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
