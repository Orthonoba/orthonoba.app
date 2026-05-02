import type { CourseCategory, CourseAccessLevel, CourseDifficulty } from '@/src/types/academy'
import type { PlanTier } from '@/src/types/clinic'

// ─── Category Definitions ─────────────────────────────────────────────────────

export interface CategoryConfig {
  slug: CourseCategory
  name: string
  nameEN: string
  description: string
  icon: string
  color: string
  featuredOrder: number
}

export const ACADEMY_CATEGORIES: Record<CourseCategory, CategoryConfig> = {
  'exocad': {
    slug: 'exocad',
    name: 'Exocad',
    nameEN: 'Exocad',
    description: 'Domina el software de diseño dental CAD/CAM más utilizado en laboratorios',
    icon: '🦷',
    color: '#2563EB',
    featuredOrder: 1,
  },
  'dental-marketing': {
    slug: 'dental-marketing',
    name: 'Marketing Dental',
    nameEN: 'Dental Marketing',
    description: 'Estrategias digitales para crecer tu clínica: SEO, Ads, redes sociales y más',
    icon: '📣',
    color: '#7C3AED',
    featuredOrder: 2,
  },
  'sleep-dentistry': {
    slug: 'sleep-dentistry',
    name: 'Odontología del Sueño',
    nameEN: 'Sleep Dentistry',
    description: 'Diagnóstico y tratamiento de ronquidos, apnea y bruxismo con dispositivos orales',
    icon: '😴',
    color: '#0891B2',
    featuredOrder: 3,
  },
  'web-design': {
    slug: 'web-design',
    name: 'Diseño Web para Clínicas',
    nameEN: 'Web Design',
    description: 'Crea y optimiza webs dentales que convierten visitas en pacientes',
    icon: '🖥️',
    color: '#059669',
    featuredOrder: 4,
  },
  'ai-automation': {
    slug: 'ai-automation',
    name: 'IA y Automatización',
    nameEN: 'AI & Automation',
    description: 'Aplica inteligencia artificial y automatización en tu práctica dental',
    icon: '🤖',
    color: '#D97706',
    featuredOrder: 5,
  },
  'clinical-skills': {
    slug: 'clinical-skills',
    name: 'Habilidades Clínicas',
    nameEN: 'Clinical Skills',
    description: 'Técnicas y procedimientos clínicos actualizados',
    icon: '🩺',
    color: '#DC2626',
    featuredOrder: 6,
  },
  'practice-management': {
    slug: 'practice-management',
    name: 'Gestión de Clínica',
    nameEN: 'Practice Management',
    description: 'Administración, finanzas y liderazgo para clínicas y laboratorios',
    icon: '📊',
    color: '#7C3AED',
    featuredOrder: 7,
  },
  'orthodontics': {
    slug: 'orthodontics',
    name: 'Ortodoncia',
    nameEN: 'Orthodontics',
    description: 'Ortodoncia invisible, brackets y planificación de casos',
    icon: '😁',
    color: '#0EA5E9',
    featuredOrder: 8,
  },
}

// ─── Access Level Rules ────────────────────────────────────────────────────────
// Plan → which access levels it unlocks

export const PLAN_ACADEMY_ACCESS: Record<PlanTier, CourseAccessLevel[]> = {
  starter:    ['free'],
  growth:     ['free', 'growth'],
  scale:      ['free', 'growth', 'scale'],
  enterprise: ['free', 'growth', 'scale', 'enterprise'],
}

export function canAccessCourse(planTier: PlanTier, accessLevel: CourseAccessLevel): boolean {
  if (accessLevel === 'purchase-only') return false  // requires individual purchase
  return PLAN_ACADEMY_ACCESS[planTier].includes(accessLevel)
}

export function getAccessLevelLabel(level: CourseAccessLevel): string {
  const labels: Record<CourseAccessLevel, string> = {
    'free':          'Gratis',
    'growth':        'Plan Growth+',
    'scale':         'Plan Scale+',
    'enterprise':    'Plan Enterprise',
    'purchase-only': 'Compra individual',
  }
  return labels[level]
}

// ─── Certificate Templates ─────────────────────────────────────────────────────

export const CERTIFICATE_TEMPLATES = {
  standard: {
    id: 'standard',
    name: 'Orthonoba Academy Certificate',
    organizationName: 'Orthonoba Academy',
    signatureTitle: 'Director Académico',
    logoUrl: '/logo-orthonoba.png',
    primaryColor: '#2563EB',
    accentColor: '#7C3AED',
  },
  excellence: {
    id: 'excellence',
    name: 'Certificate of Excellence',
    organizationName: 'Orthonoba Academy',
    signatureTitle: 'Director Académico',
    logoUrl: '/logo-orthonoba.png',
    primaryColor: '#D97706',
    accentColor: '#DC2626',
  },
}

export const DEFAULT_CERTIFICATE_TEMPLATE = 'standard'

// ─── Progress Thresholds ──────────────────────────────────────────────────────

export const COMPLETION_THRESHOLD = 90      // % of lessons to mark course complete
export const QUIZ_PASSING_SCORE    = 70     // default passing score %
export const MAX_QUIZ_ATTEMPTS     = 3

// ─── Difficulty Labels ────────────────────────────────────────────────────────

export const DIFFICULTY_LABELS: Record<CourseDifficulty, string> = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
  expert:       'Experto',
}

// ─── Course verification URL ──────────────────────────────────────────────────

export function getCertificateVerifyUrl(verificationId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orthonoba.app'
  return `${base}/academy/certificates/verify/${verificationId}`
}
