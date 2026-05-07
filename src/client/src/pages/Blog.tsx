import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Clock, User, BookOpen, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: "1",
    title: "Understanding Your Testosterone Levels: A Complete Guide",
    excerpt: "Learn how to interpret your testosterone results and what optimal levels look like at different ages.",
    category: "Hormones",
    author: "Dr. Sarah Chen",
    readTime: "8 min read",
    date: "December 10, 2025",
    featured: true,
  },
  {
    id: "2",
    title: "The Science of BPC-157: Healing Peptide Explained",
    excerpt: "Discover how BPC-157 works at the cellular level and why it's become popular for tissue repair.",
    category: "Peptides",
    author: "Dr. Michael Ross",
    readTime: "12 min read",
    date: "December 8, 2025",
    featured: true,
  },
  {
    id: "3",
    title: "Optimizing Sleep for Maximum Recovery",
    excerpt: "Evidence-based strategies to improve your sleep quality and enhance your body's natural healing processes.",
    category: "Lifestyle",
    author: "Dr. Emily Watson",
    readTime: "6 min read",
    date: "December 5, 2025",
    featured: false,
  },
  {
    id: "4",
    title: "Zone 2 Cardio: The Foundation of Longevity Training",
    excerpt: "Why low-intensity cardio is crucial for metabolic health and how to implement it effectively.",
    category: "Exercise",
    author: "Coach James Miller",
    readTime: "10 min read",
    date: "December 3, 2025",
    featured: false,
  },
  {
    id: "5",
    title: "Inflammation Markers: What Your CRP Really Means",
    excerpt: "A deep dive into C-reactive protein and how to interpret inflammation markers in your blood work.",
    category: "Biomarkers",
    author: "Dr. Sarah Chen",
    readTime: "7 min read",
    date: "December 1, 2025",
    featured: false,
  },
  {
    id: "6",
    title: "NAD+ and Cellular Energy: The Key to Aging Well",
    excerpt: "Exploring the science behind NAD+ supplementation and its role in mitochondrial function.",
    category: "Supplements",
    author: "Dr. Robert Kim",
    readTime: "9 min read",
    date: "November 28, 2025",
    featured: false,
  },
  {
    id: "7",
    title: "Cold Exposure: Benefits, Risks, and Best Practices",
    excerpt: "Learn how to safely incorporate cold therapy into your routine for improved recovery and mood.",
    category: "Lifestyle",
    author: "Dr. Emily Watson",
    readTime: "8 min read",
    date: "November 25, 2025",
    featured: false,
  },
  {
    id: "8",
    title: "Metabolic Health: Beyond Just Blood Sugar",
    excerpt: "Understanding the interconnected markers of metabolic health and how to optimize them.",
    category: "Biomarkers",
    author: "Dr. Michael Ross",
    readTime: "11 min read",
    date: "November 22, 2025",
    featured: false,
  },
];

const categories = ["All", "Hormones", "Peptides", "Biomarkers", "Supplements", "Lifestyle", "Exercise"];

export default function Blog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

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
          <h1 className="font-heading text-4xl font-bold mb-2">Health Optimization Blog</h1>
          <p className="text-muted-foreground text-lg">
            Expert insights on biomarkers, peptides, hormones, and lifestyle optimization.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-brand-red hover:bg-brand-red/90" : ""}
                data-testid={`button-category-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="hover-elevate cursor-pointer" data-testid={`card-featured-${post.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-brand-red/20 text-brand-red">
                        Featured
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-brand-red">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-heading text-2xl font-bold mb-6">
            {selectedCategory === "All" ? "All Articles" : `${selectedCategory} Articles`}
          </h2>
          {regularPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <Card key={post.id} className="hover-elevate cursor-pointer" data-testid={`card-post-${post.id}`}>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{post.category}</Badge>
                    <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-heading text-xl font-semibold mb-2">No Articles Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or category filter.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
