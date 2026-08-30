// Core type definitions for VeriLens Misinformation Detection Platform

export type InputType = 'text' | 'url' | 'claim';

export type VerdictType =
  | 'likely_credible'
  | 'potentially_misleading'
  | 'insufficient_evidence'
  | 'likely_false';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ExtractedClaim {
  id: string;
  text: string;
  category: 'scientific' | 'political' | 'health' | 'economic' | 'general';
  verifiable: boolean;
  searchQuery: string;
}

export type NormalizedFactCheckRating =
  | 'false'
  | 'mostly_false'
  | 'misleading'
  | 'unproven'
  | 'mixture'
  | 'mostly_true'
  | 'true';

export interface FactCheckItem {
  id: string;
  claim: string;
  claimant?: string;
  claimDate?: string;
  publisher: string;
  publisherDomain?: string;
  ratingText: string;
  normalizedRating: NormalizedFactCheckRating;
  reviewDate?: string;
  url: string;
}

export interface RelatedCoverageArticle {
  id: string;
  title: string;
  source: string;
  domain: string;
  url: string;
  date: string;
  language: string;
}

export interface SourceProfile {
  domain: string;
  isHttps: boolean;
  safeBrowsingStatus: 'safe' | 'suspicious' | 'unsafe' | 'untested';
  safeBrowsingDetails?: string;
  hasAuthor: boolean;
  authorName?: string;
  hasDate: boolean;
  publishDate?: string;
  citationCount: number;
  outboundLinksCount: number;
}

export interface FlaggedPhrase {
  id: string;
  phrase: string;
  category: 'sensationalism' | 'emotional_appeal' | 'urgency' | 'hyperbole' | 'absolute_assertion' | 'clickbait';
  reason: string;
  startIndex: number;
  endIndex: number;
  severity: 'low' | 'medium' | 'high';
}

export interface LinguisticSignals {
  sensationalismScore: number; // 0 (calm/neutral) to 100 (extreme sensationalism)
  emotionalScore: number;      // 0 to 100
  certaintyScore: number;      // 0 to 100
  flaggedPhrases: FlaggedPhrase[];
  totalWords: number;
  flaggedDensityPercentage: number;
}

export interface DimensionScores {
  factCheckScore: number;          // -100 to 100 (heaviest weight)
  sourceReputationScore: number;   // 0 to 100
  corroborationScore: number;      // 0 to 100
  manipulativeLanguageScore: number;// 0 to 100 (higher = cleaner, lower = highly manipulative)
  transparencyScore: number;       // 0 to 100 (author, date, citations)
}

export interface AISynthesisReport {
  summary: string;
  key_findings: string[];
  limitations: string[];
  recommended_next_steps: string[];
  isAIGenerated: boolean;
  modelUsed?: string;
}

export interface ScoreExplanationItem {
  dimension: string;
  weight: number;
  score: number;
  weightedContribution: number;
  rationale: string;
}

export interface CalculationDetails {
  formulaDescription: string;
  weights: {
    factCheck: number;
    corroboration: number;
    sourceReputation: number;
    manipulativeLanguage: number;
    transparency: number;
  };
  dimensionBreakdowns: ScoreExplanationItem[];
  rawCompositeScore: number;
  confidenceCalculationRationale: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  inputType: InputType;
  inputContent: string;
  title?: string;
  domain?: string;
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  overallScore: number; // 0 to 100 composite index
  dimensionScores: DimensionScores;
  extractedClaims: ExtractedClaim[];
  factChecks: FactCheckItem[];
  relatedCoverage: RelatedCoverageArticle[];
  sourceProfile: SourceProfile;
  linguisticSignals: LinguisticSignals;
  aiSynthesis: AISynthesisReport;
  calculationDetails: CalculationDetails;
  isSample?: boolean;
}

export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  category: 'Health Hoax' | 'Credible Science' | 'Fabricated Quote' | 'Ambiguous Claim';
  inputType: InputType;
  content: string;
  expectedVerdict: VerdictType;
  expectedConfidence: ConfidenceLevel;
}
