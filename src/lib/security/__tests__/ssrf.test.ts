import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIP, validateAndSanitizeUrl } from '../ssrf';

describe('SSRF Protection & URL Validation', () => {
  it('should identify private IPv4 addresses correctly', () => {
    expect(isPrivateOrReservedIP('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('10.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('172.16.5.4')).toBe(true);
    expect(isPrivateOrReservedIP('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedIP('169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedIP('0.0.0.0')).toBe(true);
  });

  it('should allow public routable IPv4 addresses', () => {
    expect(isPrivateOrReservedIP('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIP('1.1.1.1')).toBe(false);
    expect(isPrivateOrReservedIP('142.250.190.46')).toBe(false);
  });

  it('should reject loopback and localhost URLs', async () => {
    const res1 = await validateAndSanitizeUrl('http://localhost:3000/api');
    expect(res1.isValid).toBe(false);

    const res2 = await validateAndSanitizeUrl('http://127.0.0.1/admin');
    expect(res2.isValid).toBe(false);
  });

  it('should reject non-http(s) schemes', async () => {
    const res = await validateAndSanitizeUrl('ftp://example.com/file.txt');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Unsupported protocol');
  });

  it('should validate valid public URLs', async () => {
    const res = await validateAndSanitizeUrl('https://en.wikipedia.org/wiki/News');
    expect(res.isValid).toBe(true);
    expect(res.domain).toBe('en.wikipedia.org');
  });
});
