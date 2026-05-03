import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// ─── Content Security Policy ──────────────────────────────────────────────────
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.stripe.com https://graph.facebook.com wss:",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  ...(!isDev ? [{ key: 'Content-Security-Policy', value: CSP }] : []),
]

const nextConfig: NextConfig = {
  // Required for Docker multi-stage standalone build
  output: 'standalone',

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },

  reactStrictMode: true,

  // Stripe must not be bundled for edge runtime
  serverExternalPackages: ['stripe'],

  images: {
    domains: ['files.orthonoba.app'],
    formats: ['image/avif', 'image/webp'],
  },

  logging: {
    fetches: { fullUrl: isDev },
  },
}

export default nextConfig
