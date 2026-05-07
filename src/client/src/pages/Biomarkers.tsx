import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Activity, 
  Droplets, 
  Heart, 
  Flame, 
  Brain,
  Pill,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText
} from "lucide-react";

interface BiomarkerInfo {
  name: string;
  category: string;
  description: string;
  optimalRange: string;
  unit: string;
  whyItMatters: string;
  howToImprove: string[];
  relatedMarkers: string[];
}

const biomarkerData: BiomarkerInfo[] = [
  {
    name: "Testosterone (Total)",
    category: "Hormones",
    description: "The primary male sex hormone responsible for muscle mass, bone density, libido, and energy levels.",
    optimalRange: "500-900 ng/dL",
    unit: "ng/dL",
    whyItMatters: "Low testosterone leads to fatigue, muscle loss, weight gain, depression, and reduced libido. Optimal levels support peak physical and mental performance.",
    howToImprove: [
      "Resistance training 3-4x per week",
      "Get 7-9 hours of quality sleep",
      "Maintain healthy body fat (10-20%)",
      "Reduce alcohol consumption",
      "Manage stress and cortisol levels",
      "Consider zinc and vitamin D supplementation"
    ],
    relatedMarkers: ["Free Testosterone", "SHBG", "Estradiol", "LH", "FSH"]
  },
  {
    name: "Free Testosterone",
    category: "Hormones",
    description: "The biologically active form of testosterone that is not bound to proteins and can enter cells.",
    optimalRange: "15-25 pg/mL",
    unit: "pg/mL",
    whyItMatters: "Free T is what your body actually uses. High total T with low free T means poor bioavailability and suboptimal hormonal function.",
    howToImprove: [
      "Lower SHBG through dietary changes",
      "Optimize total testosterone first",
      "Reduce excess body fat",
      "Avoid excessive alcohol",
      "Consider boron supplementation"
    ],
    relatedMarkers: ["Total Testosterone", "SHBG", "Albumin"]
  },
  {
    name: "Estradiol (E2)",
    category: "Hormones",
    description: "The primary form of estrogen. Important for bone health, cardiovascular function, and cognitive health in both men and women.",
    optimalRange: "20-35 pg/mL (men)",
    unit: "pg/mL",
    whyItMatters: "Too high causes water retention, mood issues, and gynecomastia. Too low leads to joint pain, low libido, and bone loss.",
    howToImprove: [
      "Maintain healthy body composition",
      "Limit alcohol consumption",
      "Eat cruciferous vegetables (DIM)",
      "Avoid xenoestrogens in plastics",
      "Consider zinc supplementation"
    ],
    relatedMarkers: ["Testosterone", "SHBG", "Prolactin"]
  },
  {
    name: "SHBG",
    category: "Hormones",
    description: "Sex Hormone Binding Globulin binds to sex hormones and regulates their bioavailability.",
    optimalRange: "20-50 nmol/L",
    unit: "nmol/L",
    whyItMatters: "High SHBG reduces free testosterone. Low SHBG may indicate insulin resistance or liver issues.",
    howToImprove: [
      "Address insulin resistance",
      "Optimize thyroid function",
      "Moderate protein intake",
      "Consider boron supplementation",
      "Maintain healthy liver function"
    ],
    relatedMarkers: ["Free Testosterone", "Estradiol", "Insulin"]
  },
  {
    name: "Glucose (Fasting)",
    category: "Metabolic",
    description: "Blood sugar level after 8-12 hours of fasting. Key indicator of metabolic health.",
    optimalRange: "70-90 mg/dL",
    unit: "mg/dL",
    whyItMatters: "Elevated fasting glucose indicates insulin resistance and increased diabetes risk. It accelerates aging and inflammation.",
    howToImprove: [
      "Reduce refined carbohydrate intake",
      "Exercise regularly (especially after meals)",
      "Improve sleep quality",
      "Consider berberine or metformin",
      "Practice time-restricted eating"
    ],
    relatedMarkers: ["HbA1c", "Insulin", "HOMA-IR"]
  },
  {
    name: "HbA1c",
    category: "Metabolic",
    description: "Glycated hemoglobin reflects average blood sugar over the past 2-3 months.",
    optimalRange: "4.5-5.3%",
    unit: "%",
    whyItMatters: "The gold standard for long-term glucose control. Higher levels correlate with accelerated aging and disease risk.",
    howToImprove: [
      "Maintain consistent blood sugar levels",
      "Reduce overall carbohydrate intake",
      "Regular physical activity",
      "Weight management",
      "Stress reduction"
    ],
    relatedMarkers: ["Fasting Glucose", "Insulin", "Triglycerides"]
  },
  {
    name: "Insulin (Fasting)",
    category: "Metabolic",
    description: "Hormone that regulates blood sugar. Elevated levels indicate insulin resistance.",
    optimalRange: "2-6 uIU/mL",
    unit: "uIU/mL",
    whyItMatters: "High insulin drives fat storage, inflammation, and accelerates aging. It's often elevated years before glucose rises.",
    howToImprove: [
      "Intermittent fasting",
      "Low-carb or ketogenic diet",
      "High-intensity interval training",
      "Build muscle mass",
      "Reduce stress"
    ],
    relatedMarkers: ["Glucose", "HOMA-IR", "Triglycerides"]
  },
  {
    name: "hsCRP",
    category: "Inflammation",
    description: "High-sensitivity C-Reactive Protein measures systemic inflammation.",
    optimalRange: "<1.0 mg/L",
    unit: "mg/L",
    whyItMatters: "Chronic inflammation accelerates aging, increases cardiovascular risk, and is linked to nearly all chronic diseases.",
    howToImprove: [
      "Anti-inflammatory diet (omega-3s, polyphenols)",
      "Regular exercise",
      "Optimize sleep",
      "Reduce visceral fat",
      "Consider fish oil or curcumin"
    ],
    relatedMarkers: ["Homocysteine", "Ferritin", "ESR"]
  },
  {
    name: "Homocysteine",
    category: "Inflammation",
    description: "Amino acid linked to cardiovascular disease and cognitive decline when elevated.",
    optimalRange: "<8 umol/L",
    unit: "umol/L",
    whyItMatters: "High homocysteine damages blood vessels, increases clot risk, and is associated with dementia and heart disease.",
    howToImprove: [
      "Methylated B-vitamins (B12, folate, B6)",
      "TMG/Betaine supplementation",
      "Reduce alcohol intake",
      "Address MTHFR mutations",
      "Eat leafy greens"
    ],
    relatedMarkers: ["B12", "Folate", "hsCRP"]
  },
  {
    name: "Ferritin",
    category: "Inflammation",
    description: "Iron storage protein. Can indicate iron status and inflammation.",
    optimalRange: "50-150 ng/mL",
    unit: "ng/mL",
    whyItMatters: "Low ferritin causes fatigue and anemia. High ferritin indicates iron overload or chronic inflammation, both accelerate aging.",
    howToImprove: [
      "Donate blood if elevated",
      "Reduce red meat if too high",
      "Supplement iron if deficient",
      "Check for hemochromatosis",
      "Address underlying inflammation"
    ],
    relatedMarkers: ["Iron", "TIBC", "hsCRP"]
  },
  {
    name: "Vitamin D (25-OH)",
    category: "Vitamins",
    description: "Essential hormone-like vitamin affecting bone health, immunity, and hormone production.",
    optimalRange: "50-70 ng/mL",
    unit: "ng/mL",
    whyItMatters: "Deficiency is linked to depression, low testosterone, weakened immunity, and increased disease risk.",
    howToImprove: [
      "Sun exposure 15-30 min daily",
      "Supplement D3 (1000-2000 IU/day)",
      "Take with K2 and fat for absorption",
      "Test regularly to optimize",
      "Consider higher doses if deficient"
    ],
    relatedMarkers: ["Calcium", "PTH", "Magnesium"]
  },
  {
    name: "Vitamin B12",
    category: "Vitamins",
    description: "Essential for nerve function, DNA synthesis, and energy production.",
    optimalRange: "500-900 pg/mL",
    unit: "pg/mL",
    whyItMatters: "Deficiency causes fatigue, brain fog, neuropathy, and elevated homocysteine. Common in vegetarians and older adults.",
    howToImprove: [
      "Eat animal products or supplement",
      "Use methylcobalamin form",
      "Check for absorption issues",
      "Consider sublingual or injection if low",
      "Address H. pylori if present"
    ],
    relatedMarkers: ["Folate", "Homocysteine", "MCV"]
  },
  {
    name: "TSH",
    category: "Thyroid",
    description: "Thyroid Stimulating Hormone indicates thyroid function status.",
    optimalRange: "0.5-2.0 mIU/L",
    unit: "mIU/L",
    whyItMatters: "High TSH suggests hypothyroidism (fatigue, weight gain, brain fog). Low TSH may indicate hyperthyroidism.",
    howToImprove: [
      "Address iodine and selenium status",
      "Reduce stress",
      "Optimize gut health",
      "Consider thyroid medication if needed",
      "Avoid goitrogens if hypothyroid"
    ],
    relatedMarkers: ["Free T4", "Free T3", "TPO Antibodies"]
  },
  {
    name: "LDL Cholesterol",
    category: "Lipids",
    description: "Low-density lipoprotein carries cholesterol through the bloodstream.",
    optimalRange: "<100 mg/dL",
    unit: "mg/dL",
    whyItMatters: "Elevated LDL, especially small dense particles, contributes to arterial plaque formation and cardiovascular disease.",
    howToImprove: [
      "Reduce saturated fat intake",
      "Increase fiber consumption",
      "Exercise regularly",
      "Consider plant sterols",
      "Omega-3 supplementation"
    ],
    relatedMarkers: ["HDL", "Triglycerides", "ApoB"]
  },
  {
    name: "HDL Cholesterol",
    category: "Lipids",
    description: "High-density lipoprotein removes cholesterol from arteries.",
    optimalRange: ">50 mg/dL",
    unit: "mg/dL",
    whyItMatters: "Higher HDL is protective against cardiovascular disease. Low HDL is a significant risk factor for heart disease.",
    howToImprove: [
      "Regular aerobic exercise",
      "Consume healthy fats (olive oil, avocado)",
      "Moderate alcohol consumption",
      "Stop smoking",
      "Consider niacin supplementation"
    ],
    relatedMarkers: ["LDL", "Triglycerides", "Total Cholesterol"]
  }
];

