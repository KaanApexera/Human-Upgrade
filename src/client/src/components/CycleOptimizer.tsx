import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  RefreshCw, 
  Loader2, 
  Syringe, 
  AlertTriangle, 
  Activity,
  Clock,
  Calendar,
  FileText,
  Shield,
  Info
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const peptideInfo: Record<string, { benefits: string; mechanism: string }> = {
  "BPC-157": {
    benefits: "Accelerates tissue healing, reduces inflammation, and supports gut health. Enhances recovery from injuries and surgeries.",
    mechanism: "Promotes angiogenesis and collagen synthesis while modulating growth hormone pathways."
  },
  "TB-500": {
    benefits: "Promotes muscle repair, reduces inflammation, and enhances flexibility. Supports recovery from muscle strains and tendon injuries.",
    mechanism: "Upregulates actin production for cell migration and tissue regeneration."
  },
  "Ipamorelin": {
    benefits: "Stimulates natural growth hormone release for fat loss, muscle gain, and improved sleep quality.",
    mechanism: "Selectively activates ghrelin receptors without affecting cortisol or prolactin levels."
  },
  "CJC-1295": {
    benefits: "Boosts growth hormone levels for enhanced recovery, body composition, and anti-aging effects.",
    mechanism: "Extended half-life GHRH analog that amplifies natural GH pulses."
  },
  "MK-677": {
    benefits: "Increases growth hormone and IGF-1 for improved sleep, recovery, and lean muscle mass.",
    mechanism: "Oral ghrelin mimetic that stimulates GH secretion without suppressing natural production."
  },
  "PT-141": {
    benefits: "Enhances libido and sexual function in both men and women.",
    mechanism: "Activates melanocortin receptors in the brain to improve sexual desire."
  },
  "Thymosin Alpha-1": {
    benefits: "Boosts immune function, reduces inflammation, and supports recovery from illness.",
    mechanism: "Modulates T-cell and dendritic cell activity for enhanced immune response."
  },
  "GHK-Cu": {
    benefits: "Promotes skin healing, collagen production, and has anti-aging properties for skin and hair.",
    mechanism: "Copper peptide that activates tissue remodeling and wound healing genes."
  },
  "Semax": {
    benefits: "Enhances cognitive function, focus, and memory. Supports neuroprotection and mood.",
    mechanism: "ACTH analog that modulates BDNF and dopamine/serotonin pathways."
  },
  "Selank": {
    benefits: "Reduces anxiety, improves mood, and enhances cognitive clarity without sedation.",
    mechanism: "Tuftsin analog that modulates GABA and serotonin for anxiolytic effects."
  },
  "DSIP": {
    benefits: "Promotes deep, restorative sleep and helps regulate sleep-wake cycles.",
    mechanism: "Delta sleep-inducing peptide that enhances slow-wave sleep architecture."
  },
  "Epithalon": {
    benefits: "Supports longevity by activating telomerase and protecting telomeres. Anti-aging benefits.",
    mechanism: "Stimulates pineal gland and telomerase production for cellular rejuvenation."
  },
  "AOD-9604": {
    benefits: "Promotes fat loss without affecting blood sugar or growth. Targets stubborn body fat.",
    mechanism: "Modified GH fragment that stimulates lipolysis without anabolic effects."
  },
  "Tesamorelin": {
    benefits: "Reduces visceral fat, improves body composition, and supports metabolic health.",
    mechanism: "GHRH analog that specifically targets abdominal adipose tissue."
  },
  "MOTS-c": {
    benefits: "Enhances metabolic function, exercise capacity, and cellular energy production.",
    mechanism: "Mitochondrial-derived peptide that activates AMPK for metabolic optimization."
  }
};

function getPeptideInfo(name: string): { benefits: string; mechanism: string } | null {
  const normalizedName = name.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  for (const [key, value] of Object.entries(peptideInfo)) {
    if (normalizedName.includes(key.toUpperCase().replace(/[^A-Z0-9-]/g, ''))) {
      return value;
    }
  }
  return null;
}

interface PeptideCycle {
  name: string;
  purpose: string;
  dosage: string;
  frequency: string;
  timing: string;
  cycleLength: string;
  notes: string[];
}

interface TRTProtocol {
  compound: string;
  dosage: string;
  frequency: string;
  timing: string;
  cycleLength: string;
  pctRequired: boolean;
  pctProtocol?: string;
  monitoring: string[];
}

interface BloodworkMonitoring {
  marker: string;
  frequency: string;
  targetRange: string;
}

interface CycleRecommendations {
  peptideCycles: PeptideCycle[];
  trtProtocol: TRTProtocol | null;
  safetyGuidelines: string[];
  bloodworkMonitoring: BloodworkMonitoring[];
  disclaimer: string;
  generatedAt: string;
}

