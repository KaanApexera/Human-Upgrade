export const PEPTIDE_CATEGORIES = {
  muscleGrowth: {
    name: "Muscle Growth, Strength & Performance",
    description: "Lean mass, hypertrophy, recovery, strength signaling",
    peptides: [
      { name: "CJC-1295 + Ipamorelin", purpose: "Growth hormone release, muscle growth, recovery" },
      { name: "Ipamorelin", purpose: "Selective GH release, lean mass gains" },
      { name: "GHRP-2", purpose: "Strong GH release, appetite increase, muscle building" },
      { name: "GHRP-6", purpose: "Potent GH secretagogue, hunger stimulation" },
      { name: "IGF-1", purpose: "Muscle hypertrophy, cell growth, recovery" },
      { name: "Follistatin", purpose: "Myostatin inhibition, muscle growth potential" },
      { name: "Sermorelin", purpose: "Natural GH stimulation, anti-aging, lean mass" },
    ],
  },
  recovery: {
    name: "Recovery, Injury Repair & Anti-Inflammation",
    description: "Tendon, ligament, muscle, gut, and tissue repair",
    peptides: [
      { name: "BPC-157", purpose: "Gut healing, tendon/ligament repair, anti-inflammatory" },
      { name: "TB-500", purpose: "Tissue regeneration, wound healing, flexibility" },
      { name: "Wolverine Stack (BPC-157 + TB-500)", purpose: "Comprehensive tissue repair and recovery" },
      { name: "Glow Stack (BPC-157 + TB-500 + GHK-Cu)", purpose: "Tissue repair plus skin/collagen benefits" },
      { name: "KLOW Stack (BPC-157 + TB-500 + GHK-Cu + KPV)", purpose: "Full recovery with anti-inflammatory support" },
    ],
  },
  longevity: {
    name: "Longevity, Cellular Repair & Anti-Aging",
    description: "Mitochondria, cellular signaling, aging pathways",
    peptides: [
      { name: "Epithalon", purpose: "Telomere extension, cellular longevity, anti-aging" },
      { name: "MOTS-C", purpose: "Mitochondrial health, metabolic regulation, exercise mimetic" },
      { name: "NAD+", purpose: "Cellular energy, DNA repair, aging reversal" },
      { name: "L-Glutathione", purpose: "Master antioxidant, detoxification, cellular protection" },
    ],
  },
  cognitive: {
    name: "Cognitive Function, Mood & Neuro Support",
    description: "Focus, memory, anxiety reduction, mental clarity",
    peptides: [
      { name: "Semax", purpose: "Cognitive enhancement, focus, neuroprotection" },
      { name: "Selank", purpose: "Anxiety reduction, mood stabilization, mental clarity" },
      { name: "DSIP", purpose: "Deep sleep induction, stress reduction, recovery" },
    ],
  },
  sleep: {
    name: "Sleep & Circadian Optimization",
    description: "Deep sleep, recovery sleep, nervous system regulation",
    peptides: [
      { name: "DSIP", purpose: "Delta sleep-inducing peptide, deep restorative sleep" },
      { name: "Ipamorelin", purpose: "Evening GH pulse, sleep quality improvement" },
      { name: "CJC-1295 + Ipamorelin", purpose: "Sustained GH release during sleep" },
      { name: "Sermorelin", purpose: "Natural sleep cycle optimization" },
      { name: "Epithalon", purpose: "Circadian rhythm regulation, melatonin support" },
    ],
  },
  fatLoss: {
    name: "Fat Loss & Metabolic Optimization",
    description: "Weight loss, appetite control, glucose regulation, energy expenditure",
    peptides: [
      { name: "Tirzepatide", purpose: "Dual GIP/GLP-1 agonist, significant weight loss" },
      { name: "Retatrutide", purpose: "Triple agonist, enhanced metabolic effects" },
      { name: "Mazdutide", purpose: "Dual agonist, appetite suppression, fat loss" },
      { name: "Survodutide", purpose: "GLP-1/Glucagon agonist, metabolic optimization" },
      { name: "Cagrilintide", purpose: "Amylin analog, satiety enhancement" },
      { name: "AOD-9604", purpose: "Fat metabolism fragment, targeted fat loss" },
      { name: "Frag 176", purpose: "HGH fragment, lipolysis activation" },
      { name: "SLU-PP-322", purpose: "Exercise mimetic, metabolic enhancement" },
      { name: "5-Amino-1MQ", purpose: "NNMT inhibitor, fat cell metabolism" },
      { name: "Tesamorelin", purpose: "Visceral fat reduction, GH stimulation" },
    ],
  },
  hormonal: {
    name: "Hormonal Balance, Libido & Reproductive Health",
    description: "Sex hormones, libido, endocrine signaling",
    peptides: [
      { name: "Kisspeptin", purpose: "Natural hormone signaling, fertility support" },
      { name: "Melanotan II", purpose: "Libido enhancement, tanning, appetite regulation" },
    ],
  },
  energy: {
    name: "Energy, Vitality & General Wellness",
    description: "Systemic energy, metabolism, resilience",
    peptides: [
      { name: "Vitamin B-12", purpose: "Energy production, nerve function, red blood cells" },
      { name: "NAD+", purpose: "Cellular energy currency, mitochondrial function" },
      { name: "MOTS-C", purpose: "Metabolic regulation, exercise capacity, energy" },
    ],
  },
};

