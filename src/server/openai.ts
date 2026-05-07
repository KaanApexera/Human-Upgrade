import OpenAI from "openai";
import type { Biomarker } from "@shared/schema";
import { formatPeptideKnowledgeForPrompt } from "./peptideKnowledge";

// Using gpt-4o for biomarker analysis and protocol generation
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Red Flags - Emergency symptoms that require immediate medical attention
// When detected, the system should NOT generate advice and instead show emergency guidance
const RED_FLAG_PATTERNS = [
  // Cardiac emergencies
  /chest\s*pain/i,
  /heart\s*attack/i,
  /difficulty\s*breathing/i,
  /shortness\s*of\s*breath\s*at\s*rest/i,
  /crushing\s*(chest\s*)?pain/i,
  /irregular\s*heart\s*beat\s*with\s*dizziness/i,
  
  // Mental health emergencies
  /suicid(e|al)/i,
  /self[\s-]*harm/i,
  /want\s*to\s*(die|kill|end\s*it)/i,
  /planning\s*(to\s*)?(die|suicide|kill)/i,
  
  // Stroke symptoms
  /sudden\s*numbness/i,
  /sudden\s*confusion/i,
  /sudden\s*trouble\s*(seeing|walking|speaking)/i,
  /severe\s*headache\s*with\s*no\s*cause/i,
  /face\s*drooping/i,
  /arm\s*weakness/i,
  /slurred\s*speech/i,
  
  // Severe bleeding/trauma
  /severe\s*bleeding/i,
  /uncontrolled\s*bleeding/i,
  /coughing\s*(up\s*)?blood/i,
  /vomiting\s*blood/i,
  /blood\s*in\s*(stool|urine)/i,
  
  // Other emergencies
  /seizure/i,
  /unconscious/i,
  /fainting\s*repeatedly/i,
  /severe\s*allergic\s*reaction/i,
  /anaphyla(xis|ctic)/i,
  /overdose/i,
  /poisoning/i,
  
  // Critical lab values mentioned
  /potassium\s*(level\s*)?(above|over|>)\s*6/i,
  /sodium\s*(level\s*)?(below|under|<)\s*120/i,
  /glucose\s*(level\s*)?(below|under|<)\s*50/i,
  /glucose\s*(level\s*)?(above|over|>)\s*500/i,
];

export interface RedFlagResult {
  detected: boolean;
  matchedPatterns: string[];
  emergencyMessage: string;
}

export function detectRedFlags(text: string): RedFlagResult {
  const matchedPatterns: string[] = [];
  
  for (const pattern of RED_FLAG_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns.push(pattern.source);
    }
  }
  
  if (matchedPatterns.length > 0) {
    return {
      detected: true,
      matchedPatterns,
      emergencyMessage: `IMPORTANT SAFETY NOTICE

We've detected language that may indicate a medical emergency. Your safety is our top priority.

IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY:
- Call 911 (US) or your local emergency number immediately
- Go to the nearest emergency room
- Call the National Suicide Prevention Lifeline: 988 (US)
- Call the Crisis Text Line: Text HOME to 741741

Human Upgrade OS is designed for wellness optimization, not emergency medical care. We cannot provide advice for acute medical emergencies.

Please seek immediate professional medical attention. Your health and safety matter.`
    };
  }
  
  return {
    detected: false,
    matchedPatterns: [],
    emergencyMessage: ""
  };
}

export async function chatWithAI(message: string, context?: { protocol?: any; biomarkers?: any }): Promise<string> {
  const peptideKnowledge = formatPeptideKnowledgeForPrompt();
  
  const systemPrompt = `You are a knowledgeable health optimization assistant for the Human Upgrade OS platform. 
You help users understand their biomarkers, protocols, and provide evidence-based health advice.

Key principles:
- Always recommend consulting a healthcare professional for medical decisions
- Be evidence-based and cite scientific reasoning when possible
- Focus on lifestyle, nutrition, exercise, and supplementation advice
- Never diagnose conditions or prescribe medications
- Be encouraging but realistic about health optimization goals
- Keep responses concise but informative (2-4 paragraphs max)
- When recommending peptides, match them to user's specific goals using the knowledge base below

${peptideKnowledge}

${context?.protocol ? `User's Current Protocol Summary: The user has an active health protocol with personalized recommendations.` : ''}
${context?.biomarkers ? `User has uploaded biomarker data for analysis.` : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Chat AI error:", error);
    throw new Error("Failed to process chat message");
  }
}

export interface AnalysisResult {
  performanceAge: number;
  peptideReadiness: {
    status: "optimal" | "good" | "needs-attention" | "critical";
    bpc157: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    tb500: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    nadPlus: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    sermorelin: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    ipamorelin: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    cjc1295: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    thymosinAlpha1: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    motsc: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    ss31: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    epithalon: { recommended: boolean; dosage: string; protocol: string; rationale: string };
    ghStatus: string;
    overallNotes: string;
  };
  hormoneStatus: {
    testosterone: number;
    testosteroneStatus: "good" | "warning" | "critical";
    freeT: number;
    estradiol: number;
    shbg: number;
    lh?: number;
    fsh?: number;
    dht?: number;
    prolactin?: number;
    trtRecommendation?: {
      recommended: boolean;
      maxDosage: string; // Never exceeds 250mg/week
      frequency: string;
      rationale: string;
      naturalAlternatives: string[];
      monitoring: string[];
    };
    detailedAnalysis: string;
  };
  metabolicStatus: {
    glucose: number;
    hba1c: number;
    insulin: number;
    homaIr: number;
    notes: string;
  };
  inflammation: {
    status: "optimal" | "good" | "needs-attention" | "critical";
    crp: number;
    homocysteine: number;
    ferritin: number;
    notes: string;
  };
  morningRoutine: Array<{
    time: string;
    action: string;
    details: string;
    priority: "high" | "medium" | "low";
  }>;
  eveningRoutine: Array<{
    time: string;
    action: string;
    details: string;
    priority: "high" | "medium" | "low";
  }>;
  supplementProtocol: Array<{
    name: string;
    dosage: string;
    timing: string;
    purpose: string;
    mechanism: string; // How it works in the body
    expectedBenefits: string;
    evidenceLevel: "strong" | "moderate" | "emerging";
    precautions: string;
    synergies: string[]; // Other supplements it works well with
    notes: string;
  }>;
  lifestyleGuidance: {
    sleepOptimization: {
      targetHours: string;
      qualityTips: string[];
      chronotypeAdvice: string;
      rationale: string;
    };
    stressManagement: {
      techniques: string[];
      dailyPractice: string;
      rationale: string;
    };
    nutritionPrinciples: {
      macroSplit: string;
      mealTiming: string;
      keyFoods: string[];
      foodsToAvoid: string[];
      rationale: string;
    };
    movementGuidance: {
      dailyStepTarget: string;
      standingBreaks: string;
      mobilityWork: string;
      rationale: string;
    };
    coldExposure: {
      recommended: boolean;
      protocol: string;
      benefits: string;
      rationale: string;
    };
    sunlightExposure: {
      morningTarget: string;
      benefits: string;
      rationale: string;
    };
    socialConnection: {
      importance: string;
      suggestions: string[];
      rationale: string;
    };
  };
  workoutPlan: Array<{
    day: string;
    type: string;
    exercises: string[];
    duration: string;
    intensity: string;
  }>;
  fitnessProtocol?: {
    goal: "muscle_gain" | "fat_loss" | "body_recomp" | "longevity";
    bmi: number;
    bodyFatAnalysis: string;
    calorieTarget: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
      proteinPerLb: string;
    };
    mealPlan: Array<{
      meal: string;
      time: string;
      foods: string[];
      calories: number;
      macros: string;
    }>;
    peptideStack: Array<{
      name: string;
      purpose: string;
      dosage: string;
      timing: string;
    }>;
    trtGuidance?: {
      recommendation: string;
      dosage: string;
      frequency: string;
      monitoring: string[];
    };
    trainingProgram: Array<{
      day: string;
      focus: string;
      exercises: Array<{
        name: string;
        sets: string;
        reps: string;
        rest: string;
        notes: string;
      }>;
      cardio: string;
      duration: string;
    }>;
    weeklySchedule: string;
    progressMetrics: string[];
    rationale: string;
  };
  risks: Array<{
    category: string;
    level: "low" | "moderate" | "high" | "critical";
    description: string;
    recommendation: string;
  }>;
  notes: string;
}

export interface UserMetricsInput {
  heightCm: number;
  weightKg: number;
  bodyFatPercent?: number;
  age: number;
  gender: "male" | "female";
  fitnessGoal: "muscle_gain" | "fat_loss" | "body_recomp" | "longevity";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  naturalOnly?: boolean;
  bmi?: number;
}

