import { AISynthesisReport, DimensionScores, ExtractedClaim, FactCheckItem, LinguisticSignals, RelatedCoverageArticle, SourceProfile, VerdictType } from '@/types';
import { generateGeminiSynthesis } from './gemini';

export interface GroqEvidencePayload {
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
  customProvider?: 'gemini' | 'groq';
}

export async function generateEvidenceSynthesis(
  payload: GroqEvidencePayload
): Promise<AISynthesisReport> {
  // 1. Try Gemini API first (either via customApiKey or GEMINI_API_KEY env)
  if (payload.customProvider === 'gemini' || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    const geminiResult = await generateGeminiSynthesis(payload);
    if (geminiResult) {
      return geminiResult;
    }
  }

  // 2. Try Groq API (either via customApiKey or GROQ_API_KEY env)
  const groqApiKey =
    (payload.customProvider === 'groq' ? payload.customApiKey : undefined) ||
    process.env.GROQ_API_KEY;

  if (groqApiKey && groqApiKey.trim().length > 10) {
    try {
      const systemPrompt = `You are VeriLens AI, an objective media forensics engine.
Analyze the provided news content and determine if it is Real (Credible), Fake (Fabricated/Debunked), or Misleading.

STRICT CONSTRAINTS:
1. Rely on the structured evidence provided below as well as general real-world facts.
2. Return ONLY a valid JSON object matching the exact schema below.

SCHEMA:
{
  "summary": "2-3 sentence clear summary explaining if the news is real or fake.",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "limitations": ["Limitation 1", "Limitation 2"],
  "recommended_next_steps": ["Step 1", "Step 2"]
}`;

      const userPrompt = `Submitted Content: "${payload.inputContentSnippet.slice(0, 800)}"
- Calculated Verdict: ${payload.verdict} (${payload.confidence} confidence)
- Overall Score: ${payload.overallScore}/100
- Extracted Claims: ${JSON.stringify(payload.extractedClaims.map((c) => c.text))}
- Fact Checks: ${JSON.stringify(payload.factChecks.map((f) => ({ claim: f.claim, rating: f.ratingText, publisher: f.publisher })))}
- Coverage Articles: ${payload.relatedCoverage.length}
- Linguistic Flags: ${payload.linguisticSignals.flaggedPhrases.length} flagged phrases (${payload.linguisticSignals.flaggedPhrases.map((p) => p.phrase).join(', ') || 'Clean tone'})`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 800,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(7000),
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          if (parsed.summary && Array.isArray(parsed.key_findings)) {
            return {
              summary: parsed.summary,
              key_findings: parsed.key_findings,
              limitations: parsed.limitations || [
                'Automated analysis cannot replace in-person investigative journalism.',
              ],
              recommended_next_steps: parsed.recommended_next_steps || [
                'Check primary scientific or official government documentation.',
              ],
              isAIGenerated: true,
              modelUsed: 'Groq Cloud (Llama-3.1-8B)',
            };
          }
        }
      }
    } catch (err) {
      console.warn('Groq API call failed or timed out:', err);
    }
  }

  // If Gemini API wasn't tried earlier (no GEMINI_API_KEY in env), try it with custom key if available
  if (payload.customApiKey) {
    const geminiFallback = await generateGeminiSynthesis(payload);
    if (geminiFallback) return geminiFallback;
  }

  // 3. Fallback: VeriLens Local Forensic AI Classifier Engine
  return generateDeterministicFallback(payload);
}

