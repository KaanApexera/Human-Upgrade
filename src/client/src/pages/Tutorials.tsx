import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, BookOpen, Dumbbell, Pill, Heart, Brain } from "lucide-react";

const tutorials = [
  {
    id: "1",
    title: "How to Read Your Blood Work Results",
    description: "A complete walkthrough of understanding biomarker results and what they mean for your health.",
    category: "Getting Started",
    duration: "15 min",
    thumbnail: "/api/placeholder/400/225",
    icon: BookOpen,
  },
  {
    id: "2",
    title: "Optimizing Your Morning Routine",
    description: "Build a science-backed morning routine for peak energy and mental clarity.",
    category: "Lifestyle",
    duration: "12 min",
    thumbnail: "/api/placeholder/400/225",
    icon: Brain,
  },
  {
    id: "3",
    title: "Peptide Protocols Explained",
    description: "Understanding BPC-157, TB-500, and other peptides for recovery and optimization.",
    category: "Peptides",
    duration: "20 min",
    thumbnail: "/api/placeholder/400/225",
    icon: Pill,
  },
  {
    id: "4",
    title: "Zone 2 Training Masterclass",
    description: "Learn how to implement zone 2 cardio for metabolic health and longevity.",
    category: "Exercise",
    duration: "18 min",
    thumbnail: "/api/placeholder/400/225",
    icon: Dumbbell,
  },
  {
    id: "5",
    title: "Hormone Optimization for Men",
    description: "Natural strategies to optimize testosterone and thyroid function.",
    category: "Hormones",
    duration: "22 min",
    thumbnail: "/api/placeholder/400/225",
    icon: Heart,
  },
  {
    id: "6",
    title: "Sleep Optimization Deep Dive",
    description: "Advanced strategies for improving sleep quality and recovery.",
    category: "Lifestyle",
    duration: "16 min",
    thumbnail: "/api/placeholder/400/225",
    icon: Brain,
  },
  {
    id: "7",
    title: "Understanding Inflammation Markers",
    description: "How to interpret CRP, homocysteine, and other inflammation indicators.",
    category: "Biomarkers",
    duration: "14 min",
    thumbnail: "/api/placeholder/400/225",
    icon: BookOpen,
  },
  {
    id: "8",
    title: "Building Your Supplement Stack",
    description: "Evidence-based approach to choosing and timing supplements.",
    category: "Supplements",
    duration: "17 min",
    thumbnail: "/api/placeholder/400/225",
    icon: Pill,
  },
];

const categories = ["All", "Getting Started", "Biomarkers", "Peptides", "Hormones", "Lifestyle", "Exercise", "Supplements"];

export default function Tutorials() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTutorials = selectedCategory === "All" 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory);

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
              <Link href="/login">
                <Button variant="outline" className="rounded-full" data-testid="button-login">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">Video Tutorials</h1>
          <p className="text-muted-foreground text-lg">
            Learn health optimization techniques from our expert-led video guides.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-brand-red hover:bg-brand-red/90" : ""}
              data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTutorials.map((tutorial) => {
            const Icon = tutorial.icon;
            return (
              <Card key={tutorial.id} className="hover-elevate cursor-pointer group" data-testid={`card-tutorial-${tutorial.id}`}>
                <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-red/20 to-transparent">
                    <Icon className="w-12 h-12 text-brand-red/50" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <div className="w-14 h-14 rounded-full bg-brand-red flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/70">{tutorial.duration}</Badge>
                </div>
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit mb-2">{tutorial.category}</Badge>
                  <CardTitle className="text-base leading-tight">{tutorial.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTutorials.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">No Tutorials Found</h3>
              <p className="text-muted-foreground">
                No tutorials available in this category yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