export async function analyzeBiomarkers(
  biomarkers: Biomarker[], 
  userMetrics?: UserMetricsInput
): Promise<AnalysisResult> {
  // Get user's chronological age from metrics, default to 35 if not provided
  const chronologicalAge = userMetrics?.age || 35;
  const biomarkerData = biomarkers.map(b => ({
    name: b.name,
    value: b.value,
    unit: b.unit,
    category: b.category,
  }));

  // Build user profile section if metrics provided
  const userProfileSection = userMetrics ? `
USER BODY METRICS:
- Height: ${userMetrics.heightCm} cm (${(userMetrics.heightCm / 2.54).toFixed(1)} inches)
- Weight: ${userMetrics.weightKg} kg (${(userMetrics.weightKg * 2.205).toFixed(1)} lbs)
- Body Fat: ${userMetrics.bodyFatPercent ? userMetrics.bodyFatPercent + '%' : 'Not provided'}
- BMI: ${userMetrics.bmi || (userMetrics.weightKg / Math.pow(userMetrics.heightCm / 100, 2)).toFixed(1)}
- Age: ${userMetrics.age}
- Gender: ${userMetrics.gender}
- FITNESS GOAL: ${userMetrics.fitnessGoal.replace('_', ' ').toUpperCase()}
- Activity Level: ${userMetrics.activityLevel || 'moderate'}
- NATURAL ONLY: ${userMetrics.naturalOnly ? 'YES - NO peptides, TRT, or PEDs' : 'No - can include peptides/TRT if beneficial'}

IMPORTANT: Generate a detailed fitness protocol section based on their goal:
- For MUSCLE GAIN: Higher calories (300-500 surplus), high protein (1-1.2g/lb), progressive overload training, anabolic peptides
- For FAT LOSS: Caloric deficit (300-500), very high protein (1.2-1.4g/lb), cardio emphasis, thermogenic support
- For BODY RECOMP: Maintenance calories or slight deficit, very high protein (1.2-1.4g/lb), combined strength and cardio
- For LONGEVITY: Focus on healthspan optimization with:
  * Moderate protein (0.7-0.9g/lb) to balance mTOR activation
  * Emphasis on Zone 2 cardio (3-4 sessions/week, 45-60 min) for mitochondrial health
  * Strength training 2-3x/week for muscle preservation and metabolic health
  * Time-restricted eating window (16:8 or 18:6) for autophagy
  * Anti-aging peptides: Epithalon (telomere support), NAD+ precursors, MOTS-c (metabolic optimization), SS-31 (mitochondrial function)
  * Prioritize sleep, stress management, and inflammation reduction
  * Include VO2 max training once weekly for cardiovascular longevity
  * Supplement focus: NMN/NR, resveratrol, omega-3s, vitamin D, magnesium

Include a 5-6 day detailed training program with specific exercises, sets, reps, and rest periods.

${userMetrics.naturalOnly ? `
NATURAL ONLY MODE - CRITICAL REQUIREMENTS:
- DO NOT recommend ANY peptides, TRT, testosterone, or performance-enhancing drugs
- Set ALL peptide "recommended" fields to false with rationale "User selected natural-only protocol"
- Focus on NATURAL optimization: sleep, nutrition timing, training periodization, stress management
- Recommend only legal, over-the-counter supplements: creatine, protein, vitamins, minerals, adaptogens
- Emphasize food-based nutrition strategies (protein timing, carb cycling, micronutrient density)
- Include natural testosterone optimization if needed: zinc, vitamin D, sleep hygiene, resistance training
- Training focus: progressive overload, compound movements, proper recovery
- Set hormoneStatus.trt.recommended to false with natural alternatives
` : `
Include peptide recommendations specific to their goal (GH secretagogues for muscle, fat-loss peptides, longevity peptides for healthspan)
If testosterone is low and goal requires it, provide TRT guidance (never exceed 200mg/week).
`}
` : '';

  const prompt = `You are an expert health optimization AI for Human Upgrade OS. Analyze the following biomarkers and generate a comprehensive, detailed health optimization protocol.

CRITICAL GUIDELINES:
- Be DETAILED and EXPLANATORY - explain WHY each recommendation is made based on their specific biomarkers
- For TRT, NEVER recommend more than 200mg testosterone per week maximum (250mg is absolute maximum only in extreme cases)
- For Vitamin D, recommend 1000-2000 IU daily (NOT 5000 IU which is excessive for most people)
- Include comprehensive peptide analysis including NAD+, Sermorelin, MOTS-c, and other cutting-edge options
- Provide actionable daily habits with clear rationale
- This report should be so detailed and personalized that it cannot be replicated by generic AI prompts
${userProfileSection}
CHRONOLOGICAL AGE: ${chronologicalAge} years old

CRITICAL: The user's actual age is ${chronologicalAge}. When calculating Performance Age (biological age), it MUST be based on this chronological age. The Performance Age should typically be within ±10 years of ${chronologicalAge} based on biomarker health.

${formatPeptideKnowledgeForPrompt()}

Biomarkers:
${JSON.stringify(biomarkerData, null, 2)}

Generate a complete analysis in JSON format with the following structure:

{
  "performanceAge": <number - biological age based on biomarkers. For a ${chronologicalAge}-year-old, this should typically be between ${chronologicalAge - 10} and ${chronologicalAge + 10} depending on biomarker health>,
  "peptideReadiness": {
    "status": "optimal" | "good" | "needs-attention" | "critical",
    "bpc157": {
      "recommended": <boolean>,
      "dosage": "250-500mcg daily subcutaneously",
      "protocol": "4-6 week cycles with 2 week breaks",
      "rationale": "Detailed explanation of why this is/isn't recommended based on their markers"
    },
    "tb500": {
      "recommended": <boolean>,
      "dosage": "2-2.5mg twice weekly",
      "protocol": "4-6 week loading phase, then maintenance",
      "rationale": "Detailed explanation based on inflammation markers and recovery needs"
    },
    "nadPlus": {
      "recommended": <boolean>,
      "dosage": "250-500mg daily or IV 250-500mg weekly",
      "protocol": "Oral NAD+ precursors daily or periodic IV infusions",
      "rationale": "Explanation of mitochondrial health, aging markers, energy levels. NAD+ declines with age and supports cellular repair, metabolism, and cognitive function."
    },
    "sermorelin": {
      "recommended": <boolean>,
      "dosage": "200-300mcg before bed",
      "protocol": "Daily subcutaneous injection 5 days on, 2 days off",
      "rationale": "Growth hormone releasing hormone analog. Explain based on IGF-1, sleep quality, recovery needs."
    },
    "ipamorelin": {
      "recommended": <boolean>,
      "dosage": "200-300mcg before bed",
      "protocol": "Daily subcutaneous, often combined with CJC-1295",
      "rationale": "Selective GH secretagogue with minimal side effects. Good for recovery, body composition, sleep."
    },
    "cjc1295": {
      "recommended": <boolean>,
      "dosage": "100-200mcg 2-3x weekly",
      "protocol": "Often paired with Ipamorelin for synergistic GH release",
      "rationale": "Extended GH release pattern. Explain based on recovery needs and body composition goals."
    },
    "thymosinAlpha1": {
      "recommended": <boolean>,
      "dosage": "1.6mg 2-3x weekly",
      "protocol": "Subcutaneous injection for immune modulation",
      "rationale": "Immune system peptide. Recommend based on inflammation markers, frequent illness, autoimmune concerns."
    },
    "motsc": {
      "recommended": <boolean>,
      "dosage": "5-10mg weekly",
      "protocol": "Subcutaneous injection 1-2x weekly",
      "rationale": "Mitochondrial-derived peptide for metabolic health, insulin sensitivity, exercise performance. Explain based on metabolic markers."
    },
    "ss31": {
      "recommended": <boolean>,
      "dosage": "5-10mg daily",
      "protocol": "Subcutaneous injection targeting mitochondrial function",
      "rationale": "Targets cardiolipin in inner mitochondrial membrane. For oxidative stress, aging, energy production."
    },
    "epithalon": {
      "recommended": <boolean>,
      "dosage": "5-10mg daily for 10-20 days",
      "protocol": "Cyclical use 2-3 times per year",
      "rationale": "Telomerase activator for longevity. Explain based on biological age, inflammation, overall optimization goals."
    },
    "ghStatus": "Detailed analysis of growth hormone axis based on IGF-1, sleep quality, recovery markers",
    "overallNotes": "Comprehensive summary of peptide strategy tailored to their specific biomarker profile"
  },
  "hormoneStatus": {
    "testosterone": <number in ng/dL>,
    "testosteroneStatus": "good" | "warning" | "critical",
    "freeT": <number in pg/mL>,
    "estradiol": <number in pg/mL>,
    "shbg": <number in nmol/L>,
    "trtRecommendation": {
      "recommended": <boolean - only if truly needed based on low T symptoms and labs>,
      "maxDosage": "NEVER exceed 100-200mg/week. 250mg is absolute maximum only in rare cases",
      "frequency": "Split into 2-3 injections per week for stable levels",
      "rationale": "Explain why TRT is or isn't recommended based on their specific testosterone, free T, and SHBG levels. Include natural optimization options first.",
      "naturalAlternatives": ["Sleep optimization", "Stress reduction", "Zinc/Vitamin D optimization", "Weight training", "Reduce alcohol"],
      "monitoring": ["Total and Free Testosterone", "Estradiol", "Hematocrit", "PSA", "Lipid panel"]
    },
    "detailedAnalysis": "Comprehensive explanation of their hormone profile, what the numbers mean, and specific actionable steps"
  },
  "metabolicStatus": {
    "glucose": <number in mg/dL>,
    "hba1c": <number in %>,
    "insulin": <number in uIU/mL>,
    "homaIr": <number>,
    "notes": "Detailed analysis with explanation of what each marker means and specific dietary/lifestyle interventions"
  },
  "inflammation": {
    "status": "optimal" | "good" | "needs-attention" | "critical",
    "crp": <number in mg/L>,
    "homocysteine": <number in umol/L>,
    "ferritin": <number in ng/mL>,
    "notes": "Detailed explanation of inflammatory markers, root causes, and targeted interventions"
  },
  "morningRoutine": [
    { "time": "5:30-6:00 AM", "action": "Wake naturally if possible", "details": "Allow cortisol awakening response. Avoid alarm if sleep has been adequate. Rationale: Natural waking optimizes HPA axis function.", "priority": "high" },
    { "time": "6:00-6:15 AM", "action": "Morning light exposure", "details": "Get 10-15 minutes of direct sunlight or 10,000 lux light therapy. This sets circadian rhythm, boosts cortisol, and improves evening melatonin production. Even cloudy days provide beneficial light.", "priority": "high" },
    { "time": "6:15-6:25 AM", "action": "Hydration protocol", "details": "16-20oz water with electrolytes (sodium, potassium, magnesium). After 7-8 hours of sleep, you're dehydrated. Proper hydration improves cognitive function and energy.", "priority": "high" },
    { "time": "6:30-6:45 AM", "action": "Cold exposure", "details": "2-3 minutes cold shower (end of shower) or cold plunge at 50-59°F. Increases norepinephrine 200-300%, improves mood, metabolic health, and brown fat activation.", "priority": "medium" },
    { "time": "6:45-7:00 AM", "action": "Movement/Mobility", "details": "10-15 min mobility routine focusing on hips, thoracic spine, shoulders. Activates proprioceptors, improves joint health, prepares body for the day.", "priority": "medium" }
  ],
  "eveningRoutine": [
    { "time": "7:00 PM", "action": "Dim lights and limit blue light", "details": "Use blue light blocking glasses, dim overhead lights, switch to warm lighting. Blue light after sunset suppresses melatonin by up to 50%. Your sleep quality depends on this.", "priority": "high" },
    { "time": "8:00 PM", "action": "Digital sunset", "details": "Stop work emails and stimulating content. Switch to relaxing activities: reading, gentle stretching, conversation. Cortisol should be declining; don't spike it.", "priority": "high" },
    { "time": "8:30 PM", "action": "Evening supplements", "details": "Magnesium glycinate 300-400mg, zinc 15-30mg if needed. Magnesium supports GABA activity and muscle relaxation. Take 1-2 hours before bed.", "priority": "high" },
    { "time": "9:00 PM", "action": "Cool down bedroom", "details": "Set bedroom to 65-68°F (18-20°C). Body temperature must drop 2-3 degrees for sleep onset. This is non-negotiable for quality sleep.", "priority": "high" },
    { "time": "9:30-10:00 PM", "action": "Sleep", "details": "Target consistent bedtime within 30-minute window. Adults need 7-9 hours. Sleep is when HGH peaks, tissue repairs, memories consolidate, and toxins clear from brain.", "priority": "high" }
  ],
  "supplementProtocol": [
    {
      "name": "Vitamin D3 + K2",
      "dosage": "1000-2000 IU D3 + 100-200mcg K2 (MK-7 form) daily. Only increase D3 if blood levels <30ng/mL",
      "timing": "Morning with fat-containing meal for absorption",
      "purpose": "Optimize vitamin D levels for immune function, bone health, hormone production while K2 directs calcium to bones",
      "mechanism": "D3 is a fat-soluble hormone precursor regulating 200+ genes. K2 activates osteocalcin and matrix GLA protein to direct calcium into bones and away from arteries",
      "expectedBenefits": "Improved immune function, better mood, optimized hormones, stronger bones, cardiovascular protection",
      "evidenceLevel": "strong",
      "precautions": "Retest D3 levels after 3 months. Target blood level 40-60 ng/mL. Do not exceed 4000 IU long-term without testing.",
      "synergies": ["Magnesium", "Omega-3"],
      "notes": "K2 MK-7 form has longer half-life than MK-4. Essential cofactor for vitamin D."
    },
    {
      "name": "B-Complex (Methylated)",
      "dosage": "1 capsule daily containing: Methylfolate 400-800mcg (NOT folic acid), Methylcobalamin B12 1000mcg, B6 as P5P 25-50mg, Riboflavin 25mg, Thiamine 25-50mg, Niacin 50mg, Biotin 300mcg, Pantothenic acid 100mg",
      "timing": "Morning with breakfast - B vitamins can be energizing",
      "purpose": "Support energy metabolism, methylation, homocysteine control, nervous system function",
      "mechanism": "Methylated forms bypass MTHFR gene variants (40% of population has). Active forms are immediately usable vs synthetic forms requiring conversion",
      "expectedBenefits": "Improved energy, better methylation, reduced homocysteine, cognitive support, mood stabilization",
      "evidenceLevel": "strong",
      "precautions": "Start with lower doses if sensitive. Some people feel overstimulated initially. Avoid if taking medications that interact with B vitamins.",
      "synergies": ["Magnesium", "Zinc"],
      "notes": "CRITICAL: Avoid folic acid - use methylfolate. Avoid cyanocobalamin - use methylcobalamin. These are the bioactive forms."
    },
    {
      "name": "Magnesium Glycinate",
      "dosage": "300-400mg elemental magnesium daily (usually 2-3 capsules depending on product)",
      "timing": "Evening before bed - promotes relaxation and sleep",
      "purpose": "Support 300+ enzymatic reactions, muscle relaxation, sleep quality, stress response, blood sugar regulation",
      "mechanism": "Glycinate form is highly bioavailable and gentle on stomach. Magnesium is cofactor for ATP production, GABA activation, and muscle/nerve function",
      "expectedBenefits": "Better sleep, reduced muscle cramps, improved stress resilience, blood pressure support, glucose metabolism",
      "evidenceLevel": "strong",
      "precautions": "Start with lower dose if prone to loose stools. Glycinate form is less likely to cause GI issues than citrate or oxide.",
      "synergies": ["Vitamin D", "B6", "Zinc"],
      "notes": "80% of population is deficient. Depleted by stress, caffeine, alcohol, medications. Oxide form has poor absorption - avoid."
    },
    {
      "name": "Omega-3 Fish Oil (EPA/DHA)",
      "dosage": "2-3g combined EPA+DHA daily (typically 2-4 softgels). Higher EPA for inflammation, higher DHA for brain",
      "timing": "With any fat-containing meal for absorption",
      "purpose": "Reduce inflammation, support cardiovascular health, brain function, cell membrane integrity",
      "mechanism": "EPA reduces pro-inflammatory eicosanoids, DHA is structural component of brain and retina. Both improve cell membrane fluidity",
      "expectedBenefits": "Reduced inflammation (lower CRP), improved lipid ratios, better brain function, joint health, mood support",
      "evidenceLevel": "strong",
      "precautions": "Choose triglyceride form over ethyl ester. IFOS certified for purity. May increase bleeding time - discuss with doctor if on blood thinners.",
      "synergies": ["Vitamin D", "Vitamin E"],
      "notes": "Aim for Omega-6:Omega-3 ratio of 4:1 or lower. Most Western diets are 15:1. This is critical for inflammation control."
    },
    {
      "name": "Zinc",
      "dosage": "15-30mg elemental zinc daily (zinc picolinate or glycinate preferred)",
      "timing": "With food to prevent nausea. Separate from calcium and iron by 2+ hours",
      "purpose": "Support immune function, testosterone production, wound healing, taste/smell, protein synthesis",
      "mechanism": "Cofactor for 300+ enzymes including those for testosterone synthesis, immune cell function, and DNA repair",
      "expectedBenefits": "Improved immune function, testosterone optimization, better skin healing, taste sensitivity",
      "evidenceLevel": "strong",
      "precautions": "Do not exceed 40mg daily long-term without copper supplementation (2mg copper per 15mg zinc). High zinc depletes copper.",
      "synergies": ["Vitamin B6", "Magnesium"],
      "notes": "Athletes, vegetarians, and those with high stress have higher zinc needs. Phytates in grains block absorption."
    }
  ],
  "lifestyleGuidance": {
    "sleepOptimization": {
      "targetHours": "7-8.5 hours based on individual recovery needs",
      "qualityTips": ["Keep room at 65-68°F", "No screens 1 hour before bed", "Consistent sleep/wake times even weekends", "Complete darkness or quality sleep mask", "No caffeine after 2 PM"],
      "chronotypeAdvice": "Assess whether you're naturally early bird or night owl. Work with your biology, not against it.",
      "rationale": "Sleep is the foundation of all optimization. Growth hormone peaks during deep sleep. Memory consolidation, cellular repair, and metabolic regulation all depend on quality sleep."
    },
    "stressManagement": {
      "techniques": ["Box breathing (4-4-4-4)", "5-minute morning meditation", "Nature exposure", "Physical exercise as stress relief"],
      "dailyPractice": "Minimum 10 minutes of intentional stress-reduction practice daily",
      "rationale": "Chronic stress elevates cortisol, impairs testosterone production, increases inflammation, and accelerates aging. Your biomarkers will never fully optimize without stress management."
    },
    "nutritionPrinciples": {
      "macroSplit": "Protein 1g/lb bodyweight, fats 25-35% calories, carbs to fill remainder based on activity",
      "mealTiming": "Eat within 10-12 hour window. First meal at least 1 hour after waking. Stop eating 3+ hours before bed.",
      "keyFoods": ["Wild-caught fatty fish", "Pasture-raised eggs", "Grass-fed beef", "Cruciferous vegetables", "Berries", "Olive oil", "Nuts/seeds"],
      "foodsToAvoid": ["Processed vegetable oils", "Excess sugar", "Ultra-processed foods", "Excessive alcohol"],
      "rationale": "Nutrition directly impacts every biomarker. Anti-inflammatory foods reduce CRP. Adequate protein supports muscle and hormone production. Quality fats are hormone building blocks."
    },
    "movementGuidance": {
      "dailyStepTarget": "8,000-10,000 steps minimum",
      "standingBreaks": "Stand and move every 45-60 minutes if sedentary job",
      "mobilityWork": "10-15 minutes daily focusing on problem areas",
      "rationale": "Movement is medicine. Walking improves insulin sensitivity, reduces inflammation, supports mental health. Prolonged sitting is independently harmful regardless of exercise."
    },
    "coldExposure": {
      "recommended": true,
      "protocol": "Start with 30-second cold shower endings, build to 2-3 minutes. Or cold plunge at 50-59°F for 2-11 minutes total per week.",
      "benefits": "Increases norepinephrine 200-300%, improves mood, activates brown fat, reduces inflammation, builds mental resilience",
      "rationale": "Deliberate cold exposure has robust evidence for mood, metabolism, and resilience. Start gradually and listen to your body."
    },
    "sunlightExposure": {
      "morningTarget": "10-30 minutes of outdoor light within first hour of waking",
      "benefits": "Sets circadian rhythm, improves sleep quality, boosts daytime cortisol, enhances vitamin D production, improves mood",
      "rationale": "Morning light is the most powerful circadian signal. It anchors your biological clock and determines sleep quality 16 hours later."
    },
    "socialConnection": {
      "importance": "Strong social connections are as important as diet and exercise for longevity",
      "suggestions": ["Schedule regular time with friends/family", "Join community groups or sports", "Prioritize face-to-face over digital", "Express gratitude regularly"],
      "rationale": "Loneliness increases mortality risk equivalent to smoking 15 cigarettes daily. Social connection reduces stress hormones and promotes healthy behaviors."
    }
  },
  "workoutPlan": [
    { "day": "Monday", "type": "Upper Body Strength", "exercises": ["Bench Press 4x6-8", "Bent Over Rows 4x8-10", "Overhead Press 3x8-10", "Pull-ups 3x8-12", "Face Pulls 3x15"], "duration": "45-50 min", "intensity": "High - RPE 7-8" },
    { "day": "Tuesday", "type": "Lower Body Strength", "exercises": ["Squats 4x6-8", "Romanian Deadlifts 4x8-10", "Bulgarian Split Squats 3x10 each", "Leg Curls 3x12", "Calf Raises 4x15"], "duration": "50 min", "intensity": "High - RPE 7-8" },
    { "day": "Wednesday", "type": "Active Recovery", "exercises": ["30-min walk outdoors", "15-min mobility routine", "Foam rolling 10 min"], "duration": "45-60 min", "intensity": "Low - Zone 2" },
    { "day": "Thursday", "type": "Push Focus", "exercises": ["Incline DB Press 4x8-10", "Dips 3x10-12", "Lateral Raises 4x12-15", "Tricep Work 3x12", "Core Work 10 min"], "duration": "45 min", "intensity": "Moderate-High - RPE 7" },
    { "day": "Friday", "type": "Pull Focus + Deadlifts", "exercises": ["Deadlifts 4x5", "Weighted Pull-ups 4x6-8", "Cable Rows 3x10-12", "Bicep Curls 3x12", "Rear Delts 3x15"], "duration": "50 min", "intensity": "High - RPE 8" },
    { "day": "Saturday", "type": "Zone 2 Cardio + Mobility", "exercises": ["45-60 min steady cardio (biking, jogging, rowing) at conversational pace", "Full body stretch 15 min"], "duration": "60-75 min", "intensity": "Low - Heart rate 60-70% max" },
    { "day": "Sunday", "type": "Complete Rest or Light Activity", "exercises": ["Walk", "Yoga", "Family activities"], "duration": "Optional", "intensity": "Very Low" }
  ],
  "fitnessProtocol": {
    "goal": "muscle_gain" | "fat_loss" | "body_recomp" | "longevity" - based on user's stated goal,
    "bmi": <calculated BMI as number>,
    "bodyFatAnalysis": "Analysis of current body composition and what it means for their goal",
    "calorieTarget": <daily calories based on TDEE calculation adjusted for goal>,
    "macros": {
      "protein": <grams per day - high priority>,
      "carbs": <grams per day>,
      "fats": <grams per day>,
      "proteinPerLb": "1.0-1.4g/lb depending on goal"
    },
    "mealPlan": [
      { "meal": "Pre-Workout", "time": "6:00 AM", "foods": ["Oatmeal with berries", "Whey protein shake", "Black coffee"], "calories": 400, "macros": "40P/50C/10F" },
      { "meal": "Post-Workout", "time": "8:30 AM", "foods": ["4 whole eggs", "2 slices sourdough", "Avocado", "Fruit"], "calories": 600, "macros": "35P/45C/30F" },
      { "meal": "Lunch", "time": "12:30 PM", "foods": ["8oz chicken breast", "Rice", "Vegetables", "Olive oil"], "calories": 650, "macros": "50P/60C/20F" },
      { "meal": "Snack", "time": "4:00 PM", "foods": ["Greek yogurt", "Nuts", "Protein bar"], "calories": 350, "macros": "30P/25C/15F" },
      { "meal": "Dinner", "time": "7:00 PM", "foods": ["8oz salmon", "Sweet potato", "Salad with olive oil"], "calories": 700, "macros": "45P/50C/35F" }
    ],
    "peptideStack": [
      { "name": "Peptide name optimized for their goal", "purpose": "Why this peptide for their specific goal", "dosage": "Specific dosage", "timing": "When to take" }
    ],
    "trtGuidance": {
      "recommendation": "Whether TRT is recommended based on labs and goal (conservative approach)",
      "dosage": "NEVER exceed 200mg/week. Typical: 100-150mg/week split into 2-3 doses",
      "frequency": "Twice weekly preferred for stable levels",
      "monitoring": ["Hematocrit every 3 months", "Estradiol", "PSA annually if 40+", "Lipid panel"]
    },
    "trainingProgram": [
      {
        "day": "Day 1",
        "focus": "Push (Chest, Shoulders, Triceps)",
        "exercises": [
          { "name": "Barbell Bench Press", "sets": "4", "reps": "6-8", "rest": "2-3 min", "notes": "Progressive overload focus" },
          { "name": "Incline Dumbbell Press", "sets": "3", "reps": "8-10", "rest": "90 sec", "notes": "Control the negative" },
          { "name": "Overhead Press", "sets": "3", "reps": "8-10", "rest": "2 min", "notes": "Standing preferred" },
          { "name": "Lateral Raises", "sets": "4", "reps": "12-15", "rest": "60 sec", "notes": "High volume for delts" },
          { "name": "Tricep Dips", "sets": "3", "reps": "10-12", "rest": "90 sec", "notes": "Add weight when able" },
          { "name": "Cable Tricep Pushdowns", "sets": "3", "reps": "12-15", "rest": "60 sec", "notes": "Squeeze at bottom" }
        ],
        "cardio": "Optional 10 min incline walking",
        "duration": "60-75 min"
      }
    ],
    "weeklySchedule": "Day 1: Push, Day 2: Pull, Day 3: Legs, Day 4: Rest, Day 5: Upper, Day 6: Lower, Day 7: Rest or Active Recovery",
    "progressMetrics": ["Weekly weight trend", "Monthly strength increases", "Body measurements every 2 weeks", "Progress photos monthly", "Energy and recovery quality"],
    "rationale": "Detailed explanation of why this protocol is optimized for their specific goal, body type, and biomarkers"
  },
  "risks": [
    { "category": "Category based on biomarkers", "level": "low" | "moderate" | "high" | "critical", "description": "Detailed explanation of the risk and what markers indicate it", "recommendation": "Specific actionable steps with timeline for retest" }
  ],
  "notes": "Comprehensive personalized summary: Start with their current state, explain key findings, prioritize top 3 actions they should take immediately, and provide a realistic timeline for seeing improvements. This should feel like advice from a knowledgeable health optimization expert who has carefully reviewed their specific labs, not generic wellness advice."
}

Respond with valid JSON only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a health optimization expert AI. Always respond with valid JSON matching the requested structure. Be specific, evidence-based, and actionable in your recommendations."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 16000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const finishReason = response.choices[0].finish_reason;
    if (finishReason === "length") {
      console.error("OpenAI response was truncated due to token limit - attempting to parse partial response");
    }

    return JSON.parse(content) as AnalysisResult;
  } catch (error: any) {
    console.error("OpenAI analysis error:", error?.message || error);
    if (error?.status === 401 || error?.code === "invalid_api_key") {
      throw new Error("OpenAI API key is invalid or missing. Please check your configuration.");
    }
    if (error?.status === 429) {
      throw new Error("OpenAI rate limit exceeded. Please wait a moment and try again.");
    }
    throw new Error(`Analysis failed: ${error?.message || "Unknown OpenAI error"}. Please try again.`);
  }
}

export async function extractBiomarkersFromText(text: string): Promise<Array<{
  name: string;
  value: number;
  unit: string;
  category: string;
  status?: string;
}>> {
  const prompt = `You are an expert medical lab report parser. Extract ALL biomarkers from this lab report text, regardless of format.

CRITICAL PARSING RULES:
1. Lab reports come in many formats: tables, columns, lists, narrative text, PDF extracts with broken formatting
2. Look for patterns like: "Test Name: value unit" OR "Test Name ... value ... unit ... reference" OR tabular data
3. The value may be separated from the test name by spaces, tabs, colons, or other characters
4. Reference ranges (e.g., "70-100") should be ignored - only extract the patient's ACTUAL result value
5. Handle OCR artifacts: broken words, missing spaces, garbled characters
6. Some labs use abbreviations, others use full names - recognize both
7. Values may use decimal points (.) or commas (,) depending on locale
8. Units may appear before or after the value, or be implied

For each biomarker found, provide:
- name: Standardized English name (e.g., "Testosterone" not "TESTOSTERON TOTAL")
- value: The numeric patient result (NOT the reference range)
- unit: The unit of measurement (standardize to common units)
- category: One of: hormone, metabolic, inflammation, vitamin, mineral, liver, kidney, blood, thyroid, lipid
- status: "normal", "low", or "high" based on typical reference ranges

COMPREHENSIVE BIOMARKER LIST (search for these AND any variations):

HORMONES (look for any testosterone/T, estrogen/E2, FSH, LH variations):
- Testosterone, Total Testosterone, Free Testosterone, Bioavailable Testosterone
- SHBG (Sex Hormone Binding Globulin)
- Estradiol, E2, Estrogen
- LH (Luteinizing Hormone), FSH (Follicle Stimulating Hormone)
- DHT (Dihydrotestosterone)
- Prolactin, PRL
- Cortisol (morning, evening, or random)
- DHEA, DHEA-S, DHEA-Sulfate
- IGF-1 (Insulin-like Growth Factor)
- Pregnenolone, Progesterone

THYROID (critical - extract all):
- TSH (Thyroid Stimulating Hormone)
- T3, Total T3, Free T3, FT3
- T4, Total T4, Free T4, FT4
- Reverse T3, rT3
- Thyroid Antibodies: TPO, TG, Anti-TPO, Anti-TG

METABOLIC:
- Glucose, Fasting Glucose, Blood Sugar
- HbA1c, A1C, Hemoglobin A1c, Glycated Hemoglobin
- Insulin, Fasting Insulin
- HOMA-IR (may need calculation from glucose/insulin)
- C-Peptide

INFLAMMATION:
- CRP, C-Reactive Protein, hs-CRP, High-Sensitivity CRP
- Homocysteine
- ESR, Erythrocyte Sedimentation Rate, Sed Rate
- Ferritin (also iron storage marker)
- Fibrinogen
- IL-6, Interleukin-6

VITAMINS:
- Vitamin D, 25-OH Vitamin D, 25-Hydroxyvitamin D, Calcidiol
- Vitamin B12, Cobalamin
- Folate, Folic Acid, B9
- Vitamin B6, Pyridoxine
- Vitamin A, Retinol

MINERALS:
- Iron, Serum Iron
- TIBC (Total Iron Binding Capacity)
- Transferrin, Transferrin Saturation
- Magnesium, Mg
- Zinc, Zn
- Copper, Cu
- Selenium
- Potassium, K
- Sodium, Na
- Calcium, Ca
- Phosphorus, Phosphate

LIPIDS (cholesterol panel):
- Total Cholesterol
- LDL, LDL-C, LDL Cholesterol, "Bad Cholesterol"
- HDL, HDL-C, HDL Cholesterol, "Good Cholesterol"
- Triglycerides, TG
- VLDL
- Lipoprotein(a), Lp(a)
- ApoB, Apolipoprotein B
- ApoA1

LIVER:
- ALT, SGPT, Alanine Aminotransferase
- AST, SGOT, Aspartate Aminotransferase
- GGT, Gamma-GT, Gamma-Glutamyl Transferase
- ALP, Alkaline Phosphatase
- Bilirubin, Total Bilirubin, Direct Bilirubin
- Albumin
- Total Protein
- Globulin

KIDNEY:
- Creatinine, Serum Creatinine
- BUN, Blood Urea Nitrogen, Urea
- eGFR, GFR, Estimated GFR
- Uric Acid
- Cystatin C

BLOOD (CBC - Complete Blood Count):
- Hemoglobin, Hgb, Hb
- Hematocrit, Hct
- RBC, Red Blood Cells, Erythrocytes
- WBC, White Blood Cells, Leukocytes
- Platelets, PLT, Thrombocytes
- MCV, MCH, MCHC, RDW
- Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils (absolute and %)

CARDIAC:
- BNP, NT-proBNP
- Troponin
- Homocysteine

Lab Report Text:
${text}

IMPORTANT: Return a JSON object with a "biomarkers" array. Extract EVERY biomarker you can find, even if formatting is messy. Be thorough - users depend on complete extraction.

Example response format:
{"biomarkers": [{"name": "Testosterone", "value": 450, "unit": "ng/dL", "category": "hormone", "status": "normal"}]}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert medical lab report parser specializing in extracting biomarkers from any format of lab report. You can handle messy OCR text, various international formats, tables, and unstructured data. Extract every biomarker you can identify. Always respond with valid JSON containing a biomarkers array."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = response.choices[0].message.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.biomarkers || []);
  } catch (error) {
    console.error("Biomarker extraction error:", error);
    return [];
  }
}

