import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Scale, Ruler, User, Target, Activity, Leaf } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  initialData?: {
    heightCm?: string;
    weightKg?: string;
    bodyFatPercent?: string;
    age?: number;
    gender?: string;
    fitnessGoal?: string;
    activityLevel?: string;
    naturalOnly?: boolean;
  };
}

export function QuestionnaireDialog({
  open,
  onOpenChange,
  onComplete,
  initialData,
}: QuestionnaireDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    heightCm: initialData?.heightCm || "",
    weightKg: initialData?.weightKg || "",
    bodyFatPercent: initialData?.bodyFatPercent || "",
    age: initialData?.age?.toString() || "",
    gender: initialData?.gender || "",
    fitnessGoal: initialData?.fitnessGoal || "",
    activityLevel: initialData?.activityLevel || "moderate",
    naturalOnly: initialData?.naturalOnly ?? false,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({
        heightCm: initialData?.heightCm || "",
        weightKg: initialData?.weightKg || "",
        bodyFatPercent: initialData?.bodyFatPercent || "",
        age: initialData?.age?.toString() || "",
        gender: initialData?.gender || "",
        fitnessGoal: initialData?.fitnessGoal || "",
        activityLevel: initialData?.activityLevel || "moderate",
        naturalOnly: initialData?.naturalOnly ?? false,
      });
    }
  }, [open, initialData]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBMI = () => {
    const height = parseFloat(formData.heightCm);
    const weight = parseFloat(formData.weightKg);
    if (height && weight) {
      const heightM = height / 100;
      return (weight / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { label: "Normal", color: "text-green-400" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const canProceedStep1 = Boolean(formData.heightCm && formData.weightKg && formData.age && formData.gender);
  const canProceedStep2 = Boolean(formData.fitnessGoal);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/user-metrics", {
        heightCm: parseFloat(formData.heightCm),
        weightKg: parseFloat(formData.weightKg),
        bodyFatPercent: formData.bodyFatPercent ? parseFloat(formData.bodyFatPercent) : null,
        age: parseInt(formData.age),
        gender: formData.gender,
        fitnessGoal: formData.fitnessGoal,
        activityLevel: formData.activityLevel,
        naturalOnly: formData.naturalOnly,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/user-metrics"] });
      
      toast({
        title: "Profile saved",
        description: "Your body metrics have been saved successfully.",
      });
      
      onComplete?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-card-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {step === 1 ? "Body Metrics" : "Fitness Goal"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1 
              ? "Help us personalize your protocol by entering your body measurements."
              : "What's your primary fitness goal?"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm text-muted-foreground flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.heightCm}
                    onChange={(e) => updateField("heightCm", e.target.value)}
                    className="bg-background border-border"
                    data-testid="input-height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm text-muted-foreground flex items-center gap-2">
                    <Scale className="w-4 h-4" /> Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="75"
                    value={formData.weightKg}
                    onChange={(e) => updateField("weightKg", e.target.value)}
                    className="bg-background border-border"
                    data-testid="input-weight"
                  />
                </div>
              </div>

              {bmi && bmiCategory && (
                <div className="p-3 rounded-md bg-muted/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your BMI:</span>
                  <span className={`font-semibold ${bmiCategory.color}`}>
                    {bmi} ({bmiCategory.label})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="35"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    className="bg-background border-border"
                    data-testid="input-age"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                    <SelectTrigger className="bg-background border-border" data-testid="select-gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyfat" className="text-sm text-muted-foreground">
                  Body Fat % (optional)
                </Label>
                <Input
                  id="bodyfat"
                  type="number"
                  placeholder="15"
                  value={formData.bodyFatPercent}
                  onChange={(e) => updateField("bodyFatPercent", e.target.value)}
                  className="bg-background border-border"
                  data-testid="input-bodyfat"
                />
                <p className="text-xs text-muted-foreground">If you don't know, leave blank and we'll estimate.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <RadioGroup
                value={formData.fitnessGoal}
                onValueChange={(v) => updateField("fitnessGoal", v)}
                className="space-y-3"
              >
                <div className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                  formData.fitnessGoal === "muscle_gain" 
                    ? "border-brand-red bg-brand-red/10" 
                    : "border-border hover:border-muted-foreground"
                }`}>
                  <RadioGroupItem value="muscle_gain" id="muscle_gain" className="mt-1" data-testid="radio-muscle-gain" />
                  <div>
                    <Label htmlFor="muscle_gain" className="font-medium text-foreground cursor-pointer">
                      Build Muscle
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Maximize muscle growth with caloric surplus, high protein, and progressive overload training.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                  formData.fitnessGoal === "fat_loss" 
                    ? "border-brand-red bg-brand-red/10" 
                    : "border-border hover:border-muted-foreground"
                }`}>
                  <RadioGroupItem value="fat_loss" id="fat_loss" className="mt-1" data-testid="radio-fat-loss" />
                  <div>
                    <Label htmlFor="fat_loss" className="font-medium text-foreground cursor-pointer">
                      Lose Fat
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Burn fat while preserving muscle with caloric deficit, high protein, and metabolic training.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                  formData.fitnessGoal === "body_recomp" 
                    ? "border-brand-red bg-brand-red/10" 
                    : "border-border hover:border-muted-foreground"
                }`}>
                  <RadioGroupItem value="body_recomp" id="body_recomp" className="mt-1" data-testid="radio-recomp" />
                  <div>
                    <Label htmlFor="body_recomp" className="font-medium text-foreground cursor-pointer">
                      Body Recomposition
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Simultaneously build muscle and lose fat with precise nutrition and balanced training.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-4 rounded-md border transition-colors ${
                  formData.fitnessGoal === "longevity" 
                    ? "border-brand-red bg-brand-red/10" 
                    : "border-border hover:border-muted-foreground"
                }`}>
                  <RadioGroupItem value="longevity" id="longevity" className="mt-1" data-testid="radio-longevity" />
                  <div>
                    <Label htmlFor="longevity" className="font-medium text-foreground cursor-pointer">
                      Longevity & Healthspan
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize for long-term health with anti-aging protocols, Zone 2 cardio, and cellular health focus.
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Activity Level
                </Label>
                <Select value={formData.activityLevel} onValueChange={(v) => updateField("activityLevel", v)}>
                  <SelectTrigger className="bg-background border-border" data-testid="select-activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job, little exercise)</SelectItem>
                    <SelectItem value="light">Light (1-2 days/week exercise)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-4 days/week exercise)</SelectItem>
                    <SelectItem value="active">Active (5-6 days/week exercise)</SelectItem>
                    <SelectItem value="very_active">Very Active (intense daily training)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-md border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <div>
                    <Label htmlFor="natural-only" className="font-medium text-foreground cursor-pointer">
                      Natural Only
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      No peptides, TRT, or performance-enhancing drugs
                    </p>
                  </div>
                </div>
                <Switch
                  id="natural-only"
                  checked={formData.naturalOnly}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, naturalOnly: checked }))}
                  data-testid="switch-natural-only"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 mt-6">
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={submitting}
              data-testid="button-back"
            >
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="bg-brand-red hover:bg-brand-red/90"
              data-testid="button-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedStep2 || submitting}
              className="bg-brand-red hover:bg-brand-red/90"
              data-testid="button-save-profile"
            >
              {submitting ? "Saving..." : "Save Profile"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
