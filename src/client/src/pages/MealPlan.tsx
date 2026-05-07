import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Flame,
  Dumbbell,
  Target,
  Clock,
  Apple,
  Beef,
  Wheat,
  Droplets,
  Utensils,
  Coffee,
  Sun,
  Moon as MoonIcon,
} from "lucide-react";
import type { User } from "@shared/schema";

const mealPlanSchema = z.object({
  age: z.coerce.number().min(16, "Must be at least 16").max(100, "Must be under 100"),
  gender: z.enum(["male", "female"]),
  heightCm: z.coerce.number().min(100, "Must be at least 100cm").max(250, "Must be under 250cm"),
  weightKg: z.coerce.number().min(30, "Must be at least 30kg").max(300, "Must be under 300kg"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["fat_loss", "muscle_building", "body_recomposition"]),
});

type MealPlanFormData = z.infer<typeof mealPlanSchema>;

interface MealPlanResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: {
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    icon: typeof Coffee;
    suggestions: string[];
  }[];
}

function calculateMealPlan(data: MealPlanFormData): MealPlanResult {
  const { age, gender, heightCm, weightKg, activityLevel, goal } = data;

  const bmr = gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

  let targetCalories: number;
  let proteinMultiplier: number;
  let fatMultiplier: number;

  switch (goal) {
    case "fat_loss":
      targetCalories = Math.round(tdee * 0.8);
      proteinMultiplier = 2.2;
      fatMultiplier = 0.8;
      break;
    case "muscle_building":
      targetCalories = Math.round(tdee * 1.15);
      proteinMultiplier = 2.0;
      fatMultiplier = 1.0;
      break;
    case "body_recomposition":
      targetCalories = tdee;
      proteinMultiplier = 2.2;
      fatMultiplier = 0.9;
      break;
    default:
      targetCalories = tdee;
      proteinMultiplier = 1.8;
      fatMultiplier = 1.0;
  }

  const protein = Math.round(weightKg * proteinMultiplier);
  const fat = Math.round(weightKg * fatMultiplier);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.round(remainingCalories / 4);

  const mealDistribution = goal === "muscle_building"
    ? [0.25, 0.30, 0.25, 0.20]
    : [0.25, 0.35, 0.25, 0.15];

  const meals = [
    {
      name: "Breakfast",
      time: "7:00 - 8:00 AM",
      icon: Coffee,
      suggestions: goal === "fat_loss"
        ? ["Egg white omelette with vegetables", "Greek yogurt with berries", "Protein smoothie"]
        : ["Whole eggs with avocado toast", "Oatmeal with protein powder", "Egg and cheese sandwich"],
    },
    {
      name: "Lunch",
      time: "12:00 - 1:00 PM",
      icon: Sun,
      suggestions: goal === "fat_loss"
        ? ["Grilled chicken salad", "Turkey wrap with vegetables", "Lean beef stir-fry"]
        : ["Chicken breast with rice and vegetables", "Salmon with sweet potato", "Ground beef bowl with quinoa"],
    },
    {
      name: "Dinner",
      time: "6:00 - 7:00 PM",
      icon: MoonIcon,
      suggestions: goal === "fat_loss"
        ? ["Baked fish with steamed broccoli", "Grilled chicken with salad", "Lean steak with asparagus"]
        : ["Steak with mashed potatoes", "Chicken thighs with pasta", "Salmon with rice and vegetables"],
    },
    {
      name: "Snack",
      time: "3:00 - 4:00 PM",
      icon: Apple,
      suggestions: goal === "fat_loss"
        ? ["Protein shake", "Greek yogurt", "Cottage cheese with fruit"]
        : ["Protein shake with banana", "Nuts and dried fruit", "Peanut butter on rice cakes"],
    },
  ].map((meal, index) => ({
    ...meal,
    calories: Math.round(targetCalories * mealDistribution[index]),
    protein: Math.round(protein * mealDistribution[index]),
    carbs: Math.round(carbs * mealDistribution[index]),
    fat: Math.round(fat * mealDistribution[index]),
  }));

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    protein,
    carbs,
    fat,
    meals,
  };
}

