import { ExtractedClaim } from '@/types';

/**
 * Extracts verifiable claims from submitted text or headline
 */
export function extractClaims(text: string, title?: string): ExtractedClaim[] {
  if (!text || typeof text !== 'string') return [];

  const rawClean = text.trim();
  const sentences = rawClean
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 350);

  const claims: ExtractedClaim[] = [];
  let claimIndex = 1;

  // If there's an explicit title/headline, treat it as a primary candidate claim
  if (title && title.trim().length > 15) {
    const category = categorizeClaim(title);
    claims.push({
      id: `claim-${claimIndex++}`,
      text: title.trim(),
      category,
      verifiable: true,
      searchQuery: cleanQueryForSearch(title),
    });
  }

  // Keywords that indicate declarative assertions
  const assertionPatterns = [
    /\b(claims?|discovered|announced|proved|cures|causes|passed|voted|stated|banned|warned|revealed|cancelled|signed|confirms?)\b/i,
    /\b(study finds|scientists|government|president|minister|fda|who|cdc|court|police)\b/i,
    /\b(cures|treatment|secret|conspiracy|crisis|treats|vaccine|dollar|money|law|tax)\b/i,
  ];

  for (const sentence of sentences) {
    // If we already have 5 claims, that's enough for thorough analysis
    if (claims.length >= 5) break;

    // Check if sentence matches declarative assertion pattern
    const isAssertion = assertionPatterns.some((pattern) => pattern.test(sentence));
    const isAlreadyExtracted = claims.some(
      (c) => c.text.toLowerCase().includes(sentence.toLowerCase()) || sentence.toLowerCase().includes(c.text.toLowerCase())
    );

    if (isAssertion && !isAlreadyExtracted) {
      const category = categorizeClaim(sentence);
      claims.push({
        id: `claim-${claimIndex++}`,
        text: sentence,
        category,
        verifiable: true,
        searchQuery: cleanQueryForSearch(sentence),
      });
    }
  }

  // If no claims extracted with patterns, fallback to the top sentences
  if (claims.length === 0 && sentences.length > 0) {
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i];
      claims.push({
        id: `claim-${claimIndex++}`,
        text: sentence,
        category: categorizeClaim(sentence),
        verifiable: true,
        searchQuery: cleanQueryForSearch(sentence),
      });
    }
  }

  // If text is very short (e.g. single claim input) and sentences was empty
  if (claims.length === 0 && rawClean.length >= 10) {
    claims.push({
      id: `claim-1`,
      text: rawClean,
      category: categorizeClaim(rawClean),
      verifiable: true,
      searchQuery: cleanQueryForSearch(rawClean),
    });
  }

  return claims;
}

function categorizeClaim(text: string): ExtractedClaim['category'] {
  const lower = text.toLowerCase();
  if (/\b(doctor|cure|disease|cancer|virus|health|medicine|vaccine|garlic|pneumonia|hospital|fda|cdc|who)\b/.test(lower)) {
    return 'health';
  }
  if (/\b(nasa|space|telescope|planet|quantum|physics|ai|superconductor|scientist|laboratory|biology|gene)\b/.test(lower)) {
    return 'scientific';
  }
  if (/\b(president|senate|congress|election|vote|minister|government|executive order|party|law|bill)\b/.test(lower)) {
    return 'political';
  }
  if (/\b(inflation|dollar|fed|economy|market|bank|stock|crypto|bitcoin|recession|interest rate)\b/.test(lower)) {
    return 'economic';
  }
  return 'general';
}

/**
 * Strips filler words and punctuation to make an optimal search query for APIs
 */
export function cleanQueryForSearch(text: string): string {
  const clean = text
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(' ');
  // If query is too long, take the most meaningful first 10-12 words
  if (words.length > 12) {
    return words.slice(0, 12).join(' ');
  }
  return clean;
}
