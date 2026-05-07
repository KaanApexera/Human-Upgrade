import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTheme } from "@/components/ThemeProvider";

const tourSteps: Step[] = [
  {
    target: '[data-testid="card-performance-age"]',
    content: "Your Performance Age shows your biological age based on your biomarkers. This is the key metric that tells you how well your body is aging compared to your chronological age.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-testid="card-vital-energy"]',
    content: "The Vital Energy Index measures your overall energy levels based on metabolic markers, thyroid function, and mitochondrial health indicators.",
    placement: "bottom",
  },
  {
    target: '[data-testid="card-peptide-readiness"]',
    content: "Peptide Readiness evaluates which peptides may benefit you based on your biomarkers. Premium members get full access to personalized peptide protocols.",
    placement: "bottom",
  },
  {
    target: '[data-testid="card-hormone-status"]',
    content: "Your Hormone Status tracks key hormones like testosterone, estradiol, and SHBG. Optimal hormone levels are crucial for energy, mood, and performance.",
    placement: "bottom",
  },
  {
    target: '[data-testid="card-metabolic-status"]',
    content: "Metabolic Status monitors your glucose, insulin, and metabolic health markers. This helps identify insulin resistance and metabolic dysfunction early.",
    placement: "bottom",
  },
  {
    target: '[data-testid="card-inflammation"]',
    content: "The Inflammation panel tracks CRP, homocysteine, and other inflammatory markers. Chronic inflammation accelerates aging and disease risk.",
    placement: "bottom",
  },
  {
    target: '[data-testid="button-upload-document"]',
    content: "Upload your blood work here. We support PDFs and images from any lab. Your biomarkers will be extracted and analyzed automatically.",
    placement: "bottom",
  },
  {
    target: '[data-testid="button-generate-protocol"]',
    content: "After uploading your blood work, click here to generate your personalized health optimization protocol with peptides, supplements, and lifestyle recommendations.",
    placement: "bottom",
  },
];

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ run, onComplete }: OnboardingTourProps) {
  const { theme } = useTheme();
  const [stepIndex, setStepIndex] = useState(0);

  const handleCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete();
      localStorage.setItem("onboarding-completed", "true");
    }

    if (type === "step:after") {
      setStepIndex(index + 1);
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: "#DC2626",
          backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          textColor: theme === "dark" ? "#fafafa" : "#141414",
          arrowColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 8,
          padding: 16,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "#DC2626",
          borderRadius: 20,
          padding: "8px 16px",
        },
        buttonBack: {
          color: theme === "dark" ? "#a3a3a3" : "#666666",
        },
        buttonSkip: {
          color: theme === "dark" ? "#666666" : "#999999",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Got it!",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}