export interface UserGoal {
  primary: string;
  secondary?: string[];
  biomarkerDeficiencies?: string[];
  fitnessLevel?: string;
  age?: number;
}

export function getPeptideRecommendations(goals: UserGoal): {
  primary: typeof PEPTIDE_CATEGORIES[keyof typeof PEPTIDE_CATEGORIES]["peptides"];
  secondary: typeof PEPTIDE_CATEGORIES[keyof typeof PEPTIDE_CATEGORIES]["peptides"];
  stacks: string[];
  reasoning: string;
} {
  const goalToCategoryMap: Record<string, (keyof typeof PEPTIDE_CATEGORIES)[]> = {
    "muscle_growth": ["muscleGrowth", "recovery"],
    "muscle_building": ["muscleGrowth", "recovery"],
    "strength": ["muscleGrowth"],
    "hypertrophy": ["muscleGrowth", "recovery"],
    "fat_loss": ["fatLoss", "energy"],
    "weight_loss": ["fatLoss"],
    "body_recomposition": ["fatLoss", "muscleGrowth"],
    "movie_star_body": ["muscleGrowth", "fatLoss", "recovery"],
    "elite_physique": ["muscleGrowth", "fatLoss", "hormonal"],
    "recovery": ["recovery"],
    "injury_repair": ["recovery"],
    "anti_aging": ["longevity", "sleep"],
    "longevity": ["longevity", "energy"],
    "cognitive": ["cognitive", "sleep"],
    "focus": ["cognitive"],
    "mental_clarity": ["cognitive"],
    "sleep": ["sleep", "recovery"],
    "sleep_optimization": ["sleep"],
    "energy": ["energy", "longevity"],
    "vitality": ["energy", "hormonal"],
    "hormonal_balance": ["hormonal", "energy"],
    "libido": ["hormonal"],
    "general_wellness": ["energy", "longevity", "sleep"],
  };

  const primaryGoal = goals.primary.toLowerCase().replace(/\s+/g, "_");
  const categories = goalToCategoryMap[primaryGoal] || ["energy", "recovery"];
  
  const primaryCategory = PEPTIDE_CATEGORIES[categories[0]];
  const secondaryCategory = categories[1] ? PEPTIDE_CATEGORIES[categories[1]] : null;

  const stacks: string[] = [];
  
  if (categories.includes("recovery")) {
    stacks.push("Wolverine Stack (BPC-157 + TB-500) for comprehensive tissue repair");
  }
  if (categories.includes("muscleGrowth") && categories.includes("fatLoss")) {
    stacks.push("CJC-1295 + Ipamorelin for lean mass while cutting");
  }
  if (categories.includes("longevity")) {
    stacks.push("Epithalon + NAD+ for cellular rejuvenation");
  }
  if (categories.includes("cognitive") && categories.includes("sleep")) {
    stacks.push("Semax + DSIP for cognitive performance and recovery sleep");
  }

  let reasoning = `Based on your ${goals.primary} goal, `;
  reasoning += `we recommend peptides from the ${primaryCategory.name} category. `;
  if (secondaryCategory) {
    reasoning += `For complementary support, consider options from ${secondaryCategory.name}. `;
  }
  if (goals.age && goals.age > 40) {
    reasoning += `Given your age, longevity-focused peptides like Epithalon may provide additional benefit. `;
  }

  return {
    primary: primaryCategory.peptides,
    secondary: secondaryCategory?.peptides || [],
    stacks,
    reasoning,
  };
}

export function formatPeptideKnowledgeForPrompt(): string {
  let knowledge = "PEPTIDE OPTIMIZATION KNOWLEDGE BASE:\n\n";
  
  for (const [key, category] of Object.entries(PEPTIDE_CATEGORIES)) {
    knowledge += `## ${category.name}\n`;
    knowledge += `${category.description}\n`;
    knowledge += `Peptides:\n`;
    for (const peptide of category.peptides) {
      knowledge += `- ${peptide.name}: ${peptide.purpose}\n`;
    }
    knowledge += "\n";
  }

  knowledge += `
## RECOMMENDED STACKS:
- Wolverine Stack (BPC-157 + TB-500): Comprehensive tissue repair and recovery
- Glow Stack (BPC-157 + TB-500 + GHK-Cu): Tissue repair plus skin/collagen benefits
- KLOW Stack (BPC-157 + TB-500 + GHK-Cu + KPV): Full recovery with anti-inflammatory
- CJC-1295 + Ipamorelin: Gold standard for GH optimization and lean mass
- Semax + Selank: Cognitive enhancement with mood support

## GOAL-BASED RECOMMENDATIONS:
- Movie Star Body / Elite Physique: CJC-1295 + Ipamorelin, AOD-9604, BPC-157
- Maximum Fat Loss: Tirzepatide or Retatrutide, 5-Amino-1MQ, Tesamorelin
- Muscle Building: IGF-1, Follistatin, GHRP-2/6
- Anti-Aging / Longevity: Epithalon, NAD+, MOTS-C, L-Glutathione
- Injury Recovery: BPC-157, TB-500, GHK-Cu
- Sleep Optimization: DSIP, Ipamorelin (evening), Epithalon
- Cognitive Performance: Semax, Selank
`;

  return knowledge;
}