function getDefaultAnalysis(): AnalysisResult {
  return {
    performanceAge: 32,
    peptideReadiness: {
      status: "good",
      bpc157: { recommended: true, dosage: "250-500mcg daily", protocol: "4-6 week cycles with 2 week breaks", rationale: "BPC-157 supports tissue repair and gut health. Based on good baseline inflammation markers, this peptide is well-tolerated and can accelerate recovery from training." },
      tb500: { recommended: true, dosage: "2-2.5mg twice weekly", protocol: "4-6 week loading, then maintenance", rationale: "TB-500 promotes tissue repair and reduces inflammation. Synergizes well with BPC-157 for comprehensive healing support." },
      nadPlus: { recommended: true, dosage: "250-500mg NMN or NR daily", protocol: "Oral NAD+ precursors daily, or periodic IV NAD+ infusions", rationale: "NAD+ levels naturally decline with age, affecting cellular energy production, DNA repair, and metabolic function. Supplementation supports mitochondrial health and cognitive function." },
      sermorelin: { recommended: false, dosage: "200-300mcg before bed", protocol: "Daily subcutaneous, 5 days on 2 off", rationale: "Growth hormone axis appears functional based on current markers. Consider if sleep quality or recovery become concerns." },
      ipamorelin: { recommended: false, dosage: "200-300mcg before bed", protocol: "Daily subcutaneous, often combined with CJC-1295", rationale: "Not currently indicated. May consider for body composition optimization in future." },
      cjc1295: { recommended: false, dosage: "100-200mcg 2-3x weekly", protocol: "Often paired with Ipamorelin for synergistic GH release", rationale: "Growth hormone optimization not currently a priority based on markers." },
      thymosinAlpha1: { recommended: false, dosage: "1.6mg 2-3x weekly", protocol: "Subcutaneous for immune modulation", rationale: "Immune function appears adequate. Consider during illness or if inflammation markers elevate." },
      motsc: { recommended: true, dosage: "5-10mg weekly", protocol: "Subcutaneous 1-2x weekly", rationale: "MOTS-c is a mitochondrial-derived peptide that enhances metabolic function and exercise capacity. Particularly beneficial for maintaining insulin sensitivity and energy production." },
      ss31: { recommended: false, dosage: "5-10mg daily", protocol: "Subcutaneous targeting mitochondria", rationale: "SS-31 targets inner mitochondrial membrane. Consider for advanced optimization or if energy markers decline." },
      epithalon: { recommended: true, dosage: "5-10mg daily for 10-20 days", protocol: "Cyclical use 2-3 times per year", rationale: "Epithalon activates telomerase, potentially supporting longevity. Recommended for periodic use as part of comprehensive anti-aging strategy." },
      ghStatus: "Growth hormone axis functioning normally based on available markers. IGF-1 levels optimal for age.",
      overallNotes: "Peptide strategy: Start with BPC-157 and TB-500 for recovery support, add NAD+ precursors for cellular health, and consider periodic Epithalon cycles for longevity. MOTS-c can enhance metabolic function. GH secretagogues not currently indicated but may be considered in future."
    },
    hormoneStatus: {
      testosterone: 612,
      testosteroneStatus: "good",
      freeT: 18.5,
      estradiol: 28,
      shbg: 32,
      trtRecommendation: {
        recommended: false,
        maxDosage: "Not currently recommended",
        frequency: "N/A",
        rationale: "Current testosterone levels (612 ng/dL) and free T (18.5 pg/mL) are within optimal range. TRT is not indicated at this time. Focus on natural optimization through lifestyle factors.",
        naturalAlternatives: ["Quality sleep (7-9 hours)", "Resistance training 3-4x weekly", "Stress management", "Maintain healthy body fat (10-20%)", "Zinc and Vitamin D optimization", "Limit alcohol consumption"],
        monitoring: ["Retest total and free T in 6-12 months", "Monitor symptoms of low T", "Track energy and libido"]
      },
      detailedAnalysis: "Your hormone profile is healthy. Testosterone at 612 ng/dL places you in the optimal range. Free testosterone at 18.5 pg/mL indicates good bioavailability. SHBG at 32 nmol/L is balanced - not too high to bind excess testosterone, not too low. Estradiol at 28 pg/mL is appropriate for your testosterone level. Continue current lifestyle practices to maintain these levels. If you notice declining energy, libido, or recovery, retest in 6 months."
    },
    metabolicStatus: {
      glucose: 92,
      hba1c: 5.2,
      insulin: 6.8,
      homaIr: 1.5,
      notes: "Excellent metabolic health. Fasting glucose of 92 mg/dL is optimal (under 100). HbA1c of 5.2% indicates excellent long-term glucose control. Insulin at 6.8 uIU/mL shows no hyperinsulinemia. HOMA-IR of 1.5 indicates good insulin sensitivity. Maintain through regular exercise, balanced nutrition with adequate protein, and avoiding processed carbohydrates."
    },
    inflammation: {
      status: "good",
      crp: 0.8,
      homocysteine: 8.2,
      ferritin: 95,
      notes: "Inflammation markers are well-controlled. CRP at 0.8 mg/L (optimal <1.0) indicates low systemic inflammation. Homocysteine at 8.2 umol/L is healthy (optimal <10). Ferritin at 95 ng/mL is balanced - enough iron stores without excess oxidative potential. Continue anti-inflammatory practices: omega-3 fatty acids, colorful vegetables, quality sleep, stress management."
    },
    morningRoutine: [
      { time: "6:00 AM", action: "Wake + Morning Light", details: "Get 10-15 minutes of direct sunlight exposure within the first hour of waking. This sets your circadian rhythm, triggers cortisol awakening response, and programs better melatonin release 14-16 hours later. Even on cloudy days, outdoor light is 10-50x brighter than indoor lighting.", priority: "high" },
      { time: "6:15 AM", action: "Hydration Protocol", details: "Drink 16-20oz water with a pinch of sea salt (sodium) or electrolyte mix. After 7-8 hours without water, you wake dehydrated. Proper hydration improves cognitive function, energy, and nutrient transport. Add lemon if desired for digestion support.", priority: "high" },
      { time: "6:25 AM", action: "Cold Exposure", details: "End your shower with 1-3 minutes of cold water (as cold as tolerable). This increases norepinephrine by 200-300%, improving mood and alertness for hours. Cold exposure also activates brown fat, improves recovery, and builds mental resilience. Start with 30 seconds and gradually increase.", priority: "medium" },
      { time: "6:35 AM", action: "Movement/Mobility", details: "10-15 minute mobility routine focusing on hips, thoracic spine, and shoulders. This activates the nervous system, improves joint health, and prepares your body for the day. Include cat-cow stretches, hip circles, and shoulder rotations.", priority: "medium" },
      { time: "6:50 AM", action: "Breathwork", details: "5-10 minutes of box breathing (4 seconds inhale, 4 hold, 4 exhale, 4 hold) or similar practice. This activates parasympathetic nervous system, reduces cortisol, and improves focus. Sets calm, intentional tone for the day.", priority: "medium" },
    ],
    eveningRoutine: [
      { time: "7:00 PM", action: "Dim Lights & Block Blue Light", details: "Switch to warm lighting and wear blue light blocking glasses. Blue light after sunset suppresses melatonin production by up to 50%. This single habit can dramatically improve sleep quality. Use red/amber lights in bedroom.", priority: "high" },
      { time: "8:00 PM", action: "Digital Sunset", details: "Stop work emails and stimulating content. Transition to relaxing activities: reading (paper book preferred), gentle stretching, conversation, or meditation. Cortisol should naturally decline in evening - don't spike it with stressful content.", priority: "high" },
      { time: "8:30 PM", action: "Evening Supplements", details: "Take magnesium glycinate 300-400mg. Magnesium supports GABA activity for calm, aids muscle relaxation, and improves sleep architecture. Best taken 1-2 hours before bed. Add zinc 15-30mg if levels are suboptimal.", priority: "high" },
      { time: "9:00 PM", action: "Cool Down Environment", details: "Set bedroom temperature to 65-68°F (18-20°C). Your core body temperature must drop 2-3 degrees for sleep onset and to stay asleep. This is physiologically non-negotiable. Consider a cooling mattress pad if overheating is an issue.", priority: "high" },
      { time: "9:30-10:00 PM", action: "Sleep", details: "Aim for consistent bedtime within a 30-minute window, even on weekends. Adults need 7-9 hours. Sleep is when growth hormone peaks (especially first 90 min), memories consolidate, the glymphatic system clears brain toxins, and tissue repairs occur. It's not optional for optimization.", priority: "high" },
    ],
    supplementProtocol: [
      { name: "Vitamin D3 + K2", dosage: "1000-2000 IU D3 + 100-200mcg K2 (MK-7 form) daily", timing: "Morning with fat-containing meal", purpose: "Optimize vitamin D for immune function, bone health, and hormone production while K2 directs calcium properly", mechanism: "D3 is a fat-soluble hormone precursor regulating 200+ genes. K2 activates osteocalcin and matrix GLA protein to direct calcium into bones and away from arteries. Essential combination.", expectedBenefits: "Improved immune function, better mood, optimized hormone levels, stronger bones, cardiovascular protection", evidenceLevel: "strong", precautions: "Retest D3 levels after 3 months. Target 40-60 ng/mL. Do not exceed 4000 IU long-term without testing.", synergies: ["Magnesium", "Omega-3"], notes: "K2 MK-7 form has longer half-life than MK-4. Always take D3 with K2 for proper calcium metabolism." },
      { name: "B-Complex (Methylated Forms)", dosage: "1 capsule daily: Methylfolate 400-800mcg, Methylcobalamin B12 1000mcg, B6 as P5P 25-50mg, plus B1, B2, B3, B5, Biotin", timing: "Morning with breakfast - B vitamins are energizing", purpose: "Support energy metabolism, methylation, homocysteine control, nervous system function", mechanism: "Methylated forms bypass MTHFR gene variants (40% of population). Active forms immediately usable vs synthetic forms requiring conversion. Essential for cellular energy production.", expectedBenefits: "Improved energy, better methylation, reduced homocysteine, cognitive support, mood stabilization, healthy hair/skin/nails", evidenceLevel: "strong", precautions: "CRITICAL: Avoid folic acid (use methylfolate), avoid cyanocobalamin (use methylcobalamin). These are bioactive forms that work for everyone.", synergies: ["Magnesium", "Zinc"], notes: "B vitamins are water-soluble and depleted by stress, alcohol, and many medications. Regular supplementation recommended." },
      { name: "Omega-3 Fish Oil (EPA/DHA)", dosage: "2-3g combined EPA+DHA daily (triglyceride form)", timing: "With any fat-containing meal for absorption", purpose: "Reduce inflammation, support brain health, cardiovascular protection", mechanism: "EPA reduces pro-inflammatory eicosanoids. DHA is structural component of brain and retina. Both improve cell membrane fluidity and compete with pro-inflammatory omega-6.", expectedBenefits: "Reduced inflammation (lower CRP), improved mood, better cognitive function, cardiovascular protection, joint health", evidenceLevel: "strong", precautions: "Choose IFOS-certified triglyceride form over ethyl ester. May increase bleeding time - discuss with doctor if on blood thinners.", synergies: ["Vitamin D", "Vitamin E", "Curcumin"], notes: "Aim for Omega-6:Omega-3 ratio of 4:1 or lower. Most Western diets are 15:1 - this drives inflammation." },
      { name: "Magnesium Glycinate", dosage: "300-400mg elemental magnesium daily", timing: "Evening before bed - promotes relaxation and sleep", purpose: "Support 300+ enzymatic reactions, muscle relaxation, sleep quality, stress response", mechanism: "Glycinate form is highly bioavailable and gentle on stomach. Magnesium is cofactor for ATP production, GABA activation, and muscle/nerve function.", expectedBenefits: "Better sleep quality, reduced muscle cramps, improved stress resilience, blood pressure support, glucose metabolism", evidenceLevel: "strong", precautions: "Avoid oxide form (poor absorption). Glycinate is best for sleep. Citrate if constipation is an issue. Threonate for cognitive focus.", synergies: ["Vitamin D", "B6", "Zinc"], notes: "80% of population is deficient. Depleted by stress, caffeine, alcohol, and many medications." },
      { name: "Zinc", dosage: "15-30mg elemental zinc daily (picolinate or glycinate form)", timing: "With food. Separate from calcium and iron by 2+ hours", purpose: "Support immune function, testosterone production, wound healing, protein synthesis", mechanism: "Cofactor for 300+ enzymes including those for testosterone synthesis, immune cell function, and DNA repair.", expectedBenefits: "Improved immune function, testosterone optimization, better skin healing, taste sensitivity, protein synthesis", evidenceLevel: "strong", precautions: "Do not exceed 40mg daily long-term. Balance with 2mg copper per 15-30mg zinc to prevent copper depletion.", synergies: ["Vitamin B6", "Magnesium"], notes: "Athletes, vegetarians, and stressed individuals have higher needs. Phytates in grains block absorption." },
      { name: "Creatine Monohydrate", dosage: "5g daily", timing: "Anytime - with food or post-workout", purpose: "Strength, power, cognitive function, cellular energy", mechanism: "Stored as phosphocreatine in muscles and brain, rapidly regenerating ATP during high-intensity activity. Also provides cognitive benefits through brain energy metabolism.", expectedBenefits: "Increased strength and power output, faster recovery between sets, improved cognitive performance, potential neuroprotective effects", evidenceLevel: "strong", precautions: "Stay well hydrated. No loading phase necessary - 5g daily reaches saturation in 3-4 weeks. Monohydrate is the most studied form.", synergies: ["Beta-Alanine", "HMB", "Protein"], notes: "One of the most studied and effective supplements. Benefits athletes and non-athletes alike for brain health." },
    ],
    lifestyleGuidance: {
      sleepOptimization: {
        targetHours: "7-8.5 hours, experiment to find your optimal duration",
        qualityTips: ["Keep room at 65-68°F (18-20°C)", "Complete darkness or quality sleep mask", "No screens 1 hour before bed", "Consistent sleep/wake times even weekends", "No caffeine after 2 PM (earlier if sensitive)", "Finish eating 3+ hours before bed"],
        chronotypeAdvice: "Determine if you're naturally an early bird (lion) or night owl (wolf). Work with your biology rather than against it. Most people fall somewhere in the middle (bear chronotype).",
        rationale: "Sleep is the single most important factor for health optimization. Growth hormone peaks during deep sleep (especially first 90 minutes). Memory consolidation, cellular repair, metabolic regulation, and brain toxin clearance all depend on quality sleep. No supplement, diet, or training program can compensate for poor sleep."
      },
      stressManagement: {
        techniques: ["Box breathing (4-4-4-4 pattern)", "5-10 minute morning meditation", "Regular nature exposure", "Physical exercise as stress release", "Journaling for mental clarity", "Social connection with supportive people"],
        dailyPractice: "Minimum 10 minutes of intentional stress-reduction practice daily. Non-negotiable.",
        rationale: "Chronic stress chronically elevates cortisol, which impairs testosterone production, increases abdominal fat storage, raises inflammation, disrupts sleep, and accelerates aging. Your biomarkers will never fully optimize without addressing stress. The goal isn't eliminating stress but developing resilience and recovery practices."
      },
      nutritionPrinciples: {
        macroSplit: "Protein: 0.8-1g per pound bodyweight. Fats: 25-35% of calories (prioritize omega-3, olive oil, nuts). Carbs: Fill remainder based on activity level.",
        mealTiming: "Eat within a 10-12 hour window. First meal at least 1 hour after waking to extend overnight fasting benefits. Stop eating 3+ hours before bed to improve sleep quality and overnight GH release.",
        keyFoods: ["Wild-caught fatty fish (salmon, sardines, mackerel)", "Pasture-raised eggs", "Grass-fed beef and organ meats", "Cruciferous vegetables (broccoli, cauliflower, cabbage)", "Leafy greens", "Berries", "Extra virgin olive oil", "Nuts and seeds", "Fermented foods (yogurt, sauerkraut)"],
        foodsToAvoid: ["Processed vegetable/seed oils (canola, soybean, corn)", "Added sugars and high-fructose corn syrup", "Ultra-processed foods", "Excessive alcohol (limit to 1-2 drinks max, not daily)", "Trans fats"],
        rationale: "Nutrition directly impacts every biomarker. Anti-inflammatory whole foods reduce CRP and oxidative stress. Adequate protein supports muscle, hormone production, and immune function. Quality fats are the building blocks for hormones and cell membranes. What you eat becomes your biology."
      },
      movementGuidance: {
        dailyStepTarget: "8,000-10,000 steps minimum (more is better up to ~12,000)",
        standingBreaks: "Stand and move every 45-60 minutes if you have a sedentary job. Prolonged sitting is independently harmful regardless of exercise.",
        mobilityWork: "10-15 minutes daily focusing on hips, thoracic spine, and shoulders. These are common problem areas that affect posture and performance.",
        rationale: "Non-exercise activity thermogenesis (NEAT) matters more than many realize. Walking improves insulin sensitivity, reduces inflammation, supports mental health, and aids digestion. It's low-stress movement that everyone can do daily. Mobility prevents injury and maintains functional movement patterns."
      },
      coldExposure: {
        recommended: true,
        protocol: "Start with 30-second cold shower endings. Build to 2-3 minutes over weeks. Or cold plunge at 50-59°F for 2-11 minutes total per week. Never do immediately after strength training (blunts adaptation).",
        benefits: "Increases norepinephrine 200-300% (mood and focus boost lasting hours), activates brown fat for metabolic health, reduces inflammation, improves immune function, builds mental resilience",
        rationale: "Deliberate cold exposure has robust evidence for mood, metabolism, and recovery. The stress is hormetic - brief controlled stress that makes you more resilient. Start gradually and listen to your body. The mental challenge is part of the benefit."
      },
      sunlightExposure: {
        morningTarget: "10-30 minutes of outdoor light within first 60 minutes of waking (more on cloudy days)",
        benefits: "Sets circadian rhythm, triggers healthy cortisol rise, improves nighttime melatonin production, supports vitamin D synthesis, improves mood",
        rationale: "Morning light is the most powerful signal for your biological clock. It anchors your circadian rhythm and determines sleep quality 14-16 hours later. Indoor lighting is 10-50x dimmer than outdoor light, even on cloudy days. This is free and one of the highest-impact habits you can develop."
      },
      socialConnection: {
        importance: "Strong social connections are as predictive of longevity as smoking cessation. Loneliness increases mortality risk equivalent to smoking 15 cigarettes daily.",
        suggestions: ["Schedule regular time with friends and family", "Join community groups, sports leagues, or hobby clubs", "Prioritize face-to-face interaction over digital", "Express gratitude regularly", "Be vulnerable and authentic in relationships"],
        rationale: "Humans are social animals. Positive social connections reduce stress hormones, lower blood pressure, improve immune function, and promote healthy behaviors. No amount of supplements or biohacking can replace genuine human connection."
      }
    },
    workoutPlan: [
      { day: "Monday", type: "Upper Body Push", exercises: ["Bench Press 4x6-8 RPE 7-8", "Overhead Press 3x8-10", "Dips 3x10-12", "Lateral Raises 4x12-15", "Tricep Pushdowns 3x12-15"], duration: "45-50 min", intensity: "High" },
      { day: "Tuesday", type: "Lower Body", exercises: ["Squats 4x6-8 RPE 7-8", "Romanian Deadlifts 4x8-10", "Bulgarian Split Squats 3x10 each", "Leg Curls 3x12", "Calf Raises 4x15"], duration: "50 min", intensity: "High" },
      { day: "Wednesday", type: "Active Recovery", exercises: ["30-min Zone 2 walk or light cardio", "15-min full body mobility routine", "10-min foam rolling"], duration: "45-60 min", intensity: "Low - conversational pace" },
      { day: "Thursday", type: "Upper Body Pull", exercises: ["Pull-ups or Lat Pulldowns 4x6-10", "Barbell or Dumbbell Rows 4x8-10", "Face Pulls 3x15-20", "Bicep Curls 3x12", "Rear Delt Flies 3x15"], duration: "45 min", intensity: "High" },
      { day: "Friday", type: "Lower Body + Deadlift Focus", exercises: ["Deadlifts 4x5 RPE 7-8", "Leg Press 3x10-12", "Walking Lunges 3x10 each", "Leg Extensions 3x12", "Core Work 10 min"], duration: "50 min", intensity: "High" },
      { day: "Saturday", type: "Zone 2 Cardio + Flexibility", exercises: ["45-60 min steady cardio at conversational pace (cycling, jogging, rowing)", "15-20 min stretching or yoga"], duration: "60-75 min", intensity: "Low - Heart rate 60-70% max" },
      { day: "Sunday", type: "Complete Rest or Light Activity", exercises: ["Optional: gentle walk, yoga, family activities", "Focus on recovery, meal prep, and sleep"], duration: "Optional", intensity: "Very Low" },
    ],
    risks: [
      { category: "Vitamin D Optimization", level: "low", description: "Ensure vitamin D levels are regularly monitored", recommendation: "Supplement with 1000-2000 IU daily (not 5000 IU which is excessive). Retest in 3 months. Target blood level 40-60 ng/mL." },
      { category: "Sleep Consistency", level: "low", description: "Sleep is foundational for all optimization efforts", recommendation: "Prioritize 7-8 hours nightly with consistent sleep/wake times. Implement evening routine to improve sleep quality." },
      { category: "Stress Management", level: "low", description: "Chronic stress undermines all other optimization efforts", recommendation: "Implement daily stress management practice: breathwork, meditation, or nature exposure. Minimum 10 minutes daily." },
    ],
    notes: "Your biomarkers indicate a solid foundation for health optimization. Key priorities: 1) Maintain excellent sleep hygiene - this is your highest-leverage habit. 2) Continue or begin resistance training 3-4x weekly for hormone optimization and longevity. 3) Consider BPC-157, NAD+ precursors, and periodic Epithalon for enhanced recovery and longevity support. Your testosterone and metabolic markers are healthy - focus on maintaining these through lifestyle. If any symptoms of low energy or poor recovery develop, retest hormones in 6 months. The detailed peptide and supplement recommendations above are personalized to your current markers. This is a marathon, not a sprint - focus on sustainable habits that you can maintain long-term.",
  };
}

