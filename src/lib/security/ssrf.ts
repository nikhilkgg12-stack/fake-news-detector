import dns from 'dns';
import { promisify } from 'util';
import net from 'net';

const dnsLookup = promisify(dns.lookup);

/**
 * Validates whether an IP address is internal/private or loopback (SSRF defense)
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return true;

    const [a, b, c, d] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;
    // 10.0.0.0/8 (Private)
    if (a === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-local / AWS metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (Private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;
    // 224.0.0.0/4 (Multicast)
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 (Reserved)
    if (a >= 240) return true;
    // 255.255.255.255 (Broadcast)
    if (a === 255 && b === 255 && c === 255 && d === 255) return true;

    return false;
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // Loopback
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // Unspecified
    if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
    // Unique local address (fc00::/7)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Link-local unicast (fe80::/10)
    if (normalized.startsWith('fe80:')) return true;
    // IPv4-mapped IPv6
    if (normalized.startsWith('::ffff:')) {
      const ipv4Part = normalized.substring(7);
      if (net.isIPv4(ipv4Part)) {
        return isPrivateOrReservedIP(ipv4Part);
      }
    }
    return false;
  }

  return true;
}

export interface URLValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
  domain?: string;
}

/**
 * Validates a user-provided URL against SSRF and protocol restrictions
 */
export async function validateAndSanitizeUrl(rawUrl: string): Promise<URLValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();

  // Check if a scheme is specified
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') {
      return {
        isValid: false,
        error: `Unsupported protocol "${scheme}:". Only HTTP and HTTPS are permitted.`,
      };
    }
  }

  let parsed: URL;
  try {
    const formatted = schemeMatch ? trimmed : 'https://' + trimmed;
    parsed = new URL(formatted);
  } catch {
    return { isValid: false, error: 'Malformed URL format.' };
  }

  // Reject non-http(s) protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard aliases
  if (hostname === 'localhost' || hostname === 'localhost.localdomain' || hostname.endsWith('.localhost')) {
    return { isValid: false, error: 'Access to localhost and internal loopback addresses is prohibited.' };
  }

  // Direct IP address check
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIP(hostname)) {
      return { isValid: false, error: 'Access to private, link-local, or internal network IP addresses is prohibited.' };
    }
  } else {
    // DNS resolution check to prevent DNS rebinding
    try {
      const lookupResult = await dnsLookup(hostname);
      if (isPrivateOrReservedIP(lookupResult.address)) {
        return {
          isValid: false,
          error: `Domain ${hostname} resolves to a private or internal IP address (${lookupResult.address}). Access prohibited.`,
        };
      }
    } catch {
      return { isValid: false, error: `Could not resolve DNS hostname: ${hostname}` };
    }
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
    domain: hostname.replace(/^www\./, ''),
  };
}
