export interface SafeBrowsingCheckResult {
  status: 'safe' | 'suspicious' | 'unsafe' | 'untested';
  details?: string;
}

export async function checkGoogleSafeBrowsing(targetUrl: string): Promise<SafeBrowsingCheckResult> {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      status: 'untested',
      details: 'Google Safe Browsing key not configured. Technical safety checks bypassed.',
    };
  }

  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

    const payload = {
      client: {
        clientId: 'verilens-app',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url: targetUrl }],
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return {
        status: 'untested',
        details: `Safe Browsing check failed (HTTP ${response.status}).`,
      };
    }

    const data = await response.json();
    if (data.matches && Array.isArray(data.matches) && data.matches.length > 0) {
      const threatTypes = data.matches.map((m: { threatType?: string }) => m.threatType).filter(Boolean);
      return {
        status: 'unsafe',
        details: `Potential security threat detected by Google Safe Browsing: ${threatTypes.join(', ')}. Note: This indicates malware or phishing risks, not news accuracy.`,
      };
    }

    return {
      status: 'safe',
      details: 'Clean: No malware, phishing, or harmful software threats detected by Google Safe Browsing.',
    };
  } catch (err) {
    console.warn('Safe Browsing API check failed:', err);
    return {
      status: 'untested',
      details: 'Safe Browsing check unavailable or timed out.',
    };
  }
}
