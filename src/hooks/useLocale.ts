'use client'
import { useState, useCallback } from 'react'
import { DEFAULT_LOCALE, isValidLocale, SUPPORTED_LOCALES } from '@/src/lib/i18n/locales'
import type { Locale } from '@/src/lib/i18n/locales'

export type { Locale }

const COOKIE_NAME = 'orthonoba-locale'

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split('=')[1]
  if (stored && isValidLocale(stored)) return stored as Locale
  const browserLang = navigator.language.split('-')[0]
  if (browserLang && isValidLocale(browserLang)) return browserLang as Locale
  return DEFAULT_LOCALE
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale)

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setLocaleState(next)
    window.location.reload()
  }, [])

  return { locale, setLocale, supported: SUPPORTED_LOCALES }
}