interface CycleOptimizerProps {
  existingData?: CycleRecommendations | null;
  onClose?: () => void;
}

export function CycleOptimizer({ existingData, onClose }: CycleOptimizerProps) {
  const [data, setData] = useState<CycleRecommendations | null>(existingData || null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/protocol/cycle-optimizer");
      return response.json();
    },
    onSuccess: (result) => {
      setData(result);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Peptide & TRT Cycle Optimizer</h2>
          <p className="text-muted-foreground">Personalized dosing schedules based on your biomarkers</p>
        </div>
        <Button
          variant="outline"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-cycles"
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {data ? "Regenerate" : "Generate Recommendations"}
        </Button>
      </div>

      {generateMutation.isError && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-red-500">Failed to generate recommendations. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!data && !generateMutation.isPending && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Syringe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Click "Generate Recommendations" to create personalized peptide and hormone optimization protocols.
            </p>
            <p className="text-xs text-muted-foreground">
              Based on your biomarker data, fitness goals, and health profile.
            </p>
          </CardContent>
        </Card>
      )}

      {generateMutation.isPending && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-500" />
            <p className="text-muted-foreground">Analyzing your biomarkers and generating cycle recommendations...</p>
          </CardContent>
        </Card>
      )}

      {data && !generateMutation.isPending && (
        <div className="space-y-6">
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-red-500" />
                Peptide Cycles
              </CardTitle>
              <CardDescription>Recommended peptides based on your biomarker profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.peptideCycles.map((peptide, idx) => (
                <Card key={idx} className="bg-card/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{peptide.name}</h4>
                        {getPeptideInfo(peptide.name) && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                data-testid={`button-peptide-info-${idx}`}
                              >
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" side="top">
                              <div className="space-y-3">
                                <h5 className="font-semibold text-sm">What {peptide.name} Does</h5>
                                <p className="text-sm text-muted-foreground">
                                  {getPeptideInfo(peptide.name)?.benefits}
                                </p>
                                <div className="pt-2 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">How it works:</span>{" "}
                                    {getPeptideInfo(peptide.name)?.mechanism}
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0">{peptide.cycleLength}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{peptide.purpose}</p>
                    
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Dosage</p>
                          <p className="font-medium">{peptide.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Frequency</p>
                          <p className="font-medium">{peptide.frequency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Timing</p>
                          <p className="font-medium">{peptide.timing}</p>
                        </div>
                      </div>
                    </div>

                    {peptide.notes.length > 0 && (
                      <div className="mt-4 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Notes:</p>
                        <ul className="space-y-1">
                          {peptide.notes.map((note, noteIdx) => (
                            <li key={noteIdx} className="text-xs flex items-start gap-2">
                              <FileText className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {data.trtProtocol && (
            <Card className="border-yellow-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-yellow-500" />
                  TRT Protocol
                </CardTitle>
                <CardDescription>Testosterone optimization protocol (if indicated)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Compound</p>
                    <p className="font-medium">{data.trtProtocol.compound}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dosage</p>
                    <p className="font-medium">{data.trtProtocol.dosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                    <p className="font-medium">{data.trtProtocol.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timing</p>
                    <p className="font-medium">{data.trtProtocol.timing}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge variant={data.trtProtocol.pctRequired ? "destructive" : "secondary"}>
                    {data.trtProtocol.pctRequired ? "PCT Required" : "No PCT Needed (TRT)"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{data.trtProtocol.cycleLength}</span>
                </div>

                {data.trtProtocol.pctProtocol && (
                  <div className="p-3 bg-yellow-500/5 rounded-md border border-yellow-500/20 mb-4">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">PCT Protocol:</p>
                    <p className="text-sm">{data.trtProtocol.pctProtocol}</p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Monitoring Requirements:</p>
                  <ul className="space-y-1">
                    {data.trtProtocol.monitoring.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <Shield className="h-3 w-3 text-yellow-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Bloodwork Monitoring Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.bloodworkMonitoring.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2 py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{item.marker}</p>
                        <p className="text-xs text-muted-foreground">{item.frequency}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">{item.targetRange}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Safety Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.safetyGuidelines.map((guideline, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <Shield className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-500 mb-2">Medical Disclaimer</p>
                  <p className="text-sm text-muted-foreground">{data.disclaimer}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            Generated: {new Date(data.generatedAt).toLocaleDateString()} | 
            Recommendations are personalized to your biomarker profile. 
            Work with a qualified healthcare provider before starting any protocol.
          </p>
        </div>
      )}
    </div>
  );
}