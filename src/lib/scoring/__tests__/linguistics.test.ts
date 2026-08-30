import { describe, it, expect } from 'vitest';
import { analyzeLinguistics, calculateManipulativeLanguageScore } from '../linguistics';

describe('Linguistic Analysis & Sensationalism Heuristics', () => {
  it('should flag high-urgency and sensationalist phrases with accurate offsets', () => {
    const text = "SHOCKING revelation! Share before it's deleted by the government.";
    const result = analyzeLinguistics(text);

    expect(result.flaggedPhrases.length).toBeGreaterThanOrEqual(2);

    const sensationalPhrase = result.flaggedPhrases.find((p) => p.category === 'sensationalism');
    expect(sensationalPhrase).toBeDefined();
    expect(sensationalPhrase?.phrase.toLowerCase()).toBe('shocking');
    expect(text.substring(sensationalPhrase!.startIndex, sensationalPhrase!.endIndex)).toBe('SHOCKING');

    const urgencyPhrase = result.flaggedPhrases.find((p) => p.category === 'urgency');
    expect(urgencyPhrase).toBeDefined();
    expect(urgencyPhrase?.phrase.toLowerCase()).toBe("share before it's deleted");

    const cleanScore = calculateManipulativeLanguageScore(result);
    expect(cleanScore).toBeLessThan(75);
    expect(cleanScore).toBeGreaterThan(0);
  });

  it('should give high cleanliness scores to neutral objective reporting', () => {
    const text = 'The European Space Agency published the peer-reviewed telemetry report on Tuesday morning following standard procedure.';
    const result = analyzeLinguistics(text);

    expect(result.flaggedPhrases.length).toBe(0);
    expect(result.sensationalismScore).toBe(0);
    const cleanScore = calculateManipulativeLanguageScore(result);
    expect(cleanScore).toBe(100);
  });

  it('should handle empty or whitespace text gracefully', () => {
    const result = analyzeLinguistics('');
    expect(result.totalWords).toBe(0);
    expect(result.flaggedPhrases).toEqual([]);
    expect(result.sensationalismScore).toBe(0);
  });
});
