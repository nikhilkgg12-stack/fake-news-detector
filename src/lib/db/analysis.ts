import { prisma } from './prisma';
import { AnalysisResult, InputType, VerdictType } from '@/types';
import { MOCK_ANALYSES } from '../mock/samples';

// In-memory fallback cache if database is temporarily unreachable
const inMemoryCache = new Map<string, AnalysisResult>();

// Pre-populate in-memory cache with mock analysis
for (const [key, val] of Object.entries(MOCK_ANALYSES)) {
  if (val.id) {
    inMemoryCache.set(key, val as AnalysisResult);
  }
}

export async function saveAnalysisRecord(result: AnalysisResult): Promise<AnalysisResult> {
  // Always update in-memory cache
  inMemoryCache.set(result.id, result);

  try {
    const created = await prisma.analysis.upsert({
      where: { id: result.id },
      update: {
        inputType: result.inputType,
        inputContent: result.inputContent,
        title: result.title,
        domain: result.domain,
        verdict: result.verdict,
        confidence: result.confidence,
        overallScore: result.overallScore,
        dimensionScores: JSON.stringify(result.dimensionScores),
        extractedClaims: JSON.stringify(result.extractedClaims),
        factChecks: JSON.stringify(result.factChecks),
        relatedCoverage: JSON.stringify(result.relatedCoverage),
        sourceProfile: JSON.stringify(result.sourceProfile),
        linguisticSignals: JSON.stringify(result.linguisticSignals),
        aiSynthesis: JSON.stringify(result.aiSynthesis),
        isSample: result.isSample ?? false,
      },
      create: {
        id: result.id,
        createdAt: new Date(result.createdAt),
        inputType: result.inputType,
        inputContent: result.inputContent,
        title: result.title,
        domain: result.domain,
        verdict: result.verdict,
        confidence: result.confidence,
        overallScore: result.overallScore,
        dimensionScores: JSON.stringify(result.dimensionScores),
        extractedClaims: JSON.stringify(result.extractedClaims),
        factChecks: JSON.stringify(result.factChecks),
        relatedCoverage: JSON.stringify(result.relatedCoverage),
        sourceProfile: JSON.stringify(result.sourceProfile),
        linguisticSignals: JSON.stringify(result.linguisticSignals),
        aiSynthesis: JSON.stringify(result.aiSynthesis),
        isSample: result.isSample ?? false,
      },
    });

    return {
      ...result,
      id: created.id,
      createdAt: created.createdAt.toISOString(),
    };
  } catch (err) {
    console.warn('Database save skipped or failed, using in-memory cache:', err);
    return result;
  }
}

export async function getAnalysisById(id: string): Promise<AnalysisResult | null> {
  // Check in-memory cache first for mock samples or rapid lookups
  if (inMemoryCache.has(id)) {
    return inMemoryCache.get(id)!;
  }

  try {
    const record = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!record) return null;

    const dimensionScores = JSON.parse(record.dimensionScores);
    const extractedClaims = JSON.parse(record.extractedClaims);
    const factChecks = JSON.parse(record.factChecks);
    const relatedCoverage = JSON.parse(record.relatedCoverage);
    const sourceProfile = JSON.parse(record.sourceProfile);
    const linguisticSignals = JSON.parse(record.linguisticSignals);
    const aiSynthesis = JSON.parse(record.aiSynthesis);

    const result: AnalysisResult = {
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      inputType: record.inputType as InputType,
      inputContent: record.inputContent,
      title: record.title || undefined,
      domain: record.domain || undefined,
      verdict: record.verdict as VerdictType,
      confidence: record.confidence as 'low' | 'medium' | 'high',
      overallScore: record.overallScore,
      dimensionScores,
      extractedClaims,
      factChecks,
      relatedCoverage,
      sourceProfile,
      linguisticSignals,
      aiSynthesis,
      calculationDetails: {
        formulaDescription: 'Composite weighted evidence index',
        weights: { factCheck: 0.45, corroboration: 0.20, sourceReputation: 0.15, manipulativeLanguage: 0.10, transparency: 0.10 },
        dimensionBreakdowns: [],
        rawCompositeScore: record.overallScore,
        confidenceCalculationRationale: 'Calculated based on multi-source forensic indicators',
      },
      isSample: record.isSample,
    };

    inMemoryCache.set(id, result);
    return result;
  } catch (err) {
    console.warn(`Error fetching analysis ${id} from database:`, err);
    return inMemoryCache.get(id) || null;
  }
}

