import type { DentalTreatmentSlug, LandingPageTemplate } from '@/src/types/marketing'

// ─── Dental Treatment Catalog ─────────────────────────────────────────────────

export interface TreatmentConfig {
  slug: DentalTreatmentSlug
  name: string
  nameEN: string
  avgTicketEUR: number
  avgClosingDays: number
  /** Default lead score points for interest in this treatment */
  scorePoints: number
  /** Primary keywords for SEO/SEM */
  primaryKeywords: string[]
  /** Long-tail keywords */
  longTailKeywords: string[]
  /** Default Google Ads headlines */
  adHeadlines: string[]
  /** Default Meta ad primary text */
  metaPrimaryText: string
  landingTemplate: LandingPageTemplate
}

export const DENTAL_TREATMENTS: Record<DentalTreatmentSlug, TreatmentConfig> = {
  'implantes-dentales': {
    slug: 'implantes-dentales',
    name: 'Implantes Dentales',
    nameEN: 'Dental Implants',
    avgTicketEUR: 2200,
    avgClosingDays: 14,
    scorePoints: 30,
    primaryKeywords: ['implantes dentales', 'implante dental precio', 'clinica implantes'],
    longTailKeywords: [
      'cuanto cuesta un implante dental',
      'implantes dentales sin dolor',
      'implante dental en un dia',
      'clinica implantes dentales madrid',
    ],
    adHeadlines: [
      'Implantes Dentales - {location}',
      'Implante Dental Desde {price}€',
      'Sin Dolor · Garantía Permanente',
      'Consulta Gratis · Pide Cita Ya',
      'Financia Tu Implante 0% Interés',
    ],
    metaPrimaryText: '¿Llevas tiempo pensando en recuperar tu sonrisa con implantes? En {clinic_name} te ofrecemos implantes de última generación con garantía permanente. Primera consulta gratis. 👇',
    landingTemplate: 'implantes-landing',
  },
  'ortodoncia-invisible': {
    slug: 'ortodoncia-invisible',
    name: 'Ortodoncia Invisible',
    nameEN: 'Invisible Orthodontics',
    avgTicketEUR: 3500,
    avgClosingDays: 21,
    scorePoints: 25,
    primaryKeywords: ['ortodoncia invisible', 'invisalign precio', 'alineadores invisibles'],
    longTailKeywords: [
      'ortodoncia invisible adultos precio',
      'cuanto cuesta invisalign',
      'ortodoncia transparente sin brackets',
      'alineadores dentales madrid precio',
    ],
    adHeadlines: [
      'Ortodoncia Invisible - Sin Brackets',
      'Alineadores Invisibles Desde {price}€',
      'Resultados en 6–18 Meses',
      'Primera Valoración Gratis',
      'Financia Tu Tratamiento',
    ],
    metaPrimaryText: '¡Consigue la sonrisa que siempre quisiste sin que nadie lo note! Ortodoncia invisible en {clinic_name}. Sin brackets, sin molestias. Primera cita gratuita. ✨',
    landingTemplate: 'ortodoncia-landing',
  },
  'blanqueamiento-dental': {
    slug: 'blanqueamiento-dental',
    name: 'Blanqueamiento Dental',
    nameEN: 'Teeth Whitening',
    avgTicketEUR: 350,
    avgClosingDays: 3,
    scorePoints: 10,
    primaryKeywords: ['blanqueamiento dental', 'blanqueamiento dientes precio', 'dientes blancos'],
    longTailKeywords: [
      'blanqueamiento dental profesional precio',
      'blanqueamiento dental clinica',
      'blanqueamiento laser precio',
    ],
    adHeadlines: [
      'Blanqueamiento Dental Profesional',
      'Dientes Blancos en 1 Sesión',
      'Desde {price}€ · Resultado Garantizado',
      'Pide Cita Online Ahora',
    ],
    metaPrimaryText: 'Luce una sonrisa radiante con el blanqueamiento profesional de {clinic_name}. Hasta 8 tonos más blanco en una sola sesión. 😁',
    landingTemplate: 'blanqueamiento-landing',
  },
  'protesis-dental': {
    slug: 'protesis-dental',
    name: 'Prótesis Dental',
    nameEN: 'Dental Prosthetics',
    avgTicketEUR: 1500,
    avgClosingDays: 30,
    scorePoints: 20,
    primaryKeywords: ['protesis dental', 'protesis dentales precio', 'dentadura postiza'],
    longTailKeywords: ['protesis dental completa precio', 'protesis fija sobre implantes'],
    adHeadlines: ['Prótesis Dental - {location}', 'Recupera Tu Sonrisa · Garantía', 'Presupuesto Sin Compromiso'],
    metaPrimaryText: 'Recupera tu sonrisa y confianza con nuestras prótesis dentales de alta calidad. Presupuesto personalizado sin compromiso en {clinic_name}.',
    landingTemplate: 'custom',
  },
  'empastes': {
    slug: 'empastes',
    name: 'Empastes',
    nameEN: 'Dental Fillings',
    avgTicketEUR: 120,
    avgClosingDays: 1,
    scorePoints: 5,
    primaryKeywords: ['empaste dental', 'empastes blancos precio', 'clinica empastes'],
    longTailKeywords: ['empaste dental precio', 'empaste composite blanco'],
    adHeadlines: ['Empastes Estéticos - Sin Amalgama', 'Cita Urgente Disponible', 'Precio Económico'],
    metaPrimaryText: 'Empastes estéticos de composite en {clinic_name}. Sin amalgama, natural y duradero. Cita disponible esta semana.',
    landingTemplate: 'custom',
  },
  'endodoncia': {
    slug: 'endodoncia',
    name: 'Endodoncia',
    nameEN: 'Root Canal',
    avgTicketEUR: 450,
    avgClosingDays: 2,
    scorePoints: 15,
    primaryKeywords: ['endodoncia', 'endodoncia precio', 'matar nervio diente'],
    longTailKeywords: ['endodoncia sin dolor precio', 'cuanto cuesta una endodoncia'],
    adHeadlines: ['Endodoncia Sin Dolor - {location}', 'Cita Urgente Disponible', 'Desde {price}€ · Sin Dolor'],
    metaPrimaryText: 'Endodoncia sin dolor en {clinic_name}. Salva tu diente con la tecnología más avanzada. Citas urgentes disponibles.',
    landingTemplate: 'urgencias-landing',
  },
  'periodoncia': {
    slug: 'periodoncia',
    name: 'Periodoncia',
    nameEN: 'Periodontics',
    avgTicketEUR: 600,
    avgClosingDays: 7,
    scorePoints: 15,
    primaryKeywords: ['periodoncia', 'encias', 'enfermedad periodontal'],
    longTailKeywords: ['tratamiento encias precio', 'periodontitis tratamiento'],
    adHeadlines: ['Tratamiento de Encías Especializado', 'Detecta la Periodontitis', 'Primera Visita Gratuita'],
    metaPrimaryText: 'Las encías sanas son la base de una buena salud dental. Diagnóstico y tratamiento periodontal en {clinic_name}.',
    landingTemplate: 'primera-visita-landing',
  },
  'cirugia-oral': {
    slug: 'cirugia-oral',
    name: 'Cirugía Oral',
    nameEN: 'Oral Surgery',
    avgTicketEUR: 700,
    avgClosingDays: 5,
    scorePoints: 20,
    primaryKeywords: ['cirugia oral', 'extraccion muela juicio', 'cirugia dental'],
    longTailKeywords: ['extraccion muela cordal precio', 'cirugia oral ambulatoria'],
    adHeadlines: ['Cirugía Oral - Sedación Disponible', 'Extracción Muela del Juicio', 'Sin Dolor · Máxima Seguridad'],
    metaPrimaryText: 'Cirugía oral mínimamente invasiva en {clinic_name}. Sedación consciente disponible. Tu comodidad es nuestra prioridad.',
    landingTemplate: 'custom',
  },
  'odontopediatria': {
    slug: 'odontopediatria',
    name: 'Odontopediatría',
    nameEN: 'Pediatric Dentistry',
    avgTicketEUR: 200,
    avgClosingDays: 3,
    scorePoints: 10,
    primaryKeywords: ['dentista niños', 'odontopediatria', 'dentista infantil'],
    longTailKeywords: ['primera visita dentista niño', 'dentista niños madrid precio'],
    adHeadlines: ['Dentista para Niños - {location}', 'Primera Visita Divertida', 'Especialistas en Niños'],
    metaPrimaryText: 'En {clinic_name} hacemos que la visita al dentista sea una experiencia positiva para tus hijos. Primera visita recomendada a los 2 años. 👶',
    landingTemplate: 'primera-visita-landing',
  },
  'estetica-dental': {
    slug: 'estetica-dental',
    name: 'Estética Dental',
    nameEN: 'Dental Aesthetics',
    avgTicketEUR: 2000,
    avgClosingDays: 14,
    scorePoints: 25,
    primaryKeywords: ['estetica dental', 'diseño de sonrisa', 'smile design'],
    longTailKeywords: ['diseño de sonrisa precio', 'cambio de sonrisa dental', 'transformacion dental'],
    adHeadlines: ['Diseño de Sonrisa - {location}', 'Transforma Tu Sonrisa', 'Consulta Digital Gratis'],
    metaPrimaryText: 'Diseña la sonrisa de tus sueños con el equipo de {clinic_name}. Simulación digital gratuita. Resultados naturales y duraderos. ✨',
    landingTemplate: 'custom',
  },
  'brackets': {
    slug: 'brackets',
    name: 'Brackets',
    nameEN: 'Braces',
    avgTicketEUR: 2800,
    avgClosingDays: 14,
    scorePoints: 20,
    primaryKeywords: ['brackets', 'ortodoncia brackets precio', 'ortodoncia fija'],
    longTailKeywords: ['brackets zafiro precio', 'cuanto cuestan los brackets', 'ortodoncia adultos brackets'],
    adHeadlines: ['Ortodoncia con Brackets - {location}', 'Brackets Estéticos · Sin Metales', 'Financiación Sin Intereses'],
    metaPrimaryText: 'Consigue una sonrisa perfecta con ortodoncia en {clinic_name}. Brackets metálicos, cerámicos y de zafiro. Financiación 0% disponible.',
    landingTemplate: 'ortodoncia-landing',
  },
  'carillas-porcelana': {
    slug: 'carillas-porcelana',
    name: 'Carillas de Porcelana',
    nameEN: 'Porcelain Veneers',
    avgTicketEUR: 4500,
    avgClosingDays: 21,
    scorePoints: 30,
    primaryKeywords: ['carillas porcelana', 'carillas dentales precio', 'veneers dentales'],
    longTailKeywords: ['carillas composite precio', 'diferencia carillas composite porcelana', 'carillas dentales madrid'],
    adHeadlines: ['Carillas de Porcelana - {location}', 'Smile Makeover · Resultado Inmediato', 'Consulta Diseño Gratis'],
    metaPrimaryText: 'Las carillas de porcelana son la forma más rápida de transformar tu sonrisa. En {clinic_name} diseñamos tu sonrisa perfecta en 2 citas. 💎',
    landingTemplate: 'custom',
  },
  'urgencias-dentales': {
    slug: 'urgencias-dentales',
    name: 'Urgencias Dentales',
    nameEN: 'Dental Emergencies',
    avgTicketEUR: 150,
    avgClosingDays: 0,
    scorePoints: 20,
    primaryKeywords: ['urgencias dentales', 'dentista urgencias', 'dolor de muelas urgente'],
    longTailKeywords: ['dentista urgencias hoy', 'cita urgente dentista mismo dia', 'dolor dental urgencias'],
    adHeadlines: ['Urgencias Dentales - Cita Hoy', 'Dolor de Muelas - Llamanos Ahora', 'Atención Urgente · Sin Espera'],
    metaPrimaryText: '¿Tienes dolor dental urgente? En {clinic_name} te atendemos HOY. Llama ahora y resolvemos tu problema el mismo día. 🚨',
    landingTemplate: 'urgencias-landing',
  },
}

