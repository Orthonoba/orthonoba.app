import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createLandingPageSchema } from '@/src/modules/marketing/validators'
import { createLandingPage, listLandingPages } from '@/src/modules/marketing/campaign-store'
import { DENTAL_TREATMENTS } from '@/src/config/marketing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { DentalTreatmentSlug } from '@/src/types/marketing'

// GET /api/v1/marketing/landing-pages?template=implantes-landing
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)
  const treatmentHint = searchParams.get('treatment') as DentalTreatmentSlug | null

  const pages = await listLandingPages(tenant.clinicId)

  // Return scaffold when ?treatment= is passed and no pages exist for it
  const scaffold = treatmentHint && DENTAL_TREATMENTS[treatmentHint]
    ? buildLandingScaffold(treatmentHint, tenant.clinicName)
    : null

  return NextResponse.json(ok({ pages, scaffold }))
})

// POST /api/v1/marketing/landing-pages
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createLandingPageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const page = await createLandingPage({ ...parsed.data, clinicId: tenant.clinicId })
  return NextResponse.json(ok(page), { status: 201 })
})

// ─── Scaffold generator ────────────────────────────────────────────────────────

function buildLandingScaffold(slug: DentalTreatmentSlug, clinicName: string) {
  const t = DENTAL_TREATMENTS[slug]
  return {
    slug:        `${slug}-landing`,
    title:       `${t.name} en ${clinicName}`,
    template:    t.landingTemplate,
    headline:    t.adHeadlines[0].replace('{location}', clinicName),
    subheadline: `Especialistas en ${t.name}. Primera consulta gratuita.`,
    ctaText:     'Reservar Cita Gratis',
    sections: [
      { type: 'hero',        heading: t.adHeadlines[0], content: t.metaPrimaryText },
      { type: 'benefits',    heading: `¿Por qué elegirnos para tu ${t.name}?`, content: '' },
      { type: 'trust-badges', heading: 'Tu confianza, nuestra prioridad', content: '' },
      { type: 'testimonials', heading: 'Lo que dicen nuestros pacientes', content: '' },
      { type: 'faq',         heading: `Preguntas frecuentes sobre ${t.name}`, content: '' },
      { type: 'form',        heading: 'Reserva tu cita gratuita', content: '' },
    ],
    formConfig: {
      fields: [
        { name: 'name',  label: 'Tu nombre', type: 'text',  required: true,  placeholder: 'María García' },
        { name: 'phone', label: 'Teléfono',  type: 'phone', required: true,  placeholder: '+34 600 000 000' },
        { name: 'email', label: 'Email',     type: 'email', required: false, placeholder: 'maria@email.com' },
        { name: 'treatment', label: '¿Qué tratamiento te interesa?', type: 'select', required: false,
          options: Object.values(DENTAL_TREATMENTS).map((t) => t.name) },
      ],
      submitButtonText: 'Quiero mi cita gratuita',
      successMessage:   '¡Perfecto! Nos pondremos en contacto contigo en menos de 2 horas.',
      gdprText:         'Al enviar este formulario, aceptas nuestra política de privacidad.',
      requirePhone: true,
      requireEmail: false,
    },
    seoMeta: {
      metaTitle:       `${t.name} en ${clinicName} - Primera Consulta Gratis`,
      metaDescription: `${t.name} profesional en ${clinicName}. Precios transparentes, tecnología de última generación. ✓ Primera consulta gratuita.`,
      keywords:        [...t.primaryKeywords, ...t.longTailKeywords].slice(0, 10),
    },
  }
}
