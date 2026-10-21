import { headers } from 'next/headers';

interface RateLimitRecord {
  count: number;
  firstTimestamp: number;
}

// In-memory sliding window cache
const ipLimiter = new Map<string, RateLimitRecord>();
const phoneLimiter = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const WINDOW_MS = 10 * 60 * 1000;
    for (const [key, val] of ipLimiter.entries()) {
      if (now - val.firstTimestamp > WINDOW_MS) ipLimiter.delete(key);
    }
    for (const [key, val] of phoneLimiter.entries()) {
      if (now - val.firstTimestamp > WINDOW_MS) phoneLimiter.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Extracts real client IP safely through Cloudflare / Vercel proxy headers
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const cfIp = headersList.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    const xForwarded = headersList.get('x-forwarded-for');
    if (xForwarded) {
      const parts = xForwarded.split(',');
      if (parts[0]) return parts[0].trim();
    }

    const xReal = headersList.get('x-real-ip');
    if (xReal) return xReal.trim();
  } catch {
    // Edge/SSR fallback
  }
  return 'unknown';
}

export interface SecurityCheckOptions {
  phone?: string;
  honeypot?: string;
  renderedAt?: number;
  maxPerWindow?: number;
  windowMs?: number;
}

/**
 * Frictionless Human Protection Shield:
 * - 0% friction for real humans (generous limits, allows multiple normal orders, fail-open)
 * - 100% blocks automated bot spam, honeypot traps, and mass fake order scripts
 */
export async function verifyOrderSecurity(options: SecurityCheckOptions): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // 1. Silent Honeypot Trap
    // Bots and scrapers auto-fill all inputs. If filled, instantly block before touching DB!
    if (options.honeypot && options.honeypot.trim().length > 0) {
      console.warn('[Security] Bot detected via honeypot trap');
      return { allowed: false, reason: 'Automated submission detected.' };
    }

    const now = Date.now();

    // 2. Minimum human interaction threshold (entropy check)
    // Real humans take at least ~700ms to load checkout and submit. Headless bots submit in <200ms.
    if (options.renderedAt && options.renderedAt > 0) {
      const duration = now - options.renderedAt;
      if (duration > 0 && duration < 700) {
        console.warn(`[Security] Automated submission detected via speed threshold: ${duration}ms`);
        return { allowed: false, reason: 'Please wait a moment before confirming your order.' };
      }
    }

    const windowMs = options.windowMs || 5 * 60 * 1000; // 5 minutes
    const maxAllowed = options.maxPerWindow || 15; // Max 15 orders per 5 min (generous for real buyers & families)

    // 3. IP-based Burst Guard
    const clientIp = await getClientIp();
    if (clientIp && clientIp !== 'unknown') {
      const ipRecord = ipLimiter.get(clientIp);
      if (ipRecord) {
        if (now - ipRecord.firstTimestamp < windowMs) {
          if (ipRecord.count >= maxAllowed) {
            console.warn(`[Security] Rate limit exceeded for IP: ${clientIp} (${ipRecord.count} orders in window)`);
            return {
              allowed: false,
              reason: 'Too many orders placed recently. Please wait a few minutes or contact us directly on WhatsApp.',
            };
          }
          ipRecord.count++;
        } else {
          ipLimiter.set(clientIp, { count: 1, firstTimestamp: now });
        }
      } else {
        ipLimiter.set(clientIp, { count: 1, firstTimestamp: now });
      }
    }

    // 4. Phone-based Surge Guard (Protects against proxy IP rotation targeting one victim's phone)
    const phone = (options.phone || '').replace(/\D/g, '');
    if (phone && phone.length >= 10) {
      const phoneRecord = phoneLimiter.get(phone);
      if (phoneRecord) {
        if (now - phoneRecord.firstTimestamp < windowMs) {
          if (phoneRecord.count >= maxAllowed) {
            console.warn(`[Security] Surge limit for phone: ${phone}`);
            return {
              allowed: false,
              reason: 'Multiple orders placed for this number. Please confirm your order via WhatsApp.',
            };
          }
          phoneRecord.count++;
        } else {
          phoneLimiter.set(phone, { count: 1, firstTimestamp: now });
        }
      } else {
        phoneLimiter.set(phone, { count: 1, firstTimestamp: now });
      }
    }

    return { allowed: true };
  } catch (err) {
    // Fail open for real users: if any check throws an error, NEVER break customer checkout
    console.error('[Security] verifyOrderSecurity non-fatal error:', err);
    return { allowed: true };
  }
}
