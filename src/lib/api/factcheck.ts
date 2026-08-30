import { FactCheckItem, NormalizedFactCheckRating } from '@/types';

export function normalizeFactCheckRating(text: string = ''): NormalizedFactCheckRating {
  const clean = text.toLowerCase().trim();

  if (
    clean.includes('pants on fire') ||
    clean === 'false' ||
    clean === 'fake' ||
    clean === 'hoax' ||
    clean === 'fabricated' ||
    clean.includes('incorrect') ||
    clean.includes('inaccurate') ||
    clean.includes('untrue') ||
    clean.includes('altered') ||
    clean.includes('doctored')
  ) {
    return 'false';
  }

  if (
    clean.includes('mostly false') ||
    clean.includes('barely true') ||
    clean.includes('largely false')
  ) {
    return 'mostly_false';
  }

  if (
    clean.includes('misleading') ||
    clean.includes('out of context') ||
    clean.includes('missing context') ||
    clean.includes('exaggerated') ||
    clean.includes('needs context')
  ) {
    return 'misleading';
  }

  if (
    clean.includes('unproven') ||
    clean.includes('unverified') ||
    clean.includes('unsubstantiated') ||
    clean.includes('no evidence') ||
    clean.includes('legend')
  ) {
    return 'unproven';
  }

  if (
    clean.includes('mixture') ||
    clean.includes('half true') ||
    clean.includes('partly true') ||
    clean.includes('partially false') ||
    clean.includes('somewhat true')
  ) {
    return 'mixture';
  }

  if (clean.includes('mostly true') || clean.includes('largely accurate')) {
    return 'mostly_true';
  }

  if (
    clean === 'true' ||
    clean === 'correct' ||
    clean === 'accurate' ||
    clean === 'verified' ||
    clean.includes('correct attribution')
  ) {
    return 'true';
  }

  return 'unproven';
}

interface RawGoogleClaimReview {
  publisher?: {
    name?: string;
    site?: string;
  };
  url?: string;
  title?: string;
  reviewDate?: string;
  textualRating?: string;
  languageCode?: string;
}

interface RawGoogleClaim {
  text?: string;
  claimant?: string;
  claimDate?: string;
  claimReview?: RawGoogleClaimReview[];
}

interface GoogleFactCheckResponse {
  claims?: RawGoogleClaim[];
  nextPageToken?: string;
}

export async function searchFactChecks(queries: string[]): Promise<FactCheckItem[]> {
  const apiKey = process.env.FACT_CHECK_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    // Graceful fallback when no API key is set
    return [];
  }

  const results: FactCheckItem[] = [];
  const seenUrls = new Set<string>();

  // Process unique search queries (up to 3 queries to conserve quota)
  const uniqueQueries = Array.from(new Set(queries.filter((q) => q.trim().length > 3))).slice(0, 3);

  for (const query of uniqueQueries) {
    try {
      const endpoint = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(
        query
      )}&key=${apiKey}&languageCode=en`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.warn(`Fact Check API error: ${response.status} for query "${query}"`);
        continue;
      }

      const data = (await response.json()) as GoogleFactCheckResponse;
      if (!data.claims || !Array.isArray(data.claims)) continue;

      for (const claim of data.claims) {
        if (!claim.claimReview || !Array.isArray(claim.claimReview)) continue;

        for (const review of claim.claimReview) {
          const url = review.url || '';
          if (!url || seenUrls.has(url)) continue;

          seenUrls.add(url);
          const rawRating = review.textualRating || 'Unverified';
          const normalized = normalizeFactCheckRating(rawRating);

          let publisherDomain = review.publisher?.site;
          if (!publisherDomain && url) {
            try {
              publisherDomain = new URL(url).hostname.replace(/^www\./, '');
            } catch {
              // ignore
            }
          }

          results.push({
            id: `fc-${results.length + 1}`,
            claim: claim.text || query,
            claimant: claim.claimant || undefined,
            claimDate: claim.claimDate ? new Date(claim.claimDate).toISOString().split('T')[0] : undefined,
            publisher: review.publisher?.name || publisherDomain || 'Fact-Checking Organization',
            publisherDomain,
            ratingText: rawRating,
            normalizedRating: normalized,
            reviewDate: review.reviewDate ? new Date(review.reviewDate).toISOString().split('T')[0] : undefined,
            url,
          });
        }
      }
    } catch (err) {
      console.warn(`Fact Check search failed for query "${query}":`, err);
    }
  }

  return results;
}
