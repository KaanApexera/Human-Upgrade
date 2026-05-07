import { PDFParse } from "pdf-parse";
import { extractBiomarkersFromText } from "./openai";
import type { InsertBiomarker } from "@shared/schema";

interface ParseResult {
  text: string;
  pageCount: number;
  ocrUsed: boolean;
  biomarkers: InsertBiomarker[];
}

export async function parsePDF(
  buffer: Buffer,
  uploadId: string,
  userId: string
): Promise<ParseResult> {
  let text = "";
  let pageCount = 0;
  let ocrUsed = false;

  try {
    // Use PDFParse class from pdf-parse v2.x
    // Convert Node.js Buffer to Uint8Array for pdf-parse
    const uint8Array = new Uint8Array(buffer);
    const pdfParser = new PDFParse({ data: uint8Array });
    
    // Get text from all pages
    const textResult = await pdfParser.getText();
    text = textResult.pages.map((page) => page.text).join("\n") || "";
    pageCount = textResult.pages.length || 1;

    // Log extraction result
    console.log(`PDF parsed: ${pageCount} pages, ${text.length} characters extracted`);
    
    // If text is very short, log warning (OCR not supported for PDFs)
    if (text.trim().length < 100) {
      console.log("Warning: PDF text extraction yielded minimal content. This may be a scanned PDF.");
      console.log("Note: OCR for scanned PDFs is not currently supported. Please upload a text-based PDF.");
    }
  } catch (error: any) {
    console.error("PDF parse error:", error?.message || error);
    // Return empty result instead of crashing
    return {
      text: "",
      pageCount: 0,
      ocrUsed: false,
      biomarkers: [],
    };
  }

  // Extract biomarkers using regex first, then LLM for correction
  let biomarkers = extractBiomarkersWithRegex(text, uploadId, userId);

  // Use LLM for additional extraction and validation
  if (text.length > 50) {
    try {
      const llmBiomarkers = await extractBiomarkersFromText(text);
      
      // Merge regex and LLM results, preferring LLM values
      const mergedMap = new Map<string, InsertBiomarker>();
      
      for (const b of biomarkers) {
        mergedMap.set(b.name.toLowerCase(), b);
      }
      
      for (const b of llmBiomarkers) {
        mergedMap.set(b.name.toLowerCase(), {
          uploadId,
          userId,
          name: b.name,
          value: String(b.value),
          unit: b.unit,
          category: b.category,
          status: b.status,
        });
      }
      
      biomarkers = Array.from(mergedMap.values());
    } catch (error) {
      console.error("LLM biomarker extraction error:", error);
    }
  }

  return {
    text,
    pageCount,
    ocrUsed,
    biomarkers,
  };
}

