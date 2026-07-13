import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  // Note: the rate limiter uses an in-memory Map, so tests share state.
  // We use unique identifiers per test to avoid interference.

  it('allows first request', () => {
    const result = rateLimit('test-first', { windowMs: 1000, max: 5 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('counts down remaining requests', () => {
    const id = 'test-countdown'
    rateLimit(id, { windowMs: 1000, max: 3 })
    const r2 = rateLimit(id, { windowMs: 1000, max: 3 })
    const r3 = rateLimit(id, { windowMs: 1000, max: 3 })
    expect(r2.success).toBe(true)
    expect(r2.remaining).toBe(1)
    expect(r3.success).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('blocks requests over the limit', () => {
    const id = 'test-block'
    for (let i = 0; i < 3; i++) {
      rateLimit(id, { windowMs: 1000, max: 3 })
    }
    const result = rateLimit(id, { windowMs: 1000, max: 3 })
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after the window expires', async () => {
    const id = 'test-reset'
    for (let i = 0; i < 2; i++) {
      rateLimit(id, { windowMs: 50, max: 2 })
    }
    // Should be blocked
    expect(rateLimit(id, { windowMs: 50, max: 2 }).success).toBe(false)
    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 60))
    // Should be allowed again
    const result = rateLimit(id, { windowMs: 50, max: 2 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('uses separate counters for different identifiers', () => {
    const limit = { windowMs: 1000, max: 2 }
    rateLimit('user-A', limit)
    rateLimit('user-A', limit)
    rateLimit('user-B', limit)
    expect(rateLimit('user-A', limit).success).toBe(false)
    expect(rateLimit('user-B', limit).success).toBe(true)
  })

  it('returns correct limit value', () => {
    const result = rateLimit('test-limit-value', { windowMs: 1000, max: 10 })
    expect(result.limit).toBe(10)
  })

  it('returns a future reset time', () => {
    const before = Date.now()
    const result = rateLimit('test-reset-time', { windowMs: 5000, max: 1 })
    const after = Date.now()
    expect(result.resetTime).toBeGreaterThanOrEqual(before + 5000)
    expect(result.resetTime).toBeLessThanOrEqual(after + 5000)
  })
})
