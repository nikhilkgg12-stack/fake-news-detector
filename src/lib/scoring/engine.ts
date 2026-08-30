import {
  CalculationDetails,
  ConfidenceLevel,
  DimensionScores,
  FactCheckItem,
  LinguisticSignals,
  RelatedCoverageArticle,
  ScoreExplanationItem,
  SourceProfile,
  VerdictType,
} from '@/types';
import { SCORING_CONFIG } from './config';
import { calculateManipulativeLanguageScore } from './linguistics';

export interface ScoringEngineInput {
  factChecks: FactCheckItem[];
  relatedCoverage: RelatedCoverageArticle[];
  sourceProfile: SourceProfile;
  linguisticSignals: LinguisticSignals;
  inputType: 'text' | 'url' | 'claim';
  rawText: string;
}

export interface ScoringEngineOutput {
  verdict: VerdictType;
  confidence: ConfidenceLevel;
  overallScore: number;
  dimensionScores: DimensionScores;
  calculationDetails: CalculationDetails;
}

export function evaluateScoring({
  factChecks,
  relatedCoverage,
  sourceProfile,
  linguisticSignals,
  inputType,
  rawText,
}: ScoringEngineInput): ScoringEngineOutput {
  const { weights, factCheckRatingScores, thresholds } = SCORING_CONFIG;

  // 1. Fact-Check Dimension Score (-100 to 100 -> normalized 0 to 100 for composite)
  let rawFactCheckScore = 0;
  let factCheckRationale = 'No verified fact-check records found in public databases for these specific claims.';

  if (factChecks.length > 0) {
    let totalScore = 0;
    for (const fc of factChecks) {
      const scoreForRating = factCheckRatingScores[fc.normalizedRating] ?? 0;
      totalScore += scoreForRating;
    }
    rawFactCheckScore = Math.round(totalScore / factChecks.length);

    if (rawFactCheckScore <= -50) {
      factCheckRationale = `Found ${factChecks.length} matching fact-check(s) rating this claim as false, altered, or debunked.`;
    } else if (rawFactCheckScore < 0) {
      factCheckRationale = `Found ${factChecks.length} matching fact-check(s) pointing out misleading context or unproven assertions.`;
    } else if (rawFactCheckScore >= 50) {
      factCheckRationale = `Found ${factChecks.length} matching fact-check(s) confirming the core claims as accurate.`;
    } else {
      factCheckRationale = `Fact-check results found mixed or unproven determinations.`;
    }
  }

  // Normalized 0-100 version for fact check (where -100 is 0, 0 is 50, 100 is 100)
  const normalizedFactCheckScore = Math.max(0, Math.min(100, Math.round((rawFactCheckScore + 100) / 2)));

  // 2. Corroboration Score (0 to 100) based on GDELT 2.0 coverage
  let corroborationScore = 30; // base when uncorroborated
  let corroborationRationale = 'Few or no independent mainstream news sources are currently reporting this exact event.';

  const articleCount = relatedCoverage.length;
  const uniqueDomains = new Set(relatedCoverage.map((a) => a.domain)).size;

  if (articleCount >= 6 && uniqueDomains >= 4) {
    corroborationScore = 95;
    corroborationRationale = `Strong cross-source reporting identified across ${uniqueDomains} distinct media outlets.`;
  } else if (articleCount >= 3 && uniqueDomains >= 2) {
    corroborationScore = 75;
    corroborationRationale = `Moderate cross-source reporting detected across ${uniqueDomains} independent outlets.`;
  } else if (articleCount >= 1) {
    corroborationScore = 50;
    corroborationRationale = `Limited related coverage found (${articleCount} article(s)).`;
  }

  // 3. Source Profile Score (0 to 100)
  let sourceReputationScore = 50;
  const sourceFactors: string[] = [];

  if (sourceProfile.isHttps) {
    sourceReputationScore += 15;
    sourceFactors.push('Valid HTTPS');
  }
  if (sourceProfile.safeBrowsingStatus === 'safe') {
    sourceReputationScore += 25;
    sourceFactors.push('Google Safe Browsing: Clean');
  } else if (sourceProfile.safeBrowsingStatus === 'unsafe') {
    sourceReputationScore -= 60;
    sourceFactors.push('Google Safe Browsing: Security threats detected');
  }

  if (sourceProfile.domain && sourceProfile.domain !== 'unknown') {
    sourceReputationScore += 10;
    sourceFactors.push(`Identified domain (${sourceProfile.domain})`);
  }

  sourceReputationScore = Math.max(0, Math.min(100, sourceReputationScore));
  const sourceRationale =
    sourceFactors.length > 0
      ? `Technical signals: ${sourceFactors.join(', ')}.`
      : 'Default technical profile (no dedicated domain or security flags).';

  // 4. Manipulative Language Score (0 to 100, higher = cleaner tone)
  const manipulativeLanguageScore = calculateManipulativeLanguageScore(linguisticSignals);
  let languageRationale = 'Text utilizes neutral, objective editorial phrasing with minimal sensationalism.';
  if (manipulativeLanguageScore < 40) {
    languageRationale = `High density of sensationalist hyperbole, emotional triggers, or artificial urgency detected (${linguisticSignals.flaggedPhrases.length} flagged phrases).`;
  } else if (manipulativeLanguageScore < 70) {
    languageRationale = `Moderate emotive or persuasive phrasing detected (${linguisticSignals.flaggedPhrases.length} flagged phrase(s)).`;
  }

  // 5. Transparency & Attribution Score (0 to 100)
  let transparencyScore = 40; // baseline
  const transparencyFactors: string[] = [];

  if (sourceProfile.hasAuthor) {
    transparencyScore += 25;
    transparencyFactors.push(`Byline present (${sourceProfile.authorName || 'Identified'})`);
  }
  if (sourceProfile.hasDate) {
    transparencyScore += 20;
    transparencyFactors.push('Publication date specified');
  }
  if (sourceProfile.citationCount >= 2) {
    transparencyScore += 15;
    transparencyFactors.push(`${sourceProfile.citationCount} outbound citations/links`);
  } else if (sourceProfile.citationCount === 1) {
    transparencyScore += 8;
    transparencyFactors.push('1 outbound citation');
  }

  transparencyScore = Math.max(0, Math.min(100, transparencyScore));
  const transparencyRationale =
    transparencyFactors.length > 0
      ? `Attribution signals: ${transparencyFactors.join(', ')}.`
      : 'Limited author byline, date, or citation attribution detected.';

  // Composite Weighted Calculation
  const factCheckContribution = normalizedFactCheckScore * weights.factCheck;
  const corroborationContribution = corroborationScore * weights.corroboration;
  const sourceContribution = sourceReputationScore * weights.sourceReputation;
  const languageContribution = manipulativeLanguageScore * weights.manipulativeLanguage;
  const transparencyContribution = transparencyScore * weights.transparency;

  const rawCompositeScore = Math.round(
    factCheckContribution +
      corroborationContribution +
      sourceContribution +
      languageContribution +
      transparencyContribution
  );

  const dimensionScores: DimensionScores = {
    factCheckScore: rawFactCheckScore,
    sourceReputationScore,
    corroborationScore,
    manipulativeLanguageScore,
    transparencyScore,
  };

  const dimensionBreakdowns: ScoreExplanationItem[] = [
    {
      dimension: 'Verified Fact-Checks',
      weight: weights.factCheck,
      score: normalizedFactCheckScore,
      weightedContribution: Math.round(factCheckContribution),
      rationale: factCheckRationale,
    },
    {
      dimension: 'Cross-Source Corroboration',
      weight: weights.corroboration,
      score: corroborationScore,
      weightedContribution: Math.round(corroborationContribution),
      rationale: corroborationRationale,
    },
    {
      dimension: 'Source Profile & Security',
      weight: weights.sourceReputation,
      score: sourceReputationScore,
      weightedContribution: Math.round(sourceContribution),
      rationale: sourceRationale,
    },
    {
      dimension: 'Language & Tone Restraint',
      weight: weights.manipulativeLanguage,
      score: manipulativeLanguageScore,
      weightedContribution: Math.round(languageContribution),
      rationale: languageRationale,
    },
    {
      dimension: 'Attribution & Transparency',
      weight: weights.transparency,
      score: transparencyScore,
      weightedContribution: Math.round(transparencyContribution),
      rationale: transparencyRationale,
    },
  ];

  // Determine Calibrated Verdict
  let verdict: VerdictType = 'insufficient_evidence';

  if (factChecks.length > 0) {
    if (rawFactCheckScore <= -40) {
      verdict = 'likely_false';
    } else if (rawFactCheckScore < 20) {
      verdict = 'potentially_misleading';
    } else if (rawFactCheckScore >= 50 && rawCompositeScore >= thresholds.likelyCredibleMin) {
      verdict = 'likely_credible';
    } else {
      verdict = 'potentially_misleading';
    }
  } else {
    // No direct fact check matches
    if (rawCompositeScore >= thresholds.likelyCredibleMin && corroborationScore >= 75 && manipulativeLanguageScore >= 60) {
      verdict = 'likely_credible';
    } else if (manipulativeLanguageScore <= 25 || (corroborationScore <= 30 && manipulativeLanguageScore <= 45)) {
      verdict = 'potentially_misleading';
    } else if (rawCompositeScore <= thresholds.likelyFalseMax) {
      verdict = 'potentially_misleading';
    } else {
      verdict = 'insufficient_evidence';
    }
  }

  // Determine Calibrated Confidence
  let confidence: ConfidenceLevel = 'low';
  let confidenceRationale = 'Limited external evidence available to corroborate or refute the claim.';

  if (factChecks.length >= 2 || (factChecks.length >= 1 && relatedCoverage.length >= 3)) {
    confidence = 'high';
    confidenceRationale = 'Direct matching fact-check records from recognized fact-checking organizations and corroborating news reports.';
  } else if (factChecks.length === 1 || relatedCoverage.length >= 4) {
    confidence = 'medium';
    confidenceRationale = 'Substantial corroborating coverage or a single matching fact-check entry.';
  } else if (relatedCoverage.length >= 1 || linguisticSignals.totalWords > 80) {
    confidence = 'low';
    confidenceRationale = 'Preliminary automated assessment based on linguistic signals and limited coverage without direct fact-check consensus.';
  }

  const calculationDetails: CalculationDetails = {
    formulaDescription: `Composite Score = (FactCheck × ${weights.factCheck}) + (Corroboration × ${weights.corroboration}) + (SourceSecurity × ${weights.sourceReputation}) + (LanguageTone × ${weights.manipulativeLanguage}) + (Transparency × ${weights.transparency})`,
    weights: {
      factCheck: weights.factCheck,
      corroboration: weights.corroboration,
      sourceReputation: weights.sourceReputation,
      manipulativeLanguage: weights.manipulativeLanguage,
      transparency: weights.transparency,
    },
    dimensionBreakdowns,
    rawCompositeScore,
    confidenceCalculationRationale: confidenceRationale,
  };

  return {
    verdict,
    confidence,
    overallScore: rawCompositeScore,
    dimensionScores,
    calculationDetails,
  };
}