// ─── Lead Scoring Rules ───────────────────────────────────────────────────────

export interface ScoringRule {
  factor: string
  points: number
  condition: string
}

export const LEAD_SCORING_RULES: ScoringRule[] = [
  // Source quality
  { factor: 'source_google_ads',      points: 15, condition: 'source === google-ads' },
  { factor: 'source_referral',        points: 25, condition: 'source in [referral-patient, referral-doctor]' },
  { factor: 'source_organic',         points: 10, condition: 'source === google-organic' },
  { factor: 'source_social',          points: 8,  condition: 'source in [facebook, instagram]' },
  { factor: 'source_doctoralia',      points: 12, condition: 'source === doctoralia' },
  // Profile completeness
  { factor: 'has_email',              points: 5,  condition: 'email is set' },
  { factor: 'has_phone',              points: 10, condition: 'phone is set' },
  { factor: 'has_email_and_phone',    points: 5,  condition: 'email and phone both set (bonus)' },
  // Treatment interest (high value)
  { factor: 'interest_high_value',    points: 20, condition: 'interestedIn includes implantes/estetica/carillas' },
  { factor: 'interest_ortho',         points: 15, condition: 'interestedIn includes ortodoncia' },
  // Activity
  { factor: 'form_submitted',         points: 10, condition: 'activity form_submitted exists' },
  { factor: 'email_opened',           points: 3,  condition: 'activity email_opened' },
  { factor: 'email_clicked',          points: 8,  condition: 'activity email_clicked' },
  { factor: 'phone_call',             points: 15, condition: 'activity phone_call' },
  { factor: 'appointment_booked',     points: 30, condition: 'activity appointment_booked' },
  // Recency
  { factor: 'recent_7d',              points: 10, condition: 'created or updated within 7 days' },
  { factor: 'stale_30d',              points: -15, condition: 'no activity in 30+ days' },
]

