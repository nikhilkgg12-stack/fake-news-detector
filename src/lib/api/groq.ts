import { AISynthesisReport, DimensionScores, ExtractedClaim, FactCheckItem, LinguisticSignals, RelatedCoverageArticle, SourceProfile, VerdictType } from '@/types';

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
}

export async function generateEvidenceSynthesis(
  payload: GroqEvidencePayload
): Promise<AISynthesisReport> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemPrompt = `You are VeriLens AI, an objective, rigorous evidence synthesis engine for media forensics.
Your task is to synthesize the provided structured evidence into a clear, explainable, and intellectually honest report.

STRICT PRINCIPLES & CONSTRAINTS:
1. NEVER declare any claim to be definitely true or false. Never speak with 100% certainty.
2. Rely ONLY on the provided structured evidence. DO NOT invent fact-checks, external sources, statistics, or quotes.
3. Clearly distinguish between "No evidence found" (absence of verification) and "Contradictory evidence" (actively debunked by fact-checkers).
4. Emphasize that automated assessments are starting points for human review, not final judicial rulings.
5. Return ONLY a valid JSON object matching the schema below without markdown code fences or conversational filler.

OUTPUT JSON SCHEMA:
{
  "summary": "2-3 sentence balanced overview of the evidence findings and uncertainty bounds.",
  "key_findings": ["Bullet 1 highlighting factual check consensus or lack thereof", "Bullet 2 regarding corroboration and source context", "Bullet 3 noting tone or linguistic signals"],
  "limitations": ["Clear explanation of what automated tools cannot verify", "Potential blind spots (e.g. newly breaking news, paywalled sources)"],
  "recommended_next_steps": ["Actionable step 1 for reader", "Actionable step 2 for primary source cross-checking"]
}`;

      const userPrompt = `Here is the structured forensic evidence for the submitted content:
- Raw snippet: "${payload.inputContentSnippet.slice(0, 500)}"
- Calculated Verdict: ${payload.verdict} (Confidence: ${payload.confidence})
- Overall Composite Index: ${payload.overallScore}/100
- Fact-Check Matches: ${JSON.stringify(payload.factChecks.map((f) => ({ claim: f.claim, rating: f.ratingText, normalized: f.normalizedRating, publisher: f.publisher })))}
- Extracted Core Claims: ${JSON.stringify(payload.extractedClaims.map((c) => c.text))}
- Related Independent Coverage (GDELT): ${payload.relatedCoverage.length} articles found (${payload.relatedCoverage.map((a) => a.source).join(', ') || 'None'})
- Source Profile: Domain=${payload.sourceProfile.domain}, HTTPS=${payload.sourceProfile.isHttps}, Byline=${payload.sourceProfile.hasAuthor}, Citations=${payload.sourceProfile.citationCount}
- Linguistic Flags: ${payload.linguisticSignals.flaggedPhrases.length} flagged phrases (${payload.linguisticSignals.flaggedPhrases.map((p) => `"${p.phrase}" (${p.category})`).join(', ') || 'Clean tone'})

Generate the structured JSON report.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
                'Automated analysis cannot inspect offline or non-indexed archives.',
                'Language and tone heuristics do not determine factual accuracy on their own.',
              ],
              recommended_next_steps: parsed.recommended_next_steps || [
                'Check primary scientific or governmental documentation.',
                'Review cited sources in the original publication.',
              ],
              isAIGenerated: true,
              modelUsed: 'Groq (Llama-3.1-8B-Instant)',
            };
          }
        }
      } else {
        console.warn(`Groq API returned status ${response.status}: ${await response.text()}`);
      }
    } catch (err) {
      console.warn('Groq API call failed or timed out, falling back to deterministic template:', err);
    }
  }

  // Deterministic Rule-Based Fallback Synthesis
  return generateDeterministicFallback(payload);
}

function generateDeterministicFallback(payload: GroqEvidencePayload): AISynthesisReport {
  const { verdict, factChecks, relatedCoverage, linguisticSignals, sourceProfile } = payload;

  let summary = '';
  const key_findings: string[] = [];
  const limitations: string[] = [
    'Automated analysis synthesizes available digital records but cannot replace investigative fact-checking.',
    'Breaking news stories may have genuine developments not yet indexed in fact-checking archives.',
  ];
  const recommended_next_steps: string[] = [];

  if (verdict === 'likely_false') {
    summary = `The submitted content aligns with known debunked claims. Multiple independent fact-checking records have examined these specific assertions and rated them as false, fabricated, or altered.`;
    key_findings.push(`Found ${factChecks.length} matching fact-check record(s) confirming that the core proposition is inaccurate or debunked.`);
    if (linguisticSignals.flaggedPhrases.length > 0) {
      key_findings.push(`Text contains sensationalist or high-urgency language patterns (${linguisticSignals.flaggedPhrases.length} flagged elements) designed to encourage viral distribution.`);
    }
    recommended_next_steps.push('Consult the linked fact-check reports from independent IFCN-signatory organizations.');
    recommended_next_steps.push('Refrain from resharing unverified copies of this claim on social platforms.');
  } else if (verdict === 'potentially_misleading') {
    summary = `The submitted material exhibits multiple warning signals such as sensationalized language, missing primary attribution, or partial fact-check warnings, suggesting it may contain out-of-context or exaggerated claims.`;
    if (factChecks.length > 0) {
      key_findings.push(`Fact-checking databases contain related reviews noting missing context or misleading framing.`);
    } else {
      key_findings.push(`No direct debunking found, but limited corroborating news coverage and elevated emotive phrasing were detected.`);
    }
    if (!sourceProfile.hasAuthor || !sourceProfile.hasDate) {
      key_findings.push(`Weak source transparency: missing identifiable author byline or explicit publication timestamp.`);
    }
    recommended_next_steps.push('Look for the original primary source rather than social media commentary or secondary aggregators.');
    recommended_next_steps.push('Check if key figures or institutions mentioned have issued official statements.');
  } else if (verdict === 'likely_credible') {
    summary = `The submitted content demonstrates strong credibility indicators, including multi-source corroboration, transparent attribution, and neutral editorial tone with no debunking records.`;
    key_findings.push(`Independent global reporting confirmed across ${relatedCoverage.length} distinct news sources.`);
    key_findings.push(`Objective linguistic structure with minimal emotional manipulation or sensationalist phrasing.`);
    if (sourceProfile.hasAuthor && sourceProfile.hasDate) {
      key_findings.push(`Clear editorial transparency with verified author attribution and timestamp.`);
    }
    recommended_next_steps.push('Review the cited primary studies or official documentation referenced in the article.');
  } else {
    // Insufficient evidence
    summary = `There is currently insufficient public evidence and fact-checking data to evaluate this submission reliably. The claims have neither been independently verified nor formally debunked.`;
    key_findings.push('No matching entries in recognized fact-checking databases for this specific claim wording.');
    key_findings.push(`Limited corroborating mainstream coverage identified in global news indexes (${relatedCoverage.length} related article(s)).`);
    recommended_next_steps.push('Perform targeted searches on primary scientific repositories, government registers, or official press offices.');
    recommended_next_steps.push('Wait for corroboration from established investigative reporting before treating the claim as verified.');
  }

  return {
    summary,
    key_findings,
    limitations,
    recommended_next_steps,
    isAIGenerated: false,
    modelUsed: 'VeriLens Deterministic Forensic Synthesizer',
  };
}