const categories = ["All", "Hormones", "Metabolic", "Inflammation", "Vitamins", "Thyroid", "Lipids"];

const categoryIcons: Record<string, typeof Activity> = {
  Hormones: Zap,
  Metabolic: Flame,
  Inflammation: Droplets,
  Vitamins: Pill,
  Thyroid: Brain,
  Lipids: Heart,
};

export default function Biomarkers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedMarker, setExpandedMarker] = useState<string | null>(null);

  const filteredBiomarkers = biomarkerData.filter((marker) => {
    const matchesSearch = marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || marker.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full">
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Biomarker Library</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Biomarker Library</h1>
          <p className="text-muted-foreground">
            Learn about the biomarkers we analyze and how to optimize each one for peak performance.
          </p>
        </div>

        <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/80">
          <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
          <p>
            <strong className="text-amber-300">Educational purposes only.</strong> The information in this library is not medical advice and should not replace consultation with a qualified healthcare provider. Always work with your doctor before making changes to your health routine.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search biomarkers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-biomarkers"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
                data-testid={`button-category-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredBiomarkers.map((marker) => {
            const isExpanded = expandedMarker === marker.name;
            const CategoryIcon = categoryIcons[marker.category] || Activity;

            return (
              <Card
                key={marker.name}
                className={`cursor-pointer transition-all ${isExpanded ? "ring-2 ring-primary" : ""}`}
                onClick={() => setExpandedMarker(isExpanded ? null : marker.name)}
                data-testid={`card-biomarker-${marker.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{marker.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {marker.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Optimal Range</p>
                      <p className="font-semibold text-primary">{marker.optimalRange}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4">{marker.description}</p>

                  {isExpanded && (
                    <div className="space-y-6 pt-4 border-t border-border animate-in fade-in duration-200">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Why It Matters
                        </h4>
                        <p className="text-muted-foreground">{marker.whyItMatters}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-500" />
                          How to Optimize
                        </h4>
                        <ul className="space-y-2">
                          {marker.howToImprove.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-muted-foreground">
                              <Minus className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Related Markers</h4>
                        <div className="flex flex-wrap gap-2">
                          {marker.relatedMarkers.map((related) => (
                            <Badge key={related} variant="secondary">
                              {related}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredBiomarkers.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No biomarkers found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
