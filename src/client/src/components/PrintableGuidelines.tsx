import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DosAndDonts {
  dos: {
    category: string;
    items: string[];
    priority: "high" | "medium" | "low";
  }[];
  donts: {
    category: string;
    items: string[];
    severity: "critical" | "important" | "caution";
  }[];
  generatedAt: string;
}

interface PrintableGuidelinesProps {
  existingData?: DosAndDonts | null;
  onClose?: () => void;
}

export function PrintableGuidelines({ existingData, onClose }: PrintableGuidelinesProps) {
  const [data, setData] = useState<DosAndDonts | null>(existingData || null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/protocol/dos-donts");
      return response.json();
    },
    onSuccess: (result) => {
      setData(result);
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "important": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "caution": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Health Optimization Guidelines</h2>
          <p className="text-muted-foreground">Personalized do's and don'ts based on your biomarkers</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-generate-guidelines"
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {data ? "Regenerate" : "Generate"}
          </Button>
          {data && (
            <Button onClick={handlePrint} data-testid="button-print-guidelines">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}
        </div>
      </div>

      {generateMutation.isError && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-red-500">Failed to generate guidelines. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!data && !generateMutation.isPending && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Click "Generate" to create personalized health guidelines based on your biomarker data.
            </p>
          </CardContent>
        </Card>
      )}

      {generateMutation.isPending && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-500" />
            <p className="text-muted-foreground">Analyzing your biomarkers and generating personalized guidelines...</p>
          </CardContent>
        </Card>
      )}

      {data && !generateMutation.isPending && (
        <div className="grid lg:grid-cols-2 gap-6 print:gap-4">
          <Card className="border-green-500/20 print:break-inside-avoid">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                DO's - Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.dos.map((category, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{category.category}</span>
                    <Badge variant="outline" className={getPriorityColor(category.priority)}>
                      {category.priority} priority
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 pl-4">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-red-500/20 print:break-inside-avoid">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-500">
                <XCircle className="h-5 w-5" />
                DON'Ts - Avoid These
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.donts.map((category, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{category.category}</span>
                    <Badge variant="outline" className={getSeverityColor(category.severity)}>
                      {category.severity}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 pl-4">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {data && (
        <p className="text-xs text-muted-foreground text-center print:text-left">
          Generated: {new Date(data.generatedAt).toLocaleDateString()} | 
          These recommendations are personalized based on your biomarker data. 
          Always consult with a healthcare provider before making changes.
        </p>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-guidelines, .printable-guidelines * {
            visibility: visible;
          }
          .printable-guidelines {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}