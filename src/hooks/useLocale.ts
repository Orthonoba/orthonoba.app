'use client'
import { useClinicStore } from '@/src/store/clinic-store'

export type Locale = 'es' | 'en' | 'pt'

const defaultLocale: Locale = 'es'

export function useLocale(): Locale {
  const clinic = useClinicStore((s) => s.clinic)
  // Locale resolution: clinic preference → browser → default
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`orthonoba-locale-${clinic?.id ?? 'default'}`)
    if (stored === 'es' || stored === 'en' || stored === 'pt') return stored
  }
  return defaultLocale
}
