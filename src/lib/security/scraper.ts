import * as cheerio from 'cheerio';
import { SourceProfile } from '@/types';
import { validateAndSanitizeUrl } from './ssrf';

export interface ScrapedArticleResult {
  success: boolean;
  url: string;
  domain: string;
  title?: string;
  content?: string;
  sourceProfile: SourceProfile;
  error?: string;
}

const MAX_RESPONSE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit
const FETCH_TIMEOUT_MS = 6000; // 6s timeout

export async function fetchAndParseArticleUrl(rawUrl: string): Promise<ScrapedArticleResult> {
  const validation = await validateAndSanitizeUrl(rawUrl);
  if (!validation.isValid || !validation.sanitizedUrl || !validation.domain) {
    return {
      success: false,
      url: rawUrl,
      domain: 'unknown',
      sourceProfile: {
        domain: 'unknown',
        isHttps: false,
        safeBrowsingStatus: 'untested',
        hasAuthor: false,
        hasDate: false,
        citationCount: 0,
        outboundLinksCount: 0,
      },
      error: validation.error || 'Invalid or forbidden URL',
    };
  }

  const url = validation.sanitizedUrl;
  const domain = validation.domain;
  const isHttps = url.startsWith('https://');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; VeriLens/1.0; +https://verilens.app/bot)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        url,
        domain,
        sourceProfile: {
          domain,
          isHttps,
          safeBrowsingStatus: 'untested',
          hasAuthor: false,
          hasDate: false,
          citationCount: 0,
          outboundLinksCount: 0,
        },
        error: `HTTP request failed with status ${response.status} (${response.statusText})`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return {
        success: false,
        url,
        domain,
        sourceProfile: {
          domain,
          isHttps,
          safeBrowsingStatus: 'untested',
          hasAuthor: false,
          hasDate: false,
          citationCount: 0,
          outboundLinksCount: 0,
        },
        error: `Content-Type "${contentType}" is not HTML. Only web articles and text pages are supported.`,
      };
    }

    // Read response with size ceiling
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE_BYTES) {
      return {
        success: false,
        url,
        domain,
        sourceProfile: {
          domain,
          isHttps,
          safeBrowsingStatus: 'untested',
          hasAuthor: false,
          hasDate: false,
          citationCount: 0,
          outboundLinksCount: 0,
        },
        error: `Page payload exceeds the maximum allowed limit of 2MB.`,
      };
    }

    const html = new TextDecoder('utf-8').decode(arrayBuffer);
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, noscript, nav, header, footer, svg, iframe, form, button, [role="banner"], [role="navigation"]').remove();

    // Extract Title
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').text();
    const h1 = $('h1').first().text();
    const title = (ogTitle || twitterTitle || h1 || pageTitle || '').trim();

    // Extract Author
    const metaAuthor = $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content');
    const byline = $('.byline, [rel="author"], .author-name, .c-byline').first().text().trim();
    const authorName = metaAuthor?.trim() || (byline.length > 0 && byline.length < 80 ? byline : undefined);
    const hasAuthor = Boolean(authorName);

    // Extract Publication Date
    const metaDate =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="pubdate"]').attr('content') ||
      $('meta[name="publish-date"]').attr('content') ||
      $('time').attr('datetime');
    const publishDate = metaDate ? new Date(metaDate).toISOString().split('T')[0] : undefined;
    const hasDate = Boolean(publishDate);

    // Count outbound links and citations
    const links = $('a[href]');
    let citationCount = 0;
    let outboundLinksCount = 0;

    links.each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('http://') || href.startsWith('https://')) {
        outboundLinksCount++;
        try {
          const linkUrl = new URL(href);
          if (linkUrl.hostname !== domain && !linkUrl.hostname.endsWith('.' + domain)) {
            citationCount++;
          }
        } catch {
          // ignore malformed href
        }
      }
    });

    // Extract Article Content
    // Look for standard article container or fall back to main/body
    let bodyText = '';
    const articleContainer = $('article, main, .article-body, .story-body, .entry-content, #article-body').first();
    if (articleContainer.length > 0) {
      bodyText = articleContainer
        .find('p')
        .map((_, p) => $(p).text().trim())
        .get()
        .filter((t) => t.length > 25)
        .join('\n\n');
    }

    if (!bodyText || bodyText.length < 100) {
      bodyText = $('p')
        .map((_, p) => $(p).text().trim())
        .get()
        .filter((t) => t.length > 25)
        .join('\n\n');
    }

    if (!bodyText) {
      bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    }

    const sourceProfile: SourceProfile = {
      domain,
      isHttps,
      safeBrowsingStatus: 'untested', // updated by Google Safe Browsing API if key is present
      hasAuthor,
      authorName,
      hasDate,
      publishDate,
      citationCount: Math.min(citationCount, 50),
      outboundLinksCount: Math.min(outboundLinksCount, 100),
    };

    return {
      success: true,
      url,
      domain,
      title: title.length > 0 ? title : undefined,
      content: bodyText.slice(0, 30000), // Keep up to 30k chars
      sourceProfile,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      url,
      domain,
      sourceProfile: {
        domain,
        isHttps,
        safeBrowsingStatus: 'untested',
        hasAuthor: false,
        hasDate: false,
        citationCount: 0,
        outboundLinksCount: 0,
      },
      error: `Failed to fetch or parse web article: ${message}`,
    };
  }
}
