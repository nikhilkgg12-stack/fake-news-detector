import { AISynthesisReport, DimensionScores, ExtractedClaim, FactCheckItem, LinguisticSignals, RelatedCoverageArticle, SourceProfile, VerdictType } from '@/types';

export interface GeminiEvidencePayload {
  verdict: VerdictType;
  confidence: string;
  overallScore: number;
  dimensionScores: DimensionScores;
  extractedClaims: ExtractedClaim[];
  factChecks: FactCheckItem[];
  relatedCoverage: RelatedCoverageArticle[];
  sourceProfile: SourceProfile;
  linguisticSignals: LinguisticSignals;
  inputContentSnippet: string;
  customApiKey?: string;
}

export async function generateGeminiSynthesis(
  payload: GeminiEvidencePayload
): Promise<AISynthesisReport | null> {
  const apiKey = payload.customApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length < 10) {
    return null;
  }

  const systemAndUserPrompt = `You are VeriLens AI, an objective, rigorous media forensics and news credibility evaluation engine.
Your task is to analyze the submitted news content or claim, evaluate whether it is Real (Credible), Fake (Debunked/Fabricated), or Misleading, and synthesize a structured evidence report.

STRICT INSTRUCTIONS:
1. Determine if the core claims are factually accurate, exaggerated, unverified, or outright false based on objective forensic principles and existing knowledge.
2. Rely on the structured evidence provided below as well as established real-world factual knowledge.
3. Return ONLY a valid JSON object matching the EXACT schema below without markdown code fences or extra text.

OUTPUT SCHEMA:
{
  "verdict": "likely_credible" | "potentially_misleading" | "likely_false",
  "summary": "2-3 sentence clear summary explaining if the news is real or fake and why.",
  "key_findings": ["Bullet 1 regarding factual accuracy or debunking", "Bullet 2 regarding source context and corroboration", "Bullet 3 regarding tone or sensationalism"],
  "limitations": ["Observation on automated analysis bounds", "Potential context factors"],
  "recommended_next_steps": ["Actionable advice 1 for readers", "Actionable advice 2 for primary source checking"]
}

STRUCTURED EVIDENCE & CONTENT TO ANALYZE:
- Submitted Content: "${payload.inputContentSnippet.slice(0, 1000)}"
- Pre-calculated Verdict: ${payload.verdict} (${payload.confidence} confidence)
- Calculated Score: ${payload.overallScore}/100
- Extracted Claims: ${JSON.stringify(payload.extractedClaims.map((c) => c.text))}
- Fact Checks Found: ${JSON.stringify(payload.factChecks.map((f) => ({ claim: f.claim, rating: f.ratingText, publisher: f.publisher })))}
- Media Coverage Matches: ${payload.relatedCoverage.length} articles found
- Linguistic Flags: ${payload.linguisticSignals.flaggedPhrases.length} flagged phrases (${payload.linguisticSignals.flaggedPhrases.map((p) => p.phrase).join(', ') || 'Clean tone'})`;

  // Models to attempt in order of preference
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemAndUserPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.warn(`Gemini API (${model}) returned status ${response.status}`);
        continue;
      }

      const data = await response.json();
      const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textOutput) {
        const cleanText = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);

        if (parsed.summary && Array.isArray(parsed.key_findings)) {
          return {
            summary: parsed.summary,
            key_findings: parsed.key_findings,
            limitations: parsed.limitations || [
              'Automated AI analysis evaluates public factual patterns but cannot inspect non-digitized original documentation.',
            ],
            recommended_next_steps: parsed.recommended_next_steps || [
              'Cross-check key statements against primary official records or press releases.',
            ],
            isAIGenerated: true,
            modelUsed: `Google Gemini (${model})`,
          };
        }
      }
    } catch (err) {
      console.warn(`Gemini API (${model}) call failed:`, err);
    }
  }

  return null;
}
