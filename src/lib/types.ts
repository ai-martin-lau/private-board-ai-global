// User profile (collected via onboarding wizard)
export interface Profile {
  lifeStage: string;           // Q1
  topThreeValues: string;      // Q2 — comma/whitespace-separated, free text
  biggestFear: string;         // Q3
  riskAppetite: "conservative" | "balanced" | "aggressive"; // Q4
  importantPeople: string;     // Q5
  recentImpact: string;        // Q6
  decisionStyle: string;       // Q7
}

// One advisor's summary card (for Stage 1 selection)
export interface AdvisorSummary {
  id: string;                  // e.g. "munger", "naval"
  nameZh: string;              // 中文名 e.g. "查理·芒格"
  nameEn?: string;             // English name (optional)
  tagline: string;             // 1-line positioning
  mentalModels: string[];      // bullet list, ~5 items
  heuristics: string[];        // bullet list, ~5 items
}

// One advisor's full personality card (for Stage 2 debate)
export interface AdvisorFull {
  id: string;
  nameZh: string;
  nameEn?: string;
  tagline: string;
  fullText: string;            // ~12-14KB markdown
}

// Stage 1 response
export interface SelectionResult {
  selected: string[];          // advisor ids
  reasons: Record<string, string>;
}

// SSE event emitted during debate
export interface DebateEvent {
  speaker: string;             // advisor id
  delta: string;
}

export interface DebateTurn {
  round: number;
  speaker: string;
  content: string;
}

export type AppLanguage = "zh" | "en";

// Budget state
export interface BudgetState {
  remainingCny: number;
  percentUsed: number;
  resetAt: string;             // ISO date
}
