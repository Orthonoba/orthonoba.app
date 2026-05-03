'use client'
import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_LOCALE, isValidLocale, SUPPORTED_LOCALES } from '@/src/lib/i18n/locales'
import type { Locale } from '@/src/lib/i18n/locales'

export type { Locale }

const COOKIE_NAME = 'orthonoba-locale'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1]
    if (stored && isValidLocale(stored)) {
      setLocaleState(stored)
    } else {
      const browserLang = navigator.language.split('-')[0]
      if (browserLang && isValidLocale(browserLang)) setLocaleState(browserLang)
    }
  }, [])

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setLocaleState(next)
    window.location.reload()
  }, [])

  return { locale, setLocale, supported: SUPPORTED_LOCALES }
}