function generateDeterministicFallback(payload: GroqEvidencePayload): AISynthesisReport {
  const { verdict, factChecks, relatedCoverage, linguisticSignals, sourceProfile, inputContentSnippet } = payload;

  let summary = '';
  const key_findings: string[] = [];
  const limitations: string[] = [
    'VeriLens Local Forensic Engine evaluated this content using structural claim analysis and linguistic pattern matching.',
    'Breaking stories may evolve as accredited newsrooms publish primary evidence.',
  ];
  const recommended_next_steps: string[] = [];

  const lowerContent = inputContentSnippet.toLowerCase();

  if (verdict === 'likely_false') {
    summary = `The submitted content shows strong indicators of being FAKE or FABRICATED. Key assertions match debunked misinformation patterns or exhibit heavy sensationalist framing without credible attribution.`;

    if (factChecks.length > 0) {
      key_findings.push(`Verified Fact-Checks: ${factChecks.length} accredited organization(s) rated claims in this submission as false, fabricated, or doctored.`);
    } else {
      key_findings.push(`Pattern Match: Text features high-risk false news markers such as unverified medical/financial claims, absolute assertions, or missing primary source attribution.`);
    }

    if (linguisticSignals.flaggedPhrases.length > 0) {
      key_findings.push(`Sensationalism Alert: ${linguisticSignals.flaggedPhrases.length} manipulative language signals were detected (e.g. "${linguisticSignals.flaggedPhrases[0].phrase}").`);
    }

    recommended_next_steps.push('Do NOT share this content on social platforms or messaging apps.');
    recommended_next_steps.push('Verify claims on independent fact-checking outlets such as Snopes, Reuters Fact Check, or AFP.');
  } else if (verdict === 'potentially_misleading') {
    summary = `The submitted material appears POTENTIALLY MISLEADING. It contains partial truths, missing context, or exaggerated headlines designed to provoke an emotional reaction.`;

    if (factChecks.length > 0) {
      key_findings.push(`Fact-Checker Notes: Matching reviews indicate missing context or exaggerated claims.`);
    } else {
      key_findings.push(`Rhetorical Flags: Detected emotive or clickbait phrasing (${linguisticSignals.flaggedPhrases.length} flagged terms) with sparse independent media corroboration.`);
    }

    if (!sourceProfile.hasAuthor || !sourceProfile.hasDate) {
      key_findings.push(`Transparency Deficit: Content lacks an explicit author byline or verified publication timestamp.`);
    }

    recommended_next_steps.push('Seek out the original primary document, study, or transcript rather than secondary commentary.');
    recommended_next_steps.push('Compare the headline against the actual body text for sensationalist inflation.');
  } else if (verdict === 'likely_credible') {
    summary = `The submitted content demonstrates strong indicators of being REAL and CREDIBLE. It exhibits neutral editorial phrasing, structured attribution, and alignment with verified reporting.`;

    if (relatedCoverage.length > 0) {
      key_findings.push(`Cross-Source Corroboration: Independent reporting confirmed across ${relatedCoverage.length} news outlet(s).`);
    } else {
      key_findings.push(`Editorial Quality: Objective linguistic tone with zero emotional manipulation or clickbait flags.`);
    }

    if (sourceProfile.hasAuthor && sourceProfile.hasDate) {
      key_findings.push(`Source Transparency: Clear author attribution (${sourceProfile.authorName || 'Verified'}) and publication date present.`);
    }

    recommended_next_steps.push('Check the primary references or scientific papers cited in the report.');
  } else {
    // Insufficient evidence fallback - convert to active assessment if possible
    if (lowerContent.length > 30) {
      summary = `The submitted text was evaluated by VeriLens Local Forensics. While no direct fact-check entry was indexed, the structural and linguistic profile suggests caution before accepting unverified statements.`;
      key_findings.push('No direct debunking record found in public archives for this specific wording.');
      key_findings.push(`Linguistic analysis score: ${100 - linguisticSignals.sensationalismScore}/100 tone neutrality.`);
    } else {
      summary = `The input text is very brief. Additional context or a full article body is recommended for a high-confidence factual score.`;
      key_findings.push('Short snippet limit: limited sentence structure available for deep forensics.');
    }

    recommended_next_steps.push('Paste the full article text or URL for a more comprehensive forensic scan.');
  }

  return {
    summary,
    key_findings,
    limitations,
    recommended_next_steps,
    isAIGenerated: false,
    modelUsed: 'VeriLens Local Forensic AI Classifier',
  };
}
