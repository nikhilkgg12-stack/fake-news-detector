import { RelatedCoverageArticle } from '@/types';

interface GDELTArticle {
  url?: string;
  title?: string;
  seendate?: string;
  sourcecountry?: string;
  sourcename?: string;
  domain?: string;
  language?: string;
}

interface GDELTResponse {
  articles?: GDELTArticle[];
}

export async function searchGDELTCoverage(query: string): Promise<RelatedCoverageArticle[]> {
  if (!query || query.trim().length < 3) return [];

  // Limit query terms for GDELT syntax (first 6-8 keywords)
  const keywords = query
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['about', 'after', 'before', 'their', 'which', 'would', 'could'].includes(w.toLowerCase()))
    .slice(0, 6)
    .join(' ');

  if (!keywords) return [];

  try {
    const endpoint = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(
      keywords
    )}&mode=artlist&maxrecords=10&format=json&sort=DateDesc`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'VeriLens-Research/1.0',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      console.warn(`GDELT API returned status ${response.status}`);
      return [];
    }

    const data = (await response.json()) as GDELTResponse;
    if (!data.articles || !Array.isArray(data.articles)) {
      return [];
    }

    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    const articles: RelatedCoverageArticle[] = [];

    for (const item of data.articles) {
      const url = item.url || '';
      const title = item.title?.trim() || '';

      if (!url || !title || seenUrls.has(url) || seenTitles.has(title.toLowerCase())) {
        continue;
      }

      seenUrls.add(url);
      seenTitles.add(title.toLowerCase());

      let domain = item.domain || '';
      if (!domain && url) {
        try {
          domain = new URL(url).hostname.replace(/^www\./, '');
        } catch {
          domain = item.sourcename || 'news-outlet';
        }
      }

      // Format GDELT seendate (e.g. 20260830T103000Z)
      let formattedDate = 'Recent';
      if (item.seendate && item.seendate.length >= 8) {
        const y = item.seendate.substring(0, 4);
        const m = item.seendate.substring(4, 6);
        const d = item.seendate.substring(6, 8);
        formattedDate = `${y}-${m}-${d}`;
      }

      articles.push({
        id: `cov-${articles.length + 1}`,
        title,
        source: item.sourcename || domain || 'News Publisher',
        domain,
        url,
        date: formattedDate,
        language: item.language || 'English',
      });

      if (articles.length >= 8) break;
    }

    return articles;
  } catch (err) {
    console.warn(`GDELT search error for "${keywords}":`, err);
    return [];
  }
}
