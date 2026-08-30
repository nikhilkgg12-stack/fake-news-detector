// Scoring Configuration and Weights for VeriLens
// All scoring weights and thresholds are strictly defined and configurable here.

export const SCORING_CONFIG = {
  // Dimension weights (must sum to 1.0)
  weights: {
    // Fact-check match consensus is the single heaviest weight
    factCheck: 0.45,
    // Cross-source independent coverage (GDELT)
    corroboration: 0.20,
    // Source technical profile & safe browsing
    sourceReputation: 0.15,
    // Sensationalism, clickbait, and manipulative language (weak warning signal only)
    manipulativeLanguage: 0.10,
    // Transparency (byline, date, citations count)
    transparency: 0.10,
  },

  // Numerical impact scores for normalized fact-check ratings (-100 to +100)
  factCheckRatingScores: {
    false: -100,
    mostly_false: -75,
    misleading: -50,
    pants_on_fire: -100,
    unproven: -15,
    mixture: -10,
    mostly_true: 65,
    true: 95,
  },

  // Scoring thresholds for composite index (0 - 100)
  thresholds: {
    // Highly credible evidence threshold
    likelyCredibleMin: 72,
    // Misleading threshold
    potentiallyMisleadingMax: 45,
    // Likely false threshold
    likelyFalseMax: 28,
  },

  // Calibrated Confidence level thresholds based on available evidence volume & consistency
  confidence: {
    high: {
      minFactChecks: 1,
      minCorroboratingSources: 3,
      minWordCount: 50,
    },
    medium: {
      minFactChecks: 0,
      minCorroboratingSources: 1,
      minWordCount: 20,
    },
  },

  // Minimum and maximum word limits for analysis
  inputLimits: {
    minChars: 10,
    maxChars: 50000,
    minClaimChars: 5,
    maxClaimChars: 600,
  },
} as const;
