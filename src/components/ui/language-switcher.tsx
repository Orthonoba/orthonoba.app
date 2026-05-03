'use client'
import { useState } from 'react'
import { useLocale } from '@/src/hooks/useLocale'
import { LOCALE_FLAGS, LOCALE_LABELS } from '@/src/lib/i18n/locales'
import type { Locale } from '@/src/lib/i18n/locales'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, supported } = useLocale()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
        {!compact && (
          <span className="text-xs font-medium uppercase tracking-wide">{locale}</span>
        )}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-slate-400">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="listbox"
            className="absolute right-0 top-full mt-1 z-50 w-40 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden py-1"
          >
            {supported.map((loc) => (
              <button
                key={loc}
                role="option"
                aria-selected={locale === loc}
                onClick={() => {
                  setLocale(loc as Locale)
                  setOpen(false)
                }}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                  locale === loc
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                <span className="text-base">{LOCALE_FLAGS[loc as Locale]}</span>
                <span>{LOCALE_LABELS[loc as Locale]}</span>
                {locale === loc && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-auto text-blue-600">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
