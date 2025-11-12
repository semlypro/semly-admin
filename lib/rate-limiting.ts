import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiting Implementation
 * OWASP: Insecure Design Prevention
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Rate limit by identifier
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(identifier, newRecord);
    return { success: true, remaining: limit - 1, resetTime: newRecord.resetTime };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}

/**
 * Rate limit middleware for API routes
 * Usage: Add at the beginning of API route handlers
 */
export function rateLimitMiddleware(
  req: NextRequest,
  limit: number = 100,
  windowMs: number = 60000
): NextResponse | null {
  // Skip rate limiting in development to allow unlimited testing
  if (process.env.NODE_ENV === 'development') {
    return null; // null = no rate limit response, request proceeds
  }

  const identifier =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const { success, remaining, resetTime } = rateLimit(identifier, limit, windowMs);

  if (!success) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    console.warn('🚨 Rate limit exceeded:', {
      identifier,
      limit,
      path: new URL(req.url).pathname,
    });

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(resetTime / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string, limit: number = 100): {
  remaining: number;
  resetTime: number;
} {
  const record = rateLimitStore.get(identifier);
  const now = Date.now();

  if (!record || now > record.resetTime) {
    return { remaining: limit, resetTime: now + 60000 };
  }

  return {
    remaining: Math.max(0, limit - record.count),
    resetTime: record.resetTime,
  };
}