// Generate printable Do's and Don'ts based on biomarkers and protocol
export interface DosAndDontsResult {
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

export async function generateDosAndDonts(
  biomarkers: Biomarker[],
  protocol: any
): Promise<DosAndDontsResult> {
  const biomarkerData = biomarkers.map(b => ({
    name: b.name,
    value: b.value,
    unit: b.unit,
    status: b.status,
    category: b.category,
  }));

  const prompt = `Based on the following biomarkers and health protocol, generate a comprehensive list of DO's and DON'Ts for health optimization. This will be printed as a quick reference guide.

BIOMARKERS:
${JSON.stringify(biomarkerData, null, 2)}

PROTOCOL SUMMARY:
- Performance Age: ${protocol?.performanceAge || 'N/A'}
- Hormone Status: ${protocol?.hormoneStatus?.testosteroneStatus || 'N/A'}
- Metabolic Status: ${protocol?.metabolicStatus?.notes || 'N/A'}
- Inflammation Status: ${protocol?.inflammation?.status || 'N/A'}

Generate a JSON response with the following structure:
{
  "dos": [
    {
      "category": "Nutrition",
      "items": ["Eat X", "Consume Y daily", "Include Z in meals"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "donts": [
    {
      "category": "Nutrition",
      "items": ["Avoid X", "Limit Y", "Never consume Z"],
      "severity": "critical" | "important" | "caution"
    }
  ]
}

Categories should include: Nutrition, Exercise, Sleep, Supplements, Lifestyle, Substances, Medical
- For DO's: Include actionable, specific recommendations based on their biomarkers
- For DON'Ts: Include specific things to avoid based on their health status
- Be specific and personalized based on the biomarker data
- Include at least 4-6 categories each for dos and donts
- Each category should have 3-5 specific items`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a health optimization expert. Generate personalized, actionable do's and don'ts based on biomarker data. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const parsed = JSON.parse(content);
    
    // Validate Vitamin D dosage safety - ensure 1000-2000 IU recommendation
    const dos = (parsed.dos || []).map((category: any) => {
      if (category.items) {
        category.items = category.items.map((item: string) => {
          // Replace unsafe Vitamin D dosages (5000 IU) with safe range
          return item.replace(/5000\s*IU/gi, "1000-2000 IU").replace(/5,000\s*IU/gi, "1000-2000 IU");
        });
      }
      return category;
    });
    
    return {
      dos,
      donts: parsed.donts || [],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Do's and Don'ts generation error:", error);
    // Return default guidelines
    return {
      dos: [
        { category: "Nutrition", items: ["Eat protein with every meal (0.8-1g/lb bodyweight)", "Include colorful vegetables daily", "Stay hydrated (half your bodyweight in oz)"], priority: "high" },
        { category: "Sleep", items: ["Get 7-9 hours nightly", "Maintain consistent sleep/wake times", "Keep bedroom cool (65-68°F)"], priority: "high" },
        { category: "Exercise", items: ["Strength train 3-4x weekly", "Get 8,000-10,000 steps daily", "Include mobility work"], priority: "high" },
        { category: "Supplements", items: ["Take Vitamin D (1000-2000 IU)", "Include Omega-3 fatty acids", "Supplement magnesium at night"], priority: "medium" },
      ],
      donts: [
        { category: "Nutrition", items: ["Avoid processed seed oils", "Limit added sugars", "Don't skip meals"], severity: "important" },
        { category: "Lifestyle", items: ["Don't use screens before bed", "Avoid chronic stress", "Don't skip sleep for work"], severity: "critical" },
        { category: "Substances", items: ["Limit alcohol to 1-2 drinks max", "Avoid nicotine products", "Don't rely on caffeine past 2 PM"], severity: "important" },
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

// Generate Peptide and TRT Cycle Recommendations
export interface CycleRecommendationsResult {
  peptideCycles: {
    name: string;
    purpose: string;
    dosage: string;
    frequency: string;
    timing: string;
    cycleLength: string;
    notes: string[];
  }[];
  trtProtocol: {
    compound: string;
    dosage: string;
    frequency: string;
    timing: string;
    cycleLength: string;
    pctRequired: boolean;
    pctProtocol?: string;
    monitoring: string[];
  } | null;
  safetyGuidelines: string[];
  bloodworkMonitoring: {
    marker: string;
    frequency: string;
    targetRange: string;
  }[];
  disclaimer: string;
  generatedAt: string;
}

export async function generateCycleRecommendations(
  biomarkers: Biomarker[],
  protocol: any,
  userMetrics?: { age: number; gender: string; fitnessGoal?: string }
): Promise<CycleRecommendationsResult> {
  const biomarkerData = biomarkers.map(b => ({
    name: b.name,
    value: b.value,
    unit: b.unit,
    status: b.status,
    category: b.category,
  }));

  const prompt = `Based on the following biomarkers and health data, generate personalized peptide and TRT cycle recommendations for optimization.

USER PROFILE:
- Age: ${userMetrics?.age || 35}
- Gender: ${userMetrics?.gender || 'male'}
- Fitness Goal: ${userMetrics?.fitnessGoal || 'general optimization'}

BIOMARKERS:
${JSON.stringify(biomarkerData, null, 2)}

CURRENT HORMONE STATUS:
- Testosterone: ${protocol?.hormoneStatus?.testosterone || 'Unknown'} ng/dL
- Free T: ${protocol?.hormoneStatus?.freeT || 'Unknown'} pg/mL
- Estradiol: ${protocol?.hormoneStatus?.estradiol || 'Unknown'} pg/mL
- SHBG: ${protocol?.hormoneStatus?.shbg || 'Unknown'} nmol/L

CRITICAL GUIDELINES:
1. TRT dosage MUST NEVER exceed 200mg/week (this is an absolute maximum)
2. Start conservative and titrate up based on bloodwork
3. Include all necessary ancillaries (AI if needed)
4. Emphasize bloodwork monitoring requirements
5. Include PCT only if applicable

Generate a JSON response with this structure:
{
  "peptideCycles": [
    {
      "name": "Peptide Name",
      "purpose": "Why recommended based on their biomarkers",
      "dosage": "Specific dosage",
      "frequency": "How often",
      "timing": "When to take",
      "cycleLength": "Duration",
      "notes": ["Important consideration 1", "Important consideration 2"]
    }
  ],
  "trtProtocol": {
    "compound": "Testosterone Cypionate or Enanthate",
    "dosage": "100-150mg/week starting dose (NEVER exceed 200mg)",
    "frequency": "Split into 2-3 injections per week for stable levels",
    "timing": "Consistent days (e.g., Mon/Thu or Mon/Wed/Fri)",
    "cycleLength": "Ongoing TRT or 12-16 week cycle",
    "pctRequired": true/false,
    "pctProtocol": "If PCT needed, specific protocol",
    "monitoring": ["List of markers to monitor"]
  },
  "safetyGuidelines": ["List of critical safety considerations"],
  "bloodworkMonitoring": [
    {
      "marker": "Marker name",
      "frequency": "How often to test",
      "targetRange": "Optimal range"
    }
  ],
  "disclaimer": "Medical disclaimer text"
}

If TRT is not recommended based on their hormone levels, set trtProtocol to null and explain why in safetyGuidelines.

Include 3-5 peptide recommendations tailored to their biomarkers and goals.
Peptides to consider: BPC-157, TB-500, Ipamorelin, CJC-1295, Sermorelin, NAD+, MOTS-c, Epithalon, Thymosin Alpha-1, SS-31`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in hormone optimization and peptide therapy. Generate evidence-based, personalized cycle recommendations. Always prioritize safety and include appropriate disclaimers. NEVER recommend TRT dosages above 200mg/week. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const parsed = JSON.parse(content);
    
    // Validate TRT dosage safety - cap to strictly below 200mg/week
    let trtProtocol = parsed.trtProtocol || null;
    if (trtProtocol && trtProtocol.dosage) {
      const dosageMatch = trtProtocol.dosage.match(/(\d+)/g);
      if (dosageMatch) {
        const maxDosage = Math.max(...dosageMatch.map((n: string) => parseInt(n)));
        // Strictly below 200mg - any value >= 200 gets capped
        if (maxDosage >= 200) {
          // Replace with safe dosage range (max 180mg is strictly below 200)
          trtProtocol.dosage = "100-150mg/week (starting dose, max 180mg/week)";
          console.log("Safety: Capped TRT dosage recommendation to safe range");
        }
      }
    }
    
    return {
      peptideCycles: parsed.peptideCycles || [],
      trtProtocol,
      safetyGuidelines: parsed.safetyGuidelines || [],
      bloodworkMonitoring: parsed.bloodworkMonitoring || [],
      disclaimer: parsed.disclaimer || "DISCLAIMER: This information is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider before starting any hormone or peptide therapy. Individual responses vary and regular bloodwork monitoring is essential.",
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Cycle recommendations generation error:", error);
    // Return default recommendations
    return {
      peptideCycles: [
        {
          name: "BPC-157",
          purpose: "Tissue repair, gut healing, and anti-inflammatory effects",
          dosage: "250-500mcg",
          frequency: "Once or twice daily",
          timing: "Subcutaneous injection near injury site or abdomen",
          cycleLength: "4-6 weeks on, 2 weeks off",
          notes: ["Can be stacked with TB-500 for enhanced healing", "Very safe profile with minimal side effects"]
        },
        {
          name: "Ipamorelin + CJC-1295",
          purpose: "Growth hormone optimization for recovery and body composition",
          dosage: "200-300mcg Ipamorelin + 100mcg CJC-1295 (no DAC)",
          frequency: "Once daily",
          timing: "Before bed on empty stomach",
          cycleLength: "8-12 weeks on, 4 weeks off",
          notes: ["Best taken fasted", "Synergistic effect when combined", "Improves sleep quality"]
        },
      ],
      trtProtocol: null,
      safetyGuidelines: [
        "Always get baseline bloodwork before starting any protocol",
        "Monitor hematocrit, PSA, and lipids regularly on TRT",
        "Start with lowest effective dose and titrate based on labs and symptoms",
        "Have an exit strategy and PCT plan if cycling",
        "Work with a qualified physician who specializes in hormone optimization"
      ],
      bloodworkMonitoring: [
        { marker: "Total Testosterone", frequency: "Every 6-8 weeks initially, then quarterly", targetRange: "600-900 ng/dL" },
        { marker: "Free Testosterone", frequency: "Every 6-8 weeks initially, then quarterly", targetRange: "15-25 pg/mL" },
        { marker: "Estradiol (E2)", frequency: "Every 6-8 weeks", targetRange: "20-40 pg/mL" },
        { marker: "Hematocrit", frequency: "Every 8-12 weeks", targetRange: "Below 54%" },
        { marker: "PSA", frequency: "Annually for men over 40", targetRange: "Below 4.0 ng/mL" },
      ],
      disclaimer: "DISCLAIMER: This information is for educational purposes only and does not constitute medical advice. Always consult with a qualified healthcare provider before starting any hormone or peptide therapy. Individual responses vary and regular bloodwork monitoring is essential. Never exceed recommended dosages.",
      generatedAt: new Date().toISOString(),
    };
  }
}

// Generate personalized daily routine based on wearable data
export async function generateDailyRoutine(
  metrics: any[],
  insights: any,
  user: { name?: string | null }
) {
  const latestMetric = metrics[0];
  const avgSleep = insights?.sleepTrend?.average || 0;
  const avgHrv = insights?.hrvTrend?.average || 0;
  const recoveryStatus = insights?.recoveryStatus || 'good';
  const flags = insights?.flags || [];

  const prompt = `You are a precision health optimization coach. Based on the following wearable data from the past week, generate a personalized daily routine for today.

USER: ${user.name || 'User'}

WEARABLE DATA (Last 7 days):
- Average Sleep: ${avgSleep} minutes (${(avgSleep / 60).toFixed(1)} hours)
- Average HRV: ${avgHrv} ms
- Recovery Status: ${recoveryStatus}
- Latest Sleep Score: ${latestMetric?.sleepScore || 'N/A'}
- Latest Readiness/Recovery: ${latestMetric?.readinessScore || latestMetric?.recoveryScore || 'N/A'}
- Latest Steps: ${latestMetric?.steps || 'N/A'}
- Resting Heart Rate: ${latestMetric?.restingHr || 'N/A'} bpm

FLAGS/CONCERNS:
${flags.length > 0 ? flags.join('\n') : 'No major concerns'}

Generate a complete daily optimization protocol in JSON format with the following structure:
{
  "morningRoutine": [
    { "time": "6:00 AM", "action": "Action name", "details": "Specific details", "priority": "high|medium|low" }
  ],
  "eveningRoutine": [
    { "time": "8:00 PM", "action": "Action name", "details": "Specific details", "priority": "high|medium|low" }
  ],
  "exerciseRecommendation": {
    "type": "Type of exercise recommended today",
    "intensity": "low|moderate|high",
    "duration": "30 minutes",
    "timing": "Best time of day",
    "notes": "Any modifications based on recovery"
  },
  "nutritionGuidance": {
    "hydration": "Specific hydration goals",
    "macroFocus": "What to prioritize today",
    "timing": "Meal timing suggestions",
    "supplements": ["List of supplements to take"]
  },
  "sleepOptimization": {
    "targetBedtime": "10:00 PM",
    "targetWakeTime": "6:00 AM",
    "preSleepRoutine": ["List of pre-sleep activities"],
    "environmentTips": ["Room optimization tips"]
  },
  "recoveryProtocol": {
    "active": ["Active recovery activities"],
    "passive": ["Passive recovery activities"],
    "priority": "low|moderate|high"
  },
  "insights": [
    "Key insight 1 about their data",
    "Key insight 2",
    "Key insight 3"
  ],
  "flags": [
    "Any concerns or areas needing attention"
  ]
}

Key principles:
- If recovery is low, recommend lighter exercise and more recovery focus
- If HRV is declining, emphasize stress management and sleep
- If sleep is below 7 hours, prioritize sleep optimization
- Be specific and actionable
- Adjust intensity based on recovery status
- NEVER provide medical advice or medication recommendations
- Focus on lifestyle, movement, nutrition, and recovery`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a precision health optimization coach that creates personalized daily routines based on wearable data. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const routine = JSON.parse(content);
    return {
      morningRoutine: routine.morningRoutine || [],
      eveningRoutine: routine.eveningRoutine || [],
      exerciseRecommendation: routine.exerciseRecommendation || null,
      nutritionGuidance: routine.nutritionGuidance || null,
      sleepOptimization: routine.sleepOptimization || null,
      recoveryProtocol: routine.recoveryProtocol || null,
      insights: routine.insights || [],
      flags: routine.flags || flags,
    };
  } catch (error) {
    console.error("Daily routine generation error:", error);
    return {
      morningRoutine: [
        { time: "6:00 AM", action: "Hydrate", details: "Drink 16oz of water with electrolytes", priority: "high" },
        { time: "6:15 AM", action: "Light Movement", details: "5-10 minutes of gentle stretching or yoga", priority: "medium" },
        { time: "6:30 AM", action: "Sunlight Exposure", details: "Get 10-15 minutes of morning sunlight", priority: "high" },
      ],
      eveningRoutine: [
        { time: "8:00 PM", action: "Blue Light Reduction", details: "Put on blue light blocking glasses", priority: "high" },
        { time: "9:00 PM", action: "Wind Down", details: "Light reading or meditation", priority: "medium" },
        { time: "10:00 PM", action: "Sleep", details: "Lights out, cool room (65-68F)", priority: "high" },
      ],
      exerciseRecommendation: {
        type: recoveryStatus === 'low' ? "Light recovery walk or yoga" : "Zone 2 cardio or strength training",
        intensity: recoveryStatus === 'low' ? "low" : "moderate",
        duration: "30-45 minutes",
        timing: "Morning or early afternoon",
        notes: "Listen to your body and adjust as needed",
      },
      nutritionGuidance: {
        hydration: "Aim for 3-4 liters of water throughout the day",
        macroFocus: "Prioritize protein at each meal",
        timing: "Eat within 8-10 hour window",
        supplements: ["Vitamin D", "Omega-3", "Magnesium"],
      },
      sleepOptimization: {
        targetBedtime: "10:00 PM",
        targetWakeTime: "6:00 AM",
        preSleepRoutine: ["No screens 1 hour before bed", "Cool shower", "Light stretching"],
        environmentTips: ["Keep room at 65-68F", "Complete darkness", "White noise if needed"],
      },
      recoveryProtocol: {
        active: ["Walking", "Stretching", "Mobility work"],
        passive: ["Sauna or hot tub", "Massage", "Deep breathing"],
        priority: recoveryStatus === 'low' ? "high" : "moderate",
      },
      insights: flags.length > 0 ? flags : ["Based on your data, focus on consistency today"],
      flags: flags,
    };
  }
}
