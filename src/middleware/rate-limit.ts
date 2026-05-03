import { type NextRequest, NextResponse } from 'next/server'
import { fail, HTTP_STATUS } from '@/src/types/api'

// ─── In-memory rate limiter (dev/fallback) ────────────────────────────────────
// Replace with Upstash Redis in production: @upstash/ratelimit

interface RateLimitWindow {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitWindow>()

export interface RateLimitConfig {
  /** Max requests per window */
  max: number
  /** Window duration in seconds */
  windowSec: number
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  auth: { max: 10, windowSec: 60 },
  api: { max: 120, windowSec: 60 },
  upload: { max: 20, windowSec: 60 },
  webhook: { max: 100, windowSec: 60 },
}

/**
 * Returns the request key for rate limiting.
 * Uses IP + optional userId for authenticated routes.
 */
function getKey(req: NextRequest, prefix: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  return `${prefix}:${ip}`
}

/**
 * Check and increment the rate limit counter.
 * Returns { allowed: true } or { allowed: false, retryAfter: number }.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowSec * 1000 })
    return { allowed: true, remaining: config.max - 1 }
  }

  if (existing.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    }
  }

  existing.count++
  return { allowed: true, remaining: config.max - existing.count }
}

/**
 * Higher-order function that applies rate limiting to an API handler.
 */
export function withRateLimit(
  preset: keyof typeof DEFAULTS | RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse | Response>
) {
  const config = typeof preset === 'string' ? DEFAULTS[preset] : preset

  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const key = getKey(req, typeof preset === 'string' ? preset : 'custom')
    const result = checkRateLimit(key, config)

    if (!result.allowed) {
      return NextResponse.json(
        fail('RATE_LIMIT_EXCEEDED', `Too many requests. Retry after ${result.retryAfter}s.`),
        {
          status: HTTP_STATUS.RATE_LIMIT_EXCEEDED,
          headers: { 'Retry-After': String(result.retryAfter) },
        }
      )
    }

    const response = await handler(req)

    if (response instanceof NextResponse) {
      response.headers.set('X-RateLimit-Remaining', String(result.remaining))
      response.headers.set('X-RateLimit-Limit', String(config.max))
    }

    return response
  }
}