function extractBiomarkersWithRegex(
  text: string,
  uploadId: string,
  userId: string
): InsertBiomarker[] {
  const biomarkers: InsertBiomarker[] = [];
  
  // Common biomarker patterns
  const patterns: Array<{
    regex: RegExp;
    name: string;
    unit: string;
    category: string;
  }> = [
    // Hormones
    { regex: /testosterone[:\s]+(\d+\.?\d*)\s*(ng\/dL|ng\/dl)?/i, name: "Testosterone", unit: "ng/dL", category: "hormone" },
    { regex: /free\s*testosterone[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml)?/i, name: "Free Testosterone", unit: "pg/mL", category: "hormone" },
    { regex: /shbg[:\s]+(\d+\.?\d*)\s*(nmol\/L|nmol\/l)?/i, name: "SHBG", unit: "nmol/L", category: "hormone" },
    { regex: /estradiol|e2[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml)?/i, name: "Estradiol", unit: "pg/mL", category: "hormone" },
    { regex: /\bLH[:\s]+(\d+\.?\d*)\s*(mIU\/mL|miu\/ml)?/i, name: "LH", unit: "mIU/mL", category: "hormone" },
    { regex: /\bFSH[:\s]+(\d+\.?\d*)\s*(mIU\/mL|miu\/ml)?/i, name: "FSH", unit: "mIU/mL", category: "hormone" },
    { regex: /\bDHT[:\s]+(\d+\.?\d*)\s*(ng\/dL|ng\/dl)?/i, name: "DHT", unit: "ng/dL", category: "hormone" },
    { regex: /prolactin[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml)?/i, name: "Prolactin", unit: "ng/mL", category: "hormone" },
    { regex: /\bTSH[:\s]+(\d+\.?\d*)\s*(mIU\/L|uIU\/mL)?/i, name: "TSH", unit: "mIU/L", category: "thyroid" },
    { regex: /free\s*T4[:\s]+(\d+\.?\d*)\s*(ng\/dL|ng\/dl)?/i, name: "Free T4", unit: "ng/dL", category: "thyroid" },
    { regex: /free\s*T3[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml)?/i, name: "Free T3", unit: "pg/mL", category: "thyroid" },
    { regex: /cortisol[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL)?/i, name: "Cortisol", unit: "ug/dL", category: "hormone" },
    { regex: /DHEA-?S[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL)?/i, name: "DHEA-S", unit: "ug/dL", category: "hormone" },
    { regex: /IGF-?1[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml)?/i, name: "IGF-1", unit: "ng/mL", category: "hormone" },

    // Metabolic
    { regex: /(?:fasting\s*)?glucose[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "Glucose", unit: "mg/dL", category: "metabolic" },
    { regex: /HbA1c|hemoglobin\s*A1c[:\s]+(\d+\.?\d*)\s*%?/i, name: "HbA1c", unit: "%", category: "metabolic" },
    { regex: /(?:fasting\s*)?insulin[:\s]+(\d+\.?\d*)\s*(uIU\/mL|uiu\/ml)?/i, name: "Insulin", unit: "uIU/mL", category: "metabolic" },

    // Inflammation
    { regex: /(?:hs-)?CRP[:\s]+(\d+\.?\d*)\s*(mg\/L|mg\/l)?/i, name: "CRP", unit: "mg/L", category: "inflammation" },
    { regex: /homocysteine[:\s]+(\d+\.?\d*)\s*(umol\/L|umol\/l)?/i, name: "Homocysteine", unit: "umol/L", category: "inflammation" },
    { regex: /ferritin[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml)?/i, name: "Ferritin", unit: "ng/mL", category: "inflammation" },
    { regex: /\bESR[:\s]+(\d+\.?\d*)\s*(mm\/hr)?/i, name: "ESR", unit: "mm/hr", category: "inflammation" },

    // Vitamins
    { regex: /vitamin\s*D|25-?OH\s*D[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml)?/i, name: "Vitamin D", unit: "ng/mL", category: "vitamin" },
    { regex: /vitamin\s*B12|B-?12[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml)?/i, name: "Vitamin B12", unit: "pg/mL", category: "vitamin" },
    { regex: /folate[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml)?/i, name: "Folate", unit: "ng/mL", category: "vitamin" },

    // Minerals
    { regex: /\biron[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL)?/i, name: "Iron", unit: "ug/dL", category: "mineral" },
    { regex: /magnesium[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "Magnesium", unit: "mg/dL", category: "mineral" },
    { regex: /zinc[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL)?/i, name: "Zinc", unit: "ug/dL", category: "mineral" },

    // Lipids
    { regex: /total\s*cholesterol[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "Total Cholesterol", unit: "mg/dL", category: "lipid" },
    { regex: /\bLDL[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "LDL", unit: "mg/dL", category: "lipid" },
    { regex: /\bHDL[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "HDL", unit: "mg/dL", category: "lipid" },
    { regex: /triglycerides[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "Triglycerides", unit: "mg/dL", category: "lipid" },

    // Liver
    { regex: /\bALT[:\s]+(\d+\.?\d*)\s*(U\/L|u\/l)?/i, name: "ALT", unit: "U/L", category: "liver" },
    { regex: /\bAST[:\s]+(\d+\.?\d*)\s*(U\/L|u\/l)?/i, name: "AST", unit: "U/L", category: "liver" },
    { regex: /\bGGT[:\s]+(\d+\.?\d*)\s*(U\/L|u\/l)?/i, name: "GGT", unit: "U/L", category: "liver" },
    { regex: /bilirubin[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "Bilirubin", unit: "mg/dL", category: "liver" },
    { regex: /albumin[:\s]+(\d+\.?\d*)\s*(g\/dL|g\/dl)?/i, name: "Albumin", unit: "g/dL", category: "liver" },

    // Kidney
    { regex: /creatinine[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "Creatinine", unit: "mg/dL", category: "kidney" },
    { regex: /\bBUN[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl)?/i, name: "BUN", unit: "mg/dL", category: "kidney" },
    { regex: /eGFR[:\s]+(\d+\.?\d*)\s*(mL\/min)?/i, name: "eGFR", unit: "mL/min", category: "kidney" },

    // Blood
    { regex: /hemoglobin(?!\s*A1c)[:\s]+(\d+\.?\d*)\s*(g\/dL|g\/dl)?/i, name: "Hemoglobin", unit: "g/dL", category: "blood" },
    { regex: /hematocrit[:\s]+(\d+\.?\d*)\s*%?/i, name: "Hematocrit", unit: "%", category: "blood" },
    { regex: /\bRBC[:\s]+(\d+\.?\d*)\s*(M\/uL)?/i, name: "RBC", unit: "M/uL", category: "blood" },
    { regex: /\bWBC[:\s]+(\d+\.?\d*)\s*(K\/uL)?/i, name: "WBC", unit: "K/uL", category: "blood" },
    { regex: /platelets?[:\s]+(\d+\.?\d*)\s*(K\/uL)?/i, name: "Platelets", unit: "K/uL", category: "blood" },
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (!isNaN(value)) {
        biomarkers.push({
          uploadId,
          userId,
          name: pattern.name,
          value: String(value),
          unit: pattern.unit,
          category: pattern.category,
        });
      }
    }
  }

  return biomarkers;
}
