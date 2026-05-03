import { DEFAULT_LOCALE, isValidLocale } from './locales'
import type { Locale } from './locales'
import type { Dictionary } from './dictionaries/es'

// ─── Lazy dictionary loader ───────────────────────────────────────────────────

const DICTIONARIES: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import('./dictionaries/es').then((m) => m.es),
  en: () => import('./dictionaries/en').then((m) => m.en),
  fr: () => import('./dictionaries/fr').then((m) => m.fr),
  de: () => import('./dictionaries/de').then((m) => m.de),
  it: () => import('./dictionaries/it').then((m) => m.it),
}

export async function getDictionary(locale: string): Promise<Dictionary> {
  const safe = isValidLocale(locale) ? locale : DEFAULT_LOCALE
  return DICTIONARIES[safe]()
}

// ─── Server component helper ──────────────────────────────────────────────────
// Usage in Server Components:
//   const t = await getTranslations(locale)
//   <p>{t.common.login}</p>

export async function getTranslations(locale: string): Promise<Dictionary> {
  return getDictionary(locale)
}

// ─── Locale from headers ──────────────────────────────────────────────────────
// Reads the x-locale header set by middleware

import { headers } from 'next/headers'

export async function getLocale(): Promise<Locale> {
  const hdrs = await headers()
  const locale = hdrs.get('x-locale') ?? DEFAULT_LOCALE
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE
}

// ─── Template interpolation ───────────────────────────────────────────────────
// t.dashboard.totalLeads → "Total: {n} leads"
// interpolate(t.dashboard.totalLeads, { n: 42 }) → "Total: 42 leads"

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}

export type { Dictionary, Locale }
