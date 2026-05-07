import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";
import { extractBiomarkersFromText } from "./openai";
import type { InsertBiomarker } from "@shared/schema";

interface ParseResult {
  text: string;
  pageCount: number;
  ocrUsed: boolean;
  biomarkers: InsertBiomarker[];
}

const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
];

export function isImageFile(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.includes(mimeType.toLowerCase());
}

export function isPdfFile(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export async function parseDocument(
  buffer: Buffer,
  mimeType: string,
  uploadId: string,
  userId: string
): Promise<ParseResult> {
  if (isPdfFile(mimeType)) {
    return parsePDF(buffer, uploadId, userId);
  } else if (isImageFile(mimeType)) {
    return parseImage(buffer, uploadId, userId);
  } else {
    console.error(`Unsupported file type: ${mimeType}`);
    return {
      text: "",
      pageCount: 0,
      ocrUsed: false,
      biomarkers: [],
    };
  }
}

async function parsePDF(
  buffer: Buffer,
  uploadId: string,
  userId: string
): Promise<ParseResult> {
  let text = "";
  let pageCount = 0;

  try {
    const uint8Array = new Uint8Array(buffer);
    const pdfParser = new PDFParse({ data: uint8Array });
    
    const textResult = await pdfParser.getText();
    text = textResult.pages.map((page) => page.text).join("\n") || "";
    pageCount = textResult.pages.length || 1;

    console.log(`PDF parsed: ${pageCount} pages, ${text.length} characters extracted`);
    
    if (text.trim().length < 100) {
      console.log("Warning: PDF text extraction yielded minimal content. This may be a scanned PDF.");
    }
  } catch (error: any) {
    console.error("PDF parse error:", error?.message || error);
    return {
      text: "",
      pageCount: 0,
      ocrUsed: false,
      biomarkers: [],
    };
  }

  const biomarkers = await extractBiomarkers(text, uploadId, userId);

  return {
    text,
    pageCount,
    ocrUsed: false,
    biomarkers,
  };
}

// Supported OCR languages with their Tesseract codes
// Full set: English, Spanish, Turkish, French, German, Japanese, Chinese, Portuguese, Danish, Finnish, Norwegian
const FULL_LANGUAGE_SET = "eng+spa+tur+fra+deu+jpn+chi_sim+por+dan+fin+nor";
// Latin languages only (faster, for fallback)
const LATIN_LANGUAGE_SET = "eng+spa+tur+fra+deu+por+dan+fin+nor";
// Minimal fallback
const MINIMAL_LANGUAGE_SET = "eng";

async function performOCR(buffer: Buffer, languages: string): Promise<string> {
  const result = await Tesseract.recognize(buffer, languages, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        console.log(`OCR progress: ${Math.round((m.progress || 0) * 100)}%`);
      }
    },
  });
  return result.data.text || "";
}

async function parseImage(
  buffer: Buffer,
  uploadId: string,
  userId: string
): Promise<ParseResult> {
  let text = "";

  try {
    console.log("Starting OCR for image with multi-language support...");
    
    // Try full language set first (includes Asian languages)
    // Falls back to Latin-only, then English-only if language data is unavailable
    try {
      text = await performOCR(buffer, FULL_LANGUAGE_SET);
      console.log("OCR completed with full language set (11 languages)");
    } catch (fullError: any) {
      console.log("Full language set unavailable, trying Latin languages only...");
      try {
        text = await performOCR(buffer, LATIN_LANGUAGE_SET);
        console.log("OCR completed with Latin language set (9 languages)");
      } catch (latinError: any) {
        console.log("Latin language set unavailable, falling back to English-only...");
        text = await performOCR(buffer, MINIMAL_LANGUAGE_SET);
        console.log("OCR completed with English only");
      }
    }
    
    console.log(`OCR complete: ${text.length} characters extracted`);
    
    if (text.trim().length < 50) {
      console.log("Warning: OCR yielded minimal text. Image may be low quality or not contain readable text.");
    }
  } catch (error: any) {
    console.error("OCR error:", error?.message || error);
    return {
      text: "",
      pageCount: 0,
      ocrUsed: true,
      biomarkers: [],
    };
  }

  const biomarkers = await extractBiomarkers(text, uploadId, userId);

  return {
    text,
    pageCount: 1,
    ocrUsed: true,
    biomarkers,
  };
}

