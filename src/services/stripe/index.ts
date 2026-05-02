import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Lazy Stripe client — only initialized at runtime when STRIPE_SECRET_KEY is available.
 * Throws at call-time (not module import time) if the key is missing.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.')

  _stripe = new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
    appInfo: {
      name: 'Orthonoba',
      version: '1.0.0',
      url: 'https://orthonoba.app',
    },
  })

  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string]
  },
})