export default function MealPlan() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const isPremium = user?.subscriptionPlan === "premium_monthly" || user?.subscriptionPlan === "premium_annual";

  const [result, setResult] = useState<MealPlanResult | null>(null);

  const form = useForm<MealPlanFormData>({
    resolver: zodResolver(mealPlanSchema),
    defaultValues: {
      age: 30,
      gender: "male",
      heightCm: 175,
      weightKg: 75,
      activityLevel: "moderate",
      goal: "body_recomposition",
    },
  });

  // Redirect free tier users to pricing
  if (!userLoading && user && !isPremium) {
    return <Redirect to="/pricing" />;
  }

  const handleSubmit = (data: MealPlanFormData) => {
    const mealPlan = calculateMealPlan(data);
    setResult(mealPlan);
  };

  const goalLabels: Record<string, { label: string; description: string; icon: typeof Flame }> = {
    fat_loss: {
      label: "Fat Loss",
      description: "Caloric deficit with high protein to preserve muscle",
      icon: Flame,
    },
    muscle_building: {
      label: "Muscle Building",
      description: "Caloric surplus with optimal protein for growth",
      icon: Dumbbell,
    },
    body_recomposition: {
      label: "Body Recomposition",
      description: "Maintain weight while building muscle and losing fat",
      icon: Target,
    },
  };

  const activityLabels: Record<string, string> = {
    sedentary: "Sedentary (little or no exercise)",
    light: "Light (1-3 days/week)",
    moderate: "Moderate (3-5 days/week)",
    active: "Active (6-7 days/week)",
    very_active: "Very Active (athlete/physical job)",
  };

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Utensils className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Meal Plan</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Personalized Meal Plan</h1>
          <p className="text-muted-foreground">
            Enter your details to get a customized nutrition plan based on your goals
          </p>
        </div>

        <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/80">
          <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
          <p>
            <strong className="text-amber-300">Educational purposes only.</strong> AI-generated meal plans are general guidance and not a substitute for personalized dietary advice from a registered dietitian or healthcare provider.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-red/10 rounded-lg">
                <Calculator className="w-5 h-5 text-brand-red" />
              </div>
              <h2 className="font-heading text-xl font-semibold">Your Information</h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="30"
                            data-testid="input-age"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="heightCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="175"
                            data-testid="input-height"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="75"
                            data-testid="input-weight"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-activity">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(activityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Goal</FormLabel>
                      <div className="grid gap-3">
                        {Object.entries(goalLabels).map(([value, { label, description, icon: Icon }]) => (
                          <div
                            key={value}
                            onClick={() => field.onChange(value)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${field.value === value
                                ? "border-brand-red bg-brand-red/10"
                                : "border-border hover-elevate"
                              }`}
                            data-testid={`goal-${value}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${field.value === value ? "bg-brand-red/20" : "bg-muted"
                                }`}>
                                <Icon className={`w-5 h-5 ${field.value === value ? "text-brand-red" : "text-muted-foreground"
                                  }`} />
                              </div>
                              <div>
                                <p className="font-medium">{label}</p>
                                <p className="text-sm text-muted-foreground">{description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-brand-red hover:bg-brand-red/90"
                  data-testid="button-calculate"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Generate Meal Plan
                </Button>
              </form>
            </Form>
          </Card>

          {result ? (
            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h2 className="font-heading text-xl font-semibold mb-4">Daily Targets</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">BMR</p>
                    <p className="text-2xl font-bold">{result.bmr}</p>
                    <p className="text-xs text-muted-foreground">kcal/day</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">TDEE</p>
                    <p className="text-2xl font-bold">{result.tdee}</p>
                    <p className="text-xs text-muted-foreground">kcal/day</p>
                  </div>
                </div>

                <div className="text-center p-6 bg-brand-red/10 rounded-lg border border-brand-red/20 mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Target Calories</p>
                  <p className="text-4xl font-heading font-bold text-brand-red">{result.targetCalories}</p>
                  <p className="text-sm text-muted-foreground">kcal/day</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Beef className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="text-lg font-bold">{result.protein}g</p>
                  </div>
                  <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="text-lg font-bold">{result.carbs}g</p>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Droplets className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="text-lg font-bold">{result.fat}g</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h2 className="font-heading text-xl font-semibold mb-4">Meal Structure</h2>

                <div className="space-y-4">
                  {result.meals.map((meal, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted/20 rounded-lg border border-border"
                      data-testid={`meal-${index}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-red/10 rounded-lg">
                            <meal.icon className="w-4 h-4 text-brand-red" />
                          </div>
                          <div>
                            <p className="font-semibold">{meal.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {meal.time}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{meal.calories} kcal</Badge>
                      </div>

                      <div className="flex gap-4 mb-3 text-sm">
                        <span className="text-blue-400">P: {meal.protein}g</span>
                        <span className="text-amber-400">C: {meal.carbs}g</span>
                        <span className="text-green-400">F: {meal.fat}g</span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Suggestions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {meal.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-6 bg-card border-border flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Your meal plan will appear here</p>
                <p className="text-sm">Fill in your details and click generate</p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