export const LEAD_SCORE_GRADES: { min: number; grade: 'A' | 'B' | 'C' | 'D' }[] = [
  { min: 70, grade: 'A' },
  { min: 45, grade: 'B' },
  { min: 20, grade: 'C' },
  { min: 0,  grade: 'D' },
]

// ─── Default Hashtag Sets ─────────────────────────────────────────────────────

export const DENTAL_HASHTAGS: Record<DentalTreatmentSlug, string[]> = {
  'implantes-dentales':   ['#implantesdentales', '#sonrisaperfecta', '#clinicadental', '#implante', '#saluddental'],
  'ortodoncia-invisible': ['#invisalign', '#ortodoncia', '#alineadores', '#sonrisa', '#dentistamadrid'],
  'blanqueamiento-dental':['#blanqueamientodental', '#dientessblancos', '#sonrisabrillante', '#esteticadental'],
  'protesis-dental':      ['#protesisdental', '#sonrisanueva', '#clinicadental'],
  'empastes':             ['#saluddental', '#clinicadental', '#empastes'],
  'endodoncia':           ['#endodoncia', '#saluddental', '#sinDolor'],
  'periodoncia':          ['#encias', '#periodoncia', '#saluddental'],
  'cirugia-oral':         ['#cirugiaDental', '#muelaJuicio', '#cirugia'],
  'odontopediatria':      ['#dentistaNinos', '#odontopediatria', '#niños', '#saluddental'],
  'estetica-dental':      ['#esteticaDental', '#designSonrisa', '#smileDesign', '#sonrisaperfecta'],
  'brackets':             ['#brackets', '#ortodoncia', '#ortofija', '#sonrisa'],
  'carillas-porcelana':   ['#carillasporcelana', '#veneers', '#smileMakeover', '#esteticaDental'],
  'urgencias-dentales':   ['#urgenciasdentales', '#dolorDental', '#dentistaMadrid'],
}

// ─── UTM Builder ─────────────────────────────────────────────────────────────

export function buildUTM(params: {
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
}): string {
  const q = new URLSearchParams({
    utm_source:   params.source,
    utm_medium:   params.medium,
    utm_campaign: params.campaign,
    ...(params.term    ? { utm_term:    params.term }    : {}),
    ...(params.content ? { utm_content: params.content } : {}),
  })
  return `?${q.toString()}`
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

export function buildDentistSchema(clinic: {
  name: string
  address: string
  phone: string
  url: string
  lat?: number
  lng?: number
  rating?: number
  reviewCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: clinic.name,
    address: { '@type': 'PostalAddress', streetAddress: clinic.address },
    telephone: clinic.phone,
    url: clinic.url,
    ...(clinic.lat && clinic.lng
      ? { geo: { '@type': 'GeoCoordinates', latitude: clinic.lat, longitude: clinic.lng } }
      : {}),
    ...(clinic.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: clinic.rating,
            reviewCount: clinic.reviewCount ?? 0,
          },
        }
      : {}),
    openingHoursSpecification: [],
    sameAs: [],
  }
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}
