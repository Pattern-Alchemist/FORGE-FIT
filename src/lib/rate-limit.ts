/**
 * Forge — In-memory rate limiter
 *
 * Simple sliding-window rate limiter for API routes.
 * No external dependencies (Redis etc.) — uses a Map with TTL cleanup.
 *
 * Production: swap for Upstash Redis rate limiter for distributed limiting.
 *
 * Usage:
 *   import { rateLimit } from '@/lib/rate-limit'
 *   const result = rateLimit(identifier, { windowMs: 60000, max: 10 })
 *   if (!result.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key)
  }
}

export interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number
  /** Max requests per window */
  max: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions,
): RateLimitResult {
  cleanup()
  const now = Date.now()
  const key = identifier

  const entry = store.get(key)
  if (!entry || now > entry.resetTime) {
    // First request or window expired
    const resetTime = now + options.windowMs
    store.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit: options.max,
      remaining: options.max - 1,
      resetTime,
    }
  }

  // Increment
  entry.count++
  if (entry.count > options.max) {
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    success: true,
    limit: options.max,
    remaining: options.max - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get the client IP from a Next.js request.
 * Falls back to 'anonymous' if IP can't be determined.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP
  return 'anonymous'
}

/**
 * Set standard rate limit headers on a Next.js response.
 */
export function setRateLimitHeaders(
  res: Response,
  result: RateLimitResult,
): void {
  res.headers.set('X-RateLimit-Limit', String(result.limit))
  res.headers.set('X-RateLimit-Remaining', String(result.remaining))
  res.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)))
}
