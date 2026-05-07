import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  TrendingDown, 
  TrendingUp, 
  Quote,
  Activity,
  Zap,
  Heart,
  Brain
} from "lucide-react";

interface SuccessStory {
  id: string;
  initials: string;
  age: number;
  gender: string;
  goal: string;
  duration: string;
  beforeAge: number;
  afterAge: number;
  keyImprovements: {
    marker: string;
    before: string;
    after: string;
    improved: boolean;
  }[];
  testimonial: string;
  protocols: string[];
}

const successStories: SuccessStory[] = [
  {
    id: "1",
    initials: "M.K.",
    age: 42,
    gender: "Male",
    goal: "Optimize testosterone and energy",
    duration: "6 months",
    beforeAge: 51,
    afterAge: 38,
    keyImprovements: [
      { marker: "Total Testosterone", before: "320 ng/dL", after: "780 ng/dL", improved: true },
      { marker: "Free Testosterone", before: "8.2 pg/mL", after: "22.4 pg/mL", improved: true },
      { marker: "hsCRP", before: "4.2 mg/L", after: "0.8 mg/L", improved: true },
      { marker: "HbA1c", before: "5.9%", after: "5.1%", improved: true },
    ],
    testimonial: "I was skeptical at first, but after following the protocol for 6 months, my energy levels are through the roof. I'm sleeping better, my lifts are up 30%, and my wife says I'm like a different person. The Performance Age drop from 51 to 38 says it all.",
    protocols: ["TRT optimization", "BPC-157", "NAD+ therapy", "Comprehensive supplement stack"]
  },
  {
    id: "2",
    initials: "S.R.",
    age: 35,
    gender: "Female",
    goal: "Improve metabolic health and lose fat",
    duration: "4 months",
    beforeAge: 43,
    afterAge: 32,
    keyImprovements: [
      { marker: "Fasting Insulin", before: "18 uIU/mL", after: "4.2 uIU/mL", improved: true },
      { marker: "HbA1c", before: "5.8%", after: "5.0%", improved: true },
      { marker: "Body Fat", before: "32%", after: "22%", improved: true },
      { marker: "HDL Cholesterol", before: "42 mg/dL", after: "68 mg/dL", improved: true },
    ],
    testimonial: "After two pregnancies, my metabolism was completely off. Traditional diets never worked. The personalized protocol addressed my insulin resistance directly. I've lost 25 lbs of fat while gaining muscle, and my energy is better than in my 20s.",
    protocols: ["Metabolic optimization", "Time-restricted eating", "GLP-1 support", "Targeted supplements"]
  },
  {
    id: "3",
    initials: "J.T.",
    age: 55,
    gender: "Male",
    goal: "Longevity and cognitive function",
    duration: "8 months",
    beforeAge: 64,
    afterAge: 49,
    keyImprovements: [
      { marker: "Homocysteine", before: "16.2 umol/L", after: "7.8 umol/L", improved: true },
      { marker: "Vitamin D", before: "22 ng/mL", after: "65 ng/mL", improved: true },
      { marker: "hsCRP", before: "3.8 mg/L", after: "0.5 mg/L", improved: true },
      { marker: "Fasting Glucose", before: "108 mg/dL", after: "84 mg/dL", improved: true },
    ],
    testimonial: "At 55, I was worried about cognitive decline. My father had dementia, and I wanted to do everything possible to prevent it. The longevity protocol has been transformative. My focus is sharper than ever, my memory improved, and my biomarkers look 15 years younger.",
    protocols: ["Epithalon", "NAD+ optimization", "Methylation support", "Longevity stack"]
  },
  {
    id: "4",
    initials: "A.C.",
    age: 28,
    gender: "Male",
    goal: "Natural muscle gain without TRT",
    duration: "5 months",
    beforeAge: 34,
    afterAge: 25,
    keyImprovements: [
      { marker: "Total Testosterone", before: "420 ng/dL", after: "720 ng/dL", improved: true },
      { marker: "IGF-1", before: "145 ng/mL", after: "285 ng/mL", improved: true },
      { marker: "Cortisol", before: "24 ug/dL", after: "14 ug/dL", improved: true },
      { marker: "Sleep Quality", before: "Poor", after: "Excellent", improved: true },
    ],
    testimonial: "I wanted to optimize naturally without jumping on TRT at 28. The natural protocol focused on sleep, stress management, and targeted peptides. My testosterone nearly doubled, and I've put on 15 lbs of lean muscle. Best investment I've made.",
    protocols: ["Natural optimization", "Sermorelin", "Sleep protocol", "Stress management"]
  },
  {
    id: "5",
    initials: "L.M.",
    age: 48,
    gender: "Female",
    goal: "Hormone balance during perimenopause",
    duration: "6 months",
    beforeAge: 56,
    afterAge: 44,
    keyImprovements: [
      { marker: "FSH", before: "45 mIU/mL", after: "18 mIU/mL", improved: true },
      { marker: "Thyroid Function", before: "Suboptimal", after: "Optimal", improved: true },
      { marker: "Bone Density", before: "Osteopenia", after: "Normal", improved: true },
      { marker: "Energy Levels", before: "Low", after: "High", improved: true },
    ],
    testimonial: "Perimenopause hit me hard. Hot flashes, brain fog, weight gain despite exercising. My doctor just told me it was normal aging. Human Upgrade gave me a comprehensive protocol that addressed root causes. I feel like myself again, maybe even better.",
    protocols: ["Hormone optimization", "Thyroid support", "BPC-157", "Anti-aging stack"]
  },
];

export default function SuccessStories() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link href="/dashboard" className="cursor-pointer" data-testid="link-logo-home">
                <Logo size="md" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={() => setLocation("/register")}
                className="bg-brand-red hover:bg-brand-red/90 rounded-full"
                data-testid="button-get-started"
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading mb-4">Success Stories</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real results from real people. See how our personalized protocols have transformed lives.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All data anonymized with consent. Individual results may vary.
          </p>
        </div>

        <div className="grid gap-8">
          {successStories.map((story) => (
            <Card key={story.id} className="overflow-hidden" data-testid={`card-story-${story.id}`}>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{story.initials}</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{story.initials}, {story.age} - {story.gender}</CardTitle>
                      <p className="text-muted-foreground">{story.goal}</p>
                      <Badge variant="outline" className="mt-1">{story.duration}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 bg-card p-4 rounded-lg border border-border">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Performance Age</p>
                      <p className="text-2xl font-bold text-destructive">Before: {story.beforeAge}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-green-500" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Performance Age</p>
                      <p className="text-2xl font-bold text-green-500">After: {story.afterAge}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Key Biomarker Improvements
                    </h4>
                    <div className="space-y-3">
                      {story.keyImprovements.map((improvement, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="font-medium">{improvement.marker}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground line-through">{improvement.before}</span>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-green-500 font-semibold">{improvement.after}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Protocols Used
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {story.protocols.map((protocol, index) => (
                        <Badge key={index} variant="secondary">{protocol}</Badge>
                      ))}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                      <Quote className="w-5 h-5 text-primary mb-2" />
                      <p className="text-muted-foreground italic">"{story.testimonial}"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block p-8 bg-gradient-to-r from-primary/10 to-transparent">
            <h3 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl">
              Join thousands of high-performers who have optimized their biology with personalized protocols.
            </p>
            <Button
              size="lg"
              onClick={() => setLocation("/register")}
              className="bg-brand-red hover:bg-brand-red/90 rounded-full"
              data-testid="button-start-now"
            >
              Start Your Upgrade Today
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