async function extractBiomarkers(
  text: string,
  uploadId: string,
  userId: string
): Promise<InsertBiomarker[]> {
  let biomarkers = extractBiomarkersWithRegex(text, uploadId, userId);

  if (text.length > 50) {
    try {
      const llmBiomarkers = await extractBiomarkersFromText(text);
      
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

  return biomarkers;
}

function extractBiomarkersWithRegex(
  text: string,
  uploadId: string,
  userId: string
): InsertBiomarker[] {
  const biomarkers: InsertBiomarker[] = [];
  
  // Multi-language biomarker patterns
  // Supports: English, Spanish, Turkish, French, German, Japanese, Chinese, Portuguese, Danish, Finnish, Norwegian
  const patterns: Array<{
    regex: RegExp;
    name: string;
    unit: string;
    category: string;
  }> = [
    // HORMONES - Multi-language patterns
    // Testosterone: EN, ES (testosterona), DE (testosteron), FR (testostérone), PT (testosterona), TR (testosteron)
    { regex: /(?:testosterone|testosterona|testosteron|testostérone)[:\s]+(\d+\.?\d*)\s*(ng\/dL|ng\/dl|ng\/ml)?/i, name: "Testosterone", unit: "ng/dL", category: "hormone" },
    { regex: /(?:testosteron|testosterona)\s*total[:\s]+(\d+\.?\d*)\s*(ng\/ml|ng\/dL)?/i, name: "Testosterone", unit: "ng/mL", category: "hormone" },
    { regex: /free\s*testosterone|testosterona\s*libre|freies\s*testosteron[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml)?/i, name: "Free Testosterone", unit: "pg/mL", category: "hormone" },
    { regex: /shbg[:\s]+(\d+\.?\d*)\s*(nmol\/L|nmol\/l)?/i, name: "SHBG", unit: "nmol/L", category: "hormone" },
    // Estradiol: EN, ES, DE (Östradiol), FR (œstradiol), PT
    { regex: /(?:estradiol|[öœo]stradiol|e2)[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml|pmol\/l)?/i, name: "Estradiol", unit: "pg/mL", category: "hormone" },
    { regex: /\bLH[:\s]+(\d+\.?\d*)\s*(mIU\/mL|miu\/ml|U\/L)?/i, name: "LH", unit: "mIU/mL", category: "hormone" },
    { regex: /\bFSH[:\s]+(\d+\.?\d*)\s*(mIU\/mL|miu\/ml|U\/L)?/i, name: "FSH", unit: "mIU/mL", category: "hormone" },
    { regex: /\bDHT[:\s]+(\d+\.?\d*)\s*(ng\/dL|ng\/dl)?/i, name: "DHT", unit: "ng/dL", category: "hormone" },
    // Prolactin: EN, ES (prolactina), DE (prolaktin), FR (prolactine), TR (prolaktin), PT
    { regex: /(?:prolactin|prolactina|prolaktin|prolactine|prolakt[iİ]n)[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml|mU\/L)?/i, name: "Prolactin", unit: "ng/mL", category: "hormone" },
    { regex: /\bTSH[:\s]+(\d+\.?\d*)\s*(mIU\/L|uIU\/mL|uIU\/ml|mU\/L)?/i, name: "TSH", unit: "mIU/L", category: "thyroid" },
    { regex: /(?:free\s*T4|FT4|T4\s*libre|T4\s*frei)[:\s]+(\d+\.?\d*)\s*(ng\/dL|ng\/dl|pmol\/l)?/i, name: "Free T4", unit: "ng/dL", category: "thyroid" },
    { regex: /(?:free\s*T3|FT3|T3\s*libre|T3\s*frei)[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml|pmol\/l)?/i, name: "Free T3", unit: "pg/mL", category: "thyroid" },
    // Cortisol: EN, ES, DE (Kortisol), FR, PT, DA/NO/FI (kortisol)
    { regex: /(?:cortisol|kortisol)[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL|nmol\/l)?/i, name: "Cortisol", unit: "ug/dL", category: "hormone" },
    { regex: /DHEA-?S[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL|umol\/l)?/i, name: "DHEA-S", unit: "ug/dL", category: "hormone" },
    { regex: /IGF-?1[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml)?/i, name: "IGF-1", unit: "ng/mL", category: "hormone" },

    // METABOLIC - Multi-language patterns
    // Glucose: EN, ES (glucosa), DE (glukose/blutzucker), FR (glycémie), PT (glicose), TR (kan şekeri), DA/NO (blodsukker), FI (verensokeri)
    { regex: /(?:glucose|glucosa|glukose|glyc[eé]mie|glicose|blutzucker|blodsukker|verensokeri|kan\s*[sşŞ]eker[iİ])[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|mmol\/l)?/i, name: "Glucose", unit: "mg/dL", category: "metabolic" },
    { regex: /HbA1c|hemoglobin\s*A1c|h[eé]moglobin[ae]?\s*glyqu[eé]e?[:\s]+(\d+\.?\d*)\s*%?/i, name: "HbA1c", unit: "%", category: "metabolic" },
    // Insulin: EN, ES (insulina), DE, FR (insuline), PT, TR (insülin), DA/NO/FI
    { regex: /(?:insulin|insulina|insuline|[iİ]ns[uü]l[iİ]n)[:\s]+(\d+\.?\d*)\s*(uIU\/mL|uiu\/ml|pmol\/l|mU\/L)?/i, name: "Insulin", unit: "uIU/mL", category: "metabolic" },
    { regex: /homa[:\s-]*(?:ir|[iİ]ns[uü]l[iİ]n\s*)?(?:d[iİ]renc[iİ]?|index)?[:\s]+(\d+\.?\d*)/i, name: "HOMA-IR", unit: "", category: "metabolic" },

    // INFLAMMATION - Multi-language patterns
    // CRP: Universal abbreviation
    { regex: /(?:hs-)?(?:CRP|PCR|prot[eé]ine\s*C\s*r[eé]active)[:\s]+(\d+\.?\d*)\s*(mg\/L|mg\/l)?/i, name: "CRP", unit: "mg/L", category: "inflammation" },
    // Homocysteine: EN, ES (homocisteína), DE (Homocystein), FR (homocystéine), PT (homocisteína)
    { regex: /(?:homocysteine|homociste[ií]na|homocystein|homocyst[eé]ine)[:\s]+(\d+\.?\d*)\s*(umol\/L|umol\/l)?/i, name: "Homocysteine", unit: "umol/L", category: "inflammation" },
    // Ferritin: EN, ES (ferritina), DE, FR (ferritine), PT, TR (ferritin)
    { regex: /(?:ferritin|ferritina|ferritine|ferr[iİ]t[iİ]n)[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml|ug\/l)?/i, name: "Ferritin", unit: "ng/mL", category: "inflammation" },
    // ESR: EN (ESR), ES (VSG), DE (BSG), FR (VS), PT (VHS)
    { regex: /\b(?:ESR|VSG|BSG|VHS|VS)[:\s]+(\d+\.?\d*)\s*(mm\/hr|mm\/h)?/i, name: "ESR", unit: "mm/hr", category: "inflammation" },

    // VITAMINS - Multi-language patterns
    // Vitamin D: Universal with language variations
    { regex: /(?:vitamin\s*D|vitamine\s*D|vitamina\s*D|25-?OH\s*D)[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml|nmol\/l)?/i, name: "Vitamin D", unit: "ng/mL", category: "vitamin" },
    // Vitamin B12: Multiple language patterns
    { regex: /(?:vitamin\s*B12|vitamine\s*B12|vitamina\s*B12|B-?12|v[iİ]tam[iİ]n\s*b12|cobalamin[ae]?)[:\s]+(\d+\.?\d*)\s*(pg\/mL|pg\/ml|pmol\/l)?/i, name: "Vitamin B12", unit: "pg/mL", category: "vitamin" },
    // Folate: EN, ES (ácido fólico), DE (Folsäure), FR (acide folique), PT (ácido fólico)
    { regex: /(?:folate|fols[aä]ure|acide?\s*foli(?:que|co)|[aá]cido\s*f[oó]lico)[:\s]+(\d+\.?\d*)\s*(ng\/mL|ng\/ml|nmol\/l)?/i, name: "Folate", unit: "ng/mL", category: "vitamin" },

    // MINERALS - Multi-language patterns
    // Iron: EN, ES (hierro), DE (Eisen), FR (fer), PT (ferro), TR (demir), DA/NO (jern), FI (rauta)
    { regex: /(?:iron|hierro|eisen|fer|ferro|dem[iİ]r|jern|rauta)[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL|umol\/l)?/i, name: "Iron", unit: "ug/dL", category: "mineral" },
    // Magnesium: Universal with minor variations
    { regex: /(?:magnesium|magn[eé]sio|magn[eé]sium)[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|mmol\/l)?/i, name: "Magnesium", unit: "mg/dL", category: "mineral" },
    // Zinc: Universal
    { regex: /(?:zinc|zinco|zink)[:\s]+(\d+\.?\d*)\s*(ug\/dL|mcg\/dL|umol\/l)?/i, name: "Zinc", unit: "ug/dL", category: "mineral" },
    // Potassium: EN, ES/PT (potasio/potássio), DE (Kalium), FR, TR (potasyum), DA/NO/FI (kalium)
    { regex: /(?:potassium|potasio|pot[aá]ssio|kalium|potasyum)[:\s]+(\d+\.?\d*)\s*(mEq\/L|mmol\/l)?/i, name: "Potassium", unit: "mEq/L", category: "mineral" },
    // Sodium: EN, ES/PT (sodio/sódio), DE (Natrium), FR, TR (sodyum), DA/NO/FI (natrium)
    { regex: /(?:sodium|sodio|s[oó]dio|natrium|sodyum)[:\s]+(\d+\.?\d*)\s*(mEq\/L|mmol\/l)?/i, name: "Sodium", unit: "mEq/L", category: "mineral" },

    // LIPIDS - Multi-language patterns
    // Cholesterol: EN, ES/PT (colesterol), DE (Cholesterin), FR (cholestérol), TR (kolesterol)
    { regex: /(?:total\s*cholesterol|colesterol\s*total|cholesterin\s*gesamt|cholest[eé]rol\s*total|kolesterol\s*total)[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|mmol\/l)?/i, name: "Total Cholesterol", unit: "mg/dL", category: "lipid" },
    { regex: /\bLDL[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|mmol\/l)?/i, name: "LDL", unit: "mg/dL", category: "lipid" },
    { regex: /\bHDL[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|mmol\/l)?/i, name: "HDL", unit: "mg/dL", category: "lipid" },
    // Triglycerides: EN, ES/PT (triglicéridos/triglicérides), DE (Triglyzeride), FR (triglycérides), TR (trigliserit)
    { regex: /(?:triglycerides|triglic[eé]rid[oe]s|triglyzeride|triglyc[eé]rides|tr[iİ]gl[iİ]ser[iİ]t)[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|mmol\/l)?/i, name: "Triglycerides", unit: "mg/dL", category: "lipid" },

    // LIVER - Universal abbreviations mostly
    { regex: /\b(?:ALT|SGPT|ALAT|GPT)[:\s]+(\d+\.?\d*)\s*(U\/L|u\/l)?/i, name: "ALT", unit: "U/L", category: "liver" },
    { regex: /\b(?:AST|SGOT|ASAT|GOT)[:\s]+(\d+\.?\d*)\s*(U\/L|u\/l)?/i, name: "AST", unit: "U/L", category: "liver" },
    { regex: /\b(?:GGT|gamma[- ]?GT)[:\s]+(\d+\.?\d*)\s*(U\/L|u\/l)?/i, name: "GGT", unit: "U/L", category: "liver" },
    // Bilirubin: EN, ES/PT (bilirrubina), DE, FR (bilirubine)
    { regex: /(?:bilirubin|bilirrubina|bilirubine)[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|umol\/l)?/i, name: "Bilirubin", unit: "mg/dL", category: "liver" },
    // Albumin: Universal with minor variations
    { regex: /(?:albumin|alb[uú]mina|albumine)[:\s]+(\d+\.?\d*)\s*(g\/dL|g\/dl|g\/l)?/i, name: "Albumin", unit: "g/dL", category: "liver" },

    // KIDNEY - Multi-language patterns
    // Creatinine: EN, ES/PT (creatinina), DE (Kreatinin), FR (créatinine), TR (kreatinin)
    { regex: /(?:creatinine|creatinina|kreatinin|cr[eé]atinine|kreat[iİ]n[iİ]n)[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|umol\/l)?/i, name: "Creatinine", unit: "mg/dL", category: "kidney" },
    // BUN/Urea: EN (BUN), ES/PT (urea), DE (Harnstoff), FR (urée), TR (üre)
    { regex: /\b(?:BUN|urea|harnstoff|ur[eé]e|[üÜ]re)[:\s]+(\d+\.?\d*)\s*(mg\/dL|mg\/dl|mmol\/l)?/i, name: "BUN", unit: "mg/dL", category: "kidney" },
    { regex: /(?:eGFR|GFR|DFG)[:\s]+(\d+\.?\d*)\s*(mL\/min|ml\/dk|ml\/min)?/i, name: "eGFR", unit: "mL/min", category: "kidney" },

    // BLOOD - Multi-language patterns
    // Hemoglobin: EN, ES/PT (hemoglobina), DE (Hämoglobin), FR (hémoglobine)
    { regex: /(?:hemoglobin|haemoglobin|hemoglobina|h[aä]moglobin|h[eé]moglobine)(?!\s*A1c)[:\s]+(\d+\.?\d*)\s*(g\/dL|g\/dl|g\/l)?/i, name: "Hemoglobin", unit: "g/dL", category: "blood" },
    // Hematocrit: EN, ES/PT (hematócrito), DE (Hämatokrit), FR (hématocrite)
    { regex: /(?:hematocrit|hemat[oó]crito|h[aä]matokrit|h[eé]matocrite)[:\s]+(\d+\.?\d*)\s*%?/i, name: "Hematocrit", unit: "%", category: "blood" },
    // RBC: Universal abbreviation, also Eritrocitos (ES), Erythrozyten (DE), Érythrocytes (FR)
    { regex: /\b(?:RBC|eritrocitos|erythrozyten|[eé]rythrocytes|gl[oó]bulos\s*rojos)[:\s]+(\d+\.?\d*)\s*(M\/uL|T\/L)?/i, name: "RBC", unit: "M/uL", category: "blood" },
    // WBC: Universal abbreviation, also Leucocitos (ES), Leukozyten (DE), Leucocytes (FR)
    { regex: /\b(?:WBC|leucocitos|leukozyten|leucocytes|gl[oó]bulos\s*blancos)[:\s]+(\d+\.?\d*)\s*(K\/uL|G\/L)?/i, name: "WBC", unit: "K/uL", category: "blood" },
    // Platelets: EN, ES (plaquetas), DE (Thrombozyten), FR (plaquettes), PT (plaquetas)
    { regex: /(?:platelets?|plaquetas?|thrombozyten|plaquettes?|trombocitos?)[:\s]+(\d+\.?\d*)\s*(K\/uL|G\/L)?/i, name: "Platelets", unit: "K/uL", category: "blood" },

    // JAPANESE patterns (using common lab abbreviations which are often in English/Latin)
    // Japanese labs typically use the same abbreviations but may include Japanese characters
    { regex: /(?:テストステロン|testosterone)[:\s：]+(\d+\.?\d*)/i, name: "Testosterone", unit: "ng/dL", category: "hormone" },
    { regex: /(?:血糖|glucose)[:\s：]+(\d+\.?\d*)/i, name: "Glucose", unit: "mg/dL", category: "metabolic" },
    { regex: /(?:コレステロール|cholesterol)[:\s：]+(\d+\.?\d*)/i, name: "Total Cholesterol", unit: "mg/dL", category: "lipid" },
    { regex: /(?:ヘモグロビン|hemoglobin)(?!.*A1c)[:\s：]+(\d+\.?\d*)/i, name: "Hemoglobin", unit: "g/dL", category: "blood" },

    // CHINESE patterns (Simplified)
    { regex: /(?:睾酮|testosterone)[:\s：]+(\d+\.?\d*)/i, name: "Testosterone", unit: "ng/dL", category: "hormone" },
    { regex: /(?:血糖|空腹血糖|glucose)[:\s：]+(\d+\.?\d*)/i, name: "Glucose", unit: "mg/dL", category: "metabolic" },
    { regex: /(?:胆固醇|cholesterol)[:\s：]+(\d+\.?\d*)/i, name: "Total Cholesterol", unit: "mg/dL", category: "lipid" },
    { regex: /(?:血红蛋白|hemoglobin)(?!.*A1c)[:\s：]+(\d+\.?\d*)/i, name: "Hemoglobin", unit: "g/dL", category: "blood" },
    { regex: /(?:铁蛋白|ferritin)[:\s：]+(\d+\.?\d*)/i, name: "Ferritin", unit: "ng/mL", category: "inflammation" },

    // TURKISH patterns - specific lab format (TEST NAME value unit)
    { regex: /TESTOSTERON\s*TOTAL\s+(\d+\.?\d*)/i, name: "Testosterone", unit: "ng/mL", category: "hormone" },
    { regex: /HDL\s*KOLESTEROL\s+(\d+)/i, name: "HDL", unit: "mg/dL", category: "lipid" },
    { regex: /LDL\s*KOLESTEROL\s+(\d+)/i, name: "LDL", unit: "mg/dL", category: "lipid" },
    { regex: /KOLESTEROL\s*TOTAL\s+(\d+)/i, name: "Total Cholesterol", unit: "mg/dL", category: "lipid" },
    { regex: /E2\s*\(ESTRAD[İI]OL\)\s+(\d+\.?\d*)/i, name: "Estradiol", unit: "pg/mL", category: "hormone" },
    { regex: /\bFT3\s+(\d+\.?\d*)/i, name: "Free T3", unit: "pg/mL", category: "thyroid" },
    { regex: /\bFT4\s+(\d+\.?\d*)/i, name: "Free T4", unit: "ng/dL", category: "thyroid" },
    { regex: /PROLAKT[İI]N\s+(\d+\.?\d*)/i, name: "Prolactin", unit: "ng/mL", category: "hormone" },
    { regex: /SGOT\s*\(AST\)\s+(\d+)/i, name: "AST", unit: "U/L", category: "liver" },
    { regex: /SGPT\s*\(ALT\)\s+(\d+)/i, name: "ALT", unit: "U/L", category: "liver" },
    { regex: /HOMA\s*[İI]NS[ÜU]L[İI]N\s*D[İI]RENC[İI]\s+(\d+\.?\d*)/i, name: "HOMA-IR", unit: "", category: "metabolic" },
    { regex: /DEM[İI]R\s+(\d+)/i, name: "Iron", unit: "ug/dL", category: "mineral" },
    { regex: /\bBUN\s+(\d+)/i, name: "BUN", unit: "mg/dL", category: "kidney" },
    { regex: /\b[ÜU]RE\s+(\d+)/i, name: "Urea", unit: "mg/dL", category: "kidney" },
    { regex: /\bGFR\s+(\d+)/i, name: "eGFR", unit: "mL/min", category: "kidney" },
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

export { parsePDF };