export interface ListAnalysesOptions {
  verdict?: string;
  inputType?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ListAnalysesResult {
  items: AnalysisResult[];
  total: number;
  stats: {
    totalCount: number;
    verdictCounts: Record<VerdictType, number>;
    timeline: Array<{ date: string; count: number }>;
  };
}

export async function listAnalyses(options: ListAnalysesOptions = {}): Promise<ListAnalysesResult> {
  const { verdict, inputType, searchQuery, limit = 50, offset = 0 } = options;

  try {
    const where: any = {};
    if (verdict && verdict !== 'all') {
      where.verdict = verdict;
    }
    if (inputType && inputType !== 'all') {
      where.inputType = inputType;
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      where.OR = [
        { inputContent: { contains: searchQuery } },
        { title: { contains: searchQuery } },
        { domain: { contains: searchQuery } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.analysis.count({ where }),
    ]);

    const allRecords = await prisma.analysis.findMany({
      select: { verdict: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const verdictCounts: Record<VerdictType, number> = {
      likely_credible: 0,
      potentially_misleading: 0,
      insufficient_evidence: 0,
      likely_false: 0,
    };

    const timelineMap = new Map<string, number>();

    for (const rec of allRecords) {
      const v = rec.verdict as VerdictType;
      if (verdictCounts[v] !== undefined) {
        verdictCounts[v]++;
      }
      const day = rec.createdAt.toISOString().split('T')[0];
      timelineMap.set(day, (timelineMap.get(day) || 0) + 1);
    }

    const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count }));

    const items: AnalysisResult[] = records.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      inputType: r.inputType as InputType,
      inputContent: r.inputContent,
      title: r.title || undefined,
      domain: r.domain || undefined,
      verdict: r.verdict as VerdictType,
      confidence: r.confidence as 'low' | 'medium' | 'high',
      overallScore: r.overallScore,
      dimensionScores: JSON.parse(r.dimensionScores),
      extractedClaims: JSON.parse(r.extractedClaims),
      factChecks: JSON.parse(r.factChecks),
      relatedCoverage: JSON.parse(r.relatedCoverage),
      sourceProfile: JSON.parse(r.sourceProfile),
      linguisticSignals: JSON.parse(r.linguisticSignals),
      aiSynthesis: JSON.parse(r.aiSynthesis),
      calculationDetails: {
        formulaDescription: 'Composite weighted evidence index',
        weights: { factCheck: 0.45, corroboration: 0.20, sourceReputation: 0.15, manipulativeLanguage: 0.10, transparency: 0.10 },
        dimensionBreakdowns: [],
        rawCompositeScore: r.overallScore,
        confidenceCalculationRationale: 'Evidence-based calculation',
      },
      isSample: r.isSample,
    }));

    return {
      items,
      total,
      stats: {
        totalCount: allRecords.length,
        verdictCounts,
        timeline,
      },
    };
  } catch (err) {
    console.warn('Database query failed, returning in-memory analyses:', err);

    let allItems = Array.from(inMemoryCache.values());
    if (verdict && verdict !== 'all') {
      allItems = allItems.filter((i) => i.verdict === verdict);
    }
    if (inputType && inputType !== 'all') {
      allItems = allItems.filter((i) => i.inputType === inputType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      allItems = allItems.filter(
        (i) =>
          i.inputContent.toLowerCase().includes(q) ||
          i.title?.toLowerCase().includes(q) ||
          i.domain?.toLowerCase().includes(q)
      );
    }

    const verdictCounts: Record<VerdictType, number> = {
      likely_credible: 0,
      potentially_misleading: 0,
      insufficient_evidence: 0,
      likely_false: 0,
    };

    const timelineMap = new Map<string, number>();

    for (const item of inMemoryCache.values()) {
      if (verdictCounts[item.verdict] !== undefined) {
        verdictCounts[item.verdict]++;
      }
      const day = item.createdAt.split('T')[0];
      timelineMap.set(day, (timelineMap.get(day) || 0) + 1);
    }

    return {
      items: allItems.slice(offset, offset + limit),
      total: allItems.length,
      stats: {
        totalCount: inMemoryCache.size,
        verdictCounts,
        timeline: Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count })),
      },
    };
  }
}

export async function deleteAnalysisRecord(id: string): Promise<boolean> {
  inMemoryCache.delete(id);
  try {
    await prisma.analysis.delete({ where: { id } });
    return true;
  } catch {
    return true;
  }
}

export async function clearAllAnalysisRecords(): Promise<boolean> {
  inMemoryCache.clear();
  try {
    await prisma.analysis.deleteMany({});
    return true;
  } catch {
    return true;
  }
}
