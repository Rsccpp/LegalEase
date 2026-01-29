export interface AnalysisResult {
  summary: {
    en: string;
    hi: string;
    ta?: string; // Potential for more languages
  };
  complexityScore: number; // 1-10
  persona: string; // e.g., "Student", "Freelancer", "Consumer"
  verdict: 'Safe' | 'Caution' | 'Dangerous';
  risks: {
    category: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    clause: string;
    whyRisky: string;
    recommendation: string; // Actionable advice
    alternativeClause?: string; // Suggested safer text
  }[];
  clauseCards: {
    title: string;
    summary: string;
    icon: string;
  }[];
  hiddenFees: {
    item: string;
    description: string;
    estimatedCost?: string;
  }[];
  jargonTranslator: {
    term: string;
    plainEnglish: string;
  }[];
}

export interface ComparisonResult {
  summary: string;
  baselineName: string;
  comparisonName: string;
  changes: {
    type: 'Added' | 'Removed' | 'Modified';
    description: string;
    impact: 'Positive' | 'Negative' | 'Neutral';
    originalText?: string;
    newText?: string;
  }[];
  riskShift: string;
}

export interface HistoryItem {
  id: string;
  filename: string;
  secondFilename?: string;
  timestamp: number;
  result: AnalysisResult | ComparisonResult;
  type: 'Analysis' | 'Comparison';
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD'
}

export type ModalTab = 'mission' | 'tech' | 'security' | 'features';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}