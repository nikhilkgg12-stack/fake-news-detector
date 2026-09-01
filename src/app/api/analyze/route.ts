import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/security/ratelimit';
import { fetchAndParseArticleUrl } from '@/lib/security/scraper';
import { checkGoogleSafeBrowsing } from '@/lib/api/safebrowsing';
import { extractClaims } from '@/lib/scoring/claims';
import { analyzeLinguistics } from '@/lib/scoring/linguistics';
import { searchFactChecks } from '@/lib/api/factcheck';
import { searchGDELTCoverage } from '@/lib/api/gdelt';
import { evaluateScoring } from '@/lib/scoring/engine';
import { generateEvidenceSynthesis } from '@/lib/api/groq';
import { saveAnalysisRecord } from '@/lib/db/analysis';
import { AnalysisResult, FactCheckItem, RelatedCoverageArticle, SourceProfile } from '@/types';
import { MOCK_ANALYSES, SAMPLE_PRESETS } from '@/lib/mock/samples';

const analyzeRequestSchema = z.object({
  inputType: z.enum(['text', 'url', 'claim']),
  content: z.string().min(5, 'Content must be at least 5 characters long').max(50000, 'Content must not exceed 50,000 characters'),
  presetId: z.string().optional(),
  customApiKey: z.string().optional(),
  customProvider: z.enum(['gemini', 'groq']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before initiating another analysis.' },
        { status: 429 }
      );
    }

    // 2. Validate Request Body
    const body = await req.json();
    const parseResult = analyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { inputType, content, presetId, customApiKey, customProvider } = parseResult.data;

    // Check if user is testing a known sample preset and we can serve realistic high-fidelity mock or live analysis
    if (presetId && MOCK_ANALYSES[presetId]) {
      const mockResult = {
        ...(MOCK_ANALYSES[presetId] as AnalysisResult),
        id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      await saveAnalysisRecord(mockResult);
      return NextResponse.json(mockResult);
    }

    let rawText = content.trim();
    let articleTitle: string | undefined;
    let targetDomain: string | undefined;
    let sourceProfile: SourceProfile = {
      domain: 'direct-submission',
      isHttps: true,
      safeBrowsingStatus: 'untested',
      hasAuthor: false,
      hasDate: false,
      citationCount: 0,
      outboundLinksCount: 0,
    };

    // 3. Process URL Input if provided
    if (inputType === 'url') {
      const scraped = await fetchAndParseArticleUrl(rawText);
      if (!scraped.success || !scraped.content) {
        return NextResponse.json(
          { error: scraped.error || 'Failed to fetch article from the provided URL.' },
          { status: 422 }
        );
      }

      rawText = scraped.content;
      articleTitle = scraped.title;
      targetDomain = scraped.domain;
      sourceProfile = scraped.sourceProfile;

      // Check Google Safe Browsing
      const sbResult = await checkGoogleSafeBrowsing(scraped.url);
      sourceProfile.safeBrowsingStatus = sbResult.status;
      sourceProfile.safeBrowsingDetails = sbResult.details;
    } else if (inputType === 'claim') {
      articleTitle = rawText.length > 100 ? rawText.slice(0, 97) + '...' : rawText;
      sourceProfile.domain = 'user-claim';
    }

    // 4. Extract Key Claims & Linguistic Analysis
    const extractedClaims = extractClaims(rawText, articleTitle);
    const linguisticSignals = analyzeLinguistics(rawText);

    // 5. Gather Fact-Checks and Global Coverage in Parallel
    const searchQueries = extractedClaims.map((c) => c.searchQuery);
    if (articleTitle) {
      searchQueries.unshift(articleTitle);
    }

    const [factChecks, relatedCoverage] = await Promise.all([
      searchFactChecks(searchQueries),
      searchGDELTCoverage(searchQueries[0] || rawText.slice(0, 100)),
    ]);

    // 6. Evaluate Transparent Scoring Engine
    const scoringResult = evaluateScoring({
      factChecks,
      relatedCoverage,
      sourceProfile,
      linguisticSignals,
      inputType,
      rawText,
    });

    // 7. Generate Gemini / Groq AI / Local Forensic Fallback Synthesis
    const aiSynthesis = await generateEvidenceSynthesis({
      verdict: scoringResult.verdict,
      confidence: scoringResult.confidence,
      overallScore: scoringResult.overallScore,
      dimensionScores: scoringResult.dimensionScores,
      extractedClaims,
      factChecks,
      relatedCoverage,
      sourceProfile,
      linguisticSignals,
      inputContentSnippet: rawText.slice(0, 800),
      customApiKey,
      customProvider,
    });

    // 8. Construct Final Analysis Result Object
    const analysisId = `vl-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const finalResult: AnalysisResult = {
      id: analysisId,
      createdAt: new Date().toISOString(),
      inputType,
      inputContent: content,
      title: articleTitle,
      domain: targetDomain,
      verdict: scoringResult.verdict,
      confidence: scoringResult.confidence,
      overallScore: scoringResult.overallScore,
      dimensionScores: scoringResult.dimensionScores,
      extractedClaims,
      factChecks,
      relatedCoverage,
      sourceProfile,
      linguisticSignals,
      aiSynthesis,
      calculationDetails: scoringResult.calculationDetails,
      isSample: false,
    };

    // 9. Save to Database
    await saveAnalysisRecord(finalResult);

    return NextResponse.json(finalResult);
  } catch (err: unknown) {
    console.error('Unhandled analysis pipeline error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error during analysis.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
