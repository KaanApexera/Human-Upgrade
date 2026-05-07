import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Quote, Star, ChevronLeft, ChevronRight, Award, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Practitioner {
  id: string;
  name: string;
  title: string;
  credentials: string[];
  specialty: string;
  quote: string;
  rating: number;
  initials: string;
}

const PRACTITIONERS: Practitioner[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "MD, Functional Medicine",
    credentials: ["Harvard Medical School", "IFM Certified"],
    specialty: "Hormone Optimization",
    quote: "Human Upgrade OS provides the most comprehensive biomarker analysis I've seen. It's become an essential tool in my practice for developing personalized protocols.",
    rating: 5,
    initials: "SC",
  },
  {
    id: "2",
    name: "Dr. Michael Torres",
    title: "DO, Sports Medicine",
    credentials: ["Johns Hopkins", "ACSM Fellow"],
    specialty: "Athletic Performance",
    quote: "The peptide recommendations and Performance Age calculations give my athletes actionable insights that translate directly to improved performance.",
    rating: 5,
    initials: "MT",
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    title: "PhD, Nutritional Biochemistry",
    credentials: ["Stanford", "Published Researcher"],
    specialty: "Metabolic Health",
    quote: "Finally, a platform that translates complex biomarker data into evidence-based protocols. The recommendations align perfectly with current research.",
    rating: 5,
    initials: "EW",
  },
  {
    id: "4",
    name: "Dr. James Park",
    title: "MD, Anti-Aging Medicine",
    credentials: ["A4M Board Certified", "Yale"],
    specialty: "Longevity Protocols",
    quote: "The comprehensive approach to longevity markers and personalized supplement stacks is exactly what the field needs. Highly recommended for serious practitioners.",
    rating: 5,
    initials: "JP",
  },
];

interface PractitionerEndorsementsProps {
  autoRotate?: boolean;
  rotationInterval?: number;
}

export function PractitionerEndorsements({ 
  autoRotate = true, 
  rotationInterval = 6000 
}: PractitionerEndorsementsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PRACTITIONERS.length);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval]);

  const currentPractitioner = PRACTITIONERS[currentIndex];

  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + PRACTITIONERS.length) % PRACTITIONERS.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % PRACTITIONERS.length);

  return (
    <Card 
      className="glass-card border-white/10 p-6 relative overflow-hidden"
      data-testid="card-practitioner-endorsements"
    >
      <div className="absolute top-4 right-4">
        <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/50">
          <Verified className="w-3 h-3" />
          Verified Practitioner
        </Badge>
      </div>

      <div className="flex items-start gap-4">
        <Quote className="w-8 h-8 text-brand-red opacity-50 flex-shrink-0" />
        
        <div className="flex-1">
          <p className="text-lg mb-6 italic text-foreground/90">
            "{currentPractitioner.quote}"
          </p>
          
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-brand-red/50">
              <AvatarFallback className="bg-brand-red/20 text-brand-red font-bold">
                {currentPractitioner.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{currentPractitioner.name}</h4>
                <div className="flex">
                  {Array.from({ length: currentPractitioner.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{currentPractitioner.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Award className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{currentPractitioner.specialty}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {currentPractitioner.credentials.map((cred) => (
              <Badge key={cred} variant="outline" className="text-xs">
                {cred}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        <div className="flex gap-1">
          {PRACTITIONERS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-brand-red w-4" : "bg-white/20"
              }`}
              data-testid={`endorsement-dot-${index}`}
            />
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={goToPrev} data-testid="button-prev-endorsement">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={goToNext} data-testid="button-next-endorsement">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function MiniEndorsement() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10" data-testid="mini-endorsement">
      <div className="flex -space-x-2">
        {PRACTITIONERS.slice(0, 3).map((p) => (
          <Avatar key={p.id} className="w-8 h-8 border-2 border-background">
            <AvatarFallback className="text-xs bg-brand-red/20 text-brand-red">
              {p.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-sm">
        <span className="font-medium">Trusted by 500+ practitioners</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span>4.9/5 rating</span>
        </div>
      </div>
    </div>
  );
}
