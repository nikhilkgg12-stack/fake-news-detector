import { describe, it, expect } from 'vitest';
import { evaluateScoring } from '../engine';
import { SCORING_CONFIG } from '../config';
import { FactCheckItem, RelatedCoverageArticle, SourceProfile } from '@/types';
import { analyzeLinguistics } from '../linguistics';

describe('VeriLens Scoring Engine', () => {
  const defaultSourceProfile: SourceProfile = {
    domain: 'example.com',
    isHttps: true,
    safeBrowsingStatus: 'safe',
    hasAuthor: true,
    authorName: 'Jane Doe',
    hasDate: true,
    publishDate: '2026-08-30',
    citationCount: 3,
    outboundLinksCount: 5,
  };

  it('should assign likely_false when authoritative fact-checks rate claim as False', () => {
    const factChecks: FactCheckItem[] = [
      {
        id: 'fc-1',
        claim: 'Boiled garlic cures pneumonia in 24 hours',
        publisher: 'AFP Fact Check',
        ratingText: 'False',
        normalizedRating: 'false',
        url: 'https://factcheck.afp.com/123',
      },
      {
        id: 'fc-2',
        claim: 'Boiled garlic cures pneumonia',
        publisher: 'PolitiFact',
        ratingText: 'Pants on Fire',
        normalizedRating: 'false',
        url: 'https://politifact.com/456',
      },
    ];

    const relatedCoverage: RelatedCoverageArticle[] = [];
    const text = "SHOCKING! Share before it's deleted! Boiled garlic cures pneumonia in 24 hours!";
    const linguisticSignals = analyzeLinguistics(text);

    const result = evaluateScoring({
      factChecks,
      relatedCoverage,
      sourceProfile: { ...defaultSourceProfile, hasAuthor: false, hasDate: false },
      linguisticSignals,
      inputType: 'text',
      rawText: text,
    });

    expect(result.verdict).toBe('likely_false');
    expect(result.confidence).toBe('high');
    expect(result.overallScore).toBeLessThan(SCORING_CONFIG.thresholds.potentiallyMisleadingMax);
    expect(result.dimensionScores.factCheckScore).toBeLessThan(-50);
  });

  it('should assign likely_credible when multiple independent sources corroborate and no debunking exists', () => {
    const factChecks: FactCheckItem[] = [];
    const relatedCoverage: RelatedCoverageArticle[] = [
      { id: '1', title: 'JWST finds molecules on K2-18 b', source: 'BBC News', domain: 'bbc.com', url: 'https://bbc.com', date: '2026-08-29', language: 'en' },
      { id: '2', title: 'NASA Webb telescope detects carbon molecules', source: 'Reuters', domain: 'reuters.com', url: 'https://reuters.com', date: '2026-08-29', language: 'en' },
      { id: '3', title: 'Astronomers study atmosphere of K2-18 b', source: 'Nature', domain: 'nature.com', url: 'https://nature.com', date: '2026-08-28', language: 'en' },
      { id: '4', title: 'New findings from Cambridge team on exoplanet', source: 'ScienceDaily', domain: 'sciencedaily.com', url: 'https://sciencedaily.com', date: '2026-08-29', language: 'en' },
      { id: '5', title: 'Webb spectral observation of K2-18 b', source: 'The Guardian', domain: 'theguardian.com', url: 'https://theguardian.com', date: '2026-08-30', language: 'en' },
      { id: '6', title: 'Atmospheric signature on habitable zone planet', source: 'AP News', domain: 'apnews.com', url: 'https://apnews.com', date: '2026-08-30', language: 'en' },
    ];

    const text = 'NASA James Webb Space Telescope astronomers have detected methane and carbon dioxide in the atmosphere of exoplanet K2-18 b in the habitable zone.';
    const linguisticSignals = analyzeLinguistics(text);

    const result = evaluateScoring({
      factChecks,
      relatedCoverage,
      sourceProfile: defaultSourceProfile,
      linguisticSignals,
      inputType: 'text',
      rawText: text,
    });

    expect(result.verdict).toBe('likely_credible');
    expect(result.dimensionScores.corroborationScore).toBeGreaterThanOrEqual(75);
    expect(result.overallScore).toBeGreaterThanOrEqual(SCORING_CONFIG.thresholds.likelyCredibleMin);
  });

  it('should assign insufficient_evidence when there are no fact-checks and low corroboration', () => {
    const factChecks: FactCheckItem[] = [];
    const relatedCoverage: RelatedCoverageArticle[] = [];
    const text = 'Independent laboratory claims ambient pressure superconductor synthesized in Eastern Europe.';
    const linguisticSignals = analyzeLinguistics(text);

    const result = evaluateScoring({
      factChecks,
      relatedCoverage,
      sourceProfile: { ...defaultSourceProfile, hasAuthor: false, hasDate: false },
      linguisticSignals,
      inputType: 'claim',
      rawText: text,
    });

    expect(result.verdict).toBe('insufficient_evidence');
    expect(result.confidence).toBe('low');
  });

  it('should never assign a 100% certainty truth score', () => {
    const factChecks: FactCheckItem[] = [
      {
        id: '1',
        claim: 'Verified scientific event',
        publisher: 'Science Fact Check',
        ratingText: 'True',
        normalizedRating: 'true',
        url: 'https://example.com/true',
      },
    ];
    const relatedCoverage: RelatedCoverageArticle[] = [];
    const text = 'NASA officially launched the mission yesterday from Cape Canaveral.';
    const linguisticSignals = analyzeLinguistics(text);

    const result = evaluateScoring({
      factChecks,
      relatedCoverage,
      sourceProfile: defaultSourceProfile,
      linguisticSignals,
      inputType: 'text',
      rawText: text,
    });

    expect(result.calculationDetails.dimensionBreakdowns.length).toBe(5);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });
});
