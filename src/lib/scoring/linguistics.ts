import { FlaggedPhrase, LinguisticSignals } from '@/types';

interface PatternRule {
  category: FlaggedPhrase['category'];
  regex: RegExp;
  reason: string;
  severity: FlaggedPhrase['severity'];
}

// Curated linguistic patterns for misinformation and manipulative framing analysis
const LINGUISTIC_PATTERNS: PatternRule[] = [
  // Sensationalism / Shock Value
  {
    category: 'sensationalism',
    regex: /\b(shocking|bombshell|unbelievable|mind-blowing|jaw-dropping|you won't believe|what they don't want you to know|explosive revelation|total fraud)\b/gi,
    reason: 'Sensationalist phrasing commonly used to provoke reflexive emotional reactions over analytical reasoning.',
    severity: 'medium',
  },
  // Artificial Urgency / Call to Panic
  {
    category: 'urgency',
    regex: /\b(share before it's deleted|share before they ban|wake up people|spread the word fast|act now before it's too late|urgent warning|warning to all citizens|delete this immediately)\b/gi,
    reason: 'Artificial urgency designed to trigger viral sharing before readers have time to verify facts.',
    severity: 'high',
  },
  // Emotional Manipulation & Fear Mongering
  {
    category: 'emotional_appeal',
    regex: /\b(terrifying truth|catastrophic conspiracy|evil agenda|corrupt elites|poisoning us|destroying our children|horrific reality|blood on their hands)\b/gi,
    reason: 'Emotionally charged, moralized framing intended to induce outrage or fear rather than report objective facts.',
    severity: 'medium',
  },
  // Hyperbolic / Clickbait Claims
  {
    category: 'hyperbole',
    regex: /\b(100% guaranteed|secret cure|miracle treatment|instant cure|destroys big pharma|doctors are baffled|magical remedy|cures all diseases)\b/gi,
    reason: 'Unsubstantiated hyperbole and miracle cure claims typical of health/medical misinformation.',
    severity: 'high',
  },
  // Ungrounded Absolute Assertions
  {
    category: 'absolute_assertion',
    regex: /\b(undeniably proven|undisputed fact|everyone knows|nobody can deny|without a shadow of a doubt|100% certain|guaranteed proof)\b/gi,
    reason: 'Absolute certainty language used to disguise speculative or unproven claims as established consensus.',
    severity: 'low',
  },
  // Clickbait Directives
  {
    category: 'clickbait',
    regex: /\b(the truth revealed|they are lying to you|this changes everything|watch until the end|what happened next will leave you speechless)\b/gi,
    reason: 'Clickbait curiosity-gap phrasing designed to maximize engagement rather than inform.',
    severity: 'low',
  },
];

export function analyzeLinguistics(text: string): LinguisticSignals {
  if (!text || typeof text !== 'string') {
    return {
      sensationalismScore: 0,
      emotionalScore: 0,
      certaintyScore: 0,
      flaggedPhrases: [],
      totalWords: 0,
      flaggedDensityPercentage: 0,
    };
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const flaggedPhrases: FlaggedPhrase[] = [];
  let phraseCounter = 0;

  for (const rule of LINGUISTIC_PATTERNS) {
    // Reset regex index
    rule.regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rule.regex.exec(text)) !== null) {
      const phrase = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + phrase.length;

      // Avoid duplicate overlapping captures
      const isOverlapping = flaggedPhrases.some(
        (existing) =>
          (startIndex >= existing.startIndex && startIndex < existing.endIndex) ||
          (endIndex > existing.startIndex && endIndex <= existing.endIndex)
      );

      if (!isOverlapping) {
        phraseCounter++;
        flaggedPhrases.push({
          id: `flag-${phraseCounter}`,
          phrase,
          category: rule.category,
          reason: rule.reason,
          startIndex,
          endIndex,
          severity: rule.severity,
        });
      }
    }
  }

  // Sort phrases by start index
  flaggedPhrases.sort((a, b) => a.startIndex - b.startIndex);

  // Check excessive uppercase density (e.g. ALL CAPS SHOUTING)
  const letters = text.replace(/[^a-zA-Z]/g, '');
  const upperLetters = text.replace(/[^A-Z]/g, '');
  const capsRatio = letters.length > 20 ? upperLetters.length / letters.length : 0;

  // Check multiple exclamation or question marks (e.g. "???", "!!!")
  const exclamationMatches = (text.match(/!{2,}|\?{2,}|!\?/g) || []).length;

  // Weight scores
  const highSeverityCount = flaggedPhrases.filter((p) => p.severity === 'high').length;
  const medSeverityCount = flaggedPhrases.filter((p) => p.severity === 'medium').length;
  const lowSeverityCount = flaggedPhrases.filter((p) => p.severity === 'low').length;

  const rawSensationalism =
    highSeverityCount * 25 +
    medSeverityCount * 15 +
    lowSeverityCount * 8 +
    (capsRatio > 0.35 ? 20 : 0) +
    exclamationMatches * 5;

  const rawEmotional =
    flaggedPhrases.filter((p) => p.category === 'emotional_appeal' || p.category === 'urgency').length * 20 +
    (capsRatio > 0.4 ? 15 : 0);

  const rawCertainty =
    flaggedPhrases.filter((p) => p.category === 'absolute_assertion' || p.category === 'hyperbole').length * 20;

  const sensationalismScore = Math.min(100, Math.round(rawSensationalism));
  const emotionalScore = Math.min(100, Math.round(rawEmotional));
  const certaintyScore = Math.min(100, Math.round(rawCertainty));

  const totalFlaggedWords = flaggedPhrases.reduce((acc, curr) => acc + curr.phrase.split(/\s+/).length, 0);
  const flaggedDensityPercentage =
    totalWords > 0 ? Math.min(100, Math.round((totalFlaggedWords / totalWords) * 100)) : 0;

  return {
    sensationalismScore,
    emotionalScore,
    certaintyScore,
    flaggedPhrases,
    totalWords,
    flaggedDensityPercentage,
  };
}

/**
 * Calculates manipulative language dimension score (0 - 100)
 * Higher score = Clean, objective, restrained tone.
 * Lower score = Heavy emotional manipulation, sensationalism, urgency.
 */
export function calculateManipulativeLanguageScore(signals: LinguisticSignals): number {
  if (signals.totalWords === 0) return 50;

  // Penalty based on sensationalism and density
  const penalty = signals.sensationalismScore * 0.6 + signals.emotionalScore * 0.4;
  const cleanScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  return cleanScore;
}
