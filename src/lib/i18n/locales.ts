export const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de', 'it'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
}

export function isValidLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

// Parse Accept-Language header → best matching locale
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE
  const tags = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: tag?.trim().split('-')[0]?.toLowerCase() ?? '', q: parseFloat(q ?? '1') }
    })
    .sort((a, b) => b.q - a.q)
  for (const { tag } of tags) {
    if (isValidLocale(tag)) return tag
  }
  return DEFAULT_LOCALE
}
