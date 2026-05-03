import Link from 'next/link'

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🏥',
    title: 'CRM Dental',
    desc: 'Historial clínico, odontograma, tratamientos, citas y seguimiento de pacientes desde un solo panel.',
  },
  {
    icon: '🔬',
    title: 'Laboratorio Protésico',
    desc: 'Pipeline de casos, control de producción, calidad y entregas para labs CAD/CAM.',
  },
  {
    icon: '🧊',
    title: 'Archivos 3D · STL',
    desc: 'Sube y gestiona STL, OBJ, PLY, DICOM, ZIP. Hasta 1 GB. Vinculados al caso y paciente.',
  },
  {
    icon: '📈',
    title: 'Marketing Automatizado',
    desc: 'Google Ads, Meta, landing pages, scoring de leads con IA y funnels de conversión.',
  },
  {
    icon: '🤖',
    title: 'AI & Automatización',
    desc: 'Reglas inteligentes, calificación de leads con Claude AI, reminders y CRM insights.',
  },
  {
    icon: '🎓',
    title: 'Orthonoba Academy',
    desc: 'LMS con cursos de Exocad, Marketing Dental, Sleep Dentistry, AI Automation y más.',
  },
  {
    icon: '📊',
    title: 'BI Ejecutivo',
    desc: 'KPIs en tiempo real: MRR, ARR, CAC, LTV, churn, producción y rentabilidad por clínica.',
  },
  {
    icon: '⚡',
    title: 'White-label Ready',
    desc: 'Tokens de diseño por tenant. Integración CareNova Pro Extended preparada.',
  },
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '€49',
    cycle: '/mes',
    desc: 'Para clínicas en digitalización',
    featured: false,
    features: ['1 sede', '500 tokens IA/mes', 'CRM + órdenes', 'STL upload 500 MB', 'Cursos gratuitos'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '€149',
    cycle: '/mes',
    desc: 'Para clínicas en expansión',
    featured: true,
    features: ['3 sedes', '2 000 tokens IA', 'Marketing completo', 'Leads & Automation', 'Academy Growth'],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: '€399',
    cycle: '/mes',
    desc: 'Para grupos dentales',
    featured: false,
    features: ['10 sedes', '8 000 tokens IA', 'AI avanzado', 'API pública', 'Academy Scale + SLA'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cycle: '',
    desc: 'Solución completa',
    featured: false,
    features: ['Ilimitado', 'Tokens ∞', 'White-label', 'Contratos SLA', 'Soporte dedicado'],
  },
]

const STATS = [
  { value: '500+', label: 'Clínicas activas' },
  { value: '99.9%', label: 'Uptime' },
  { value: '€49', label: 'Desde /mes' },
  { value: '4.9★', label: 'Valoración' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">Orthonoba</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Plataforma</a>
            <a href="#plans"    className="hover:text-slate-900 transition-colors">Planes</a>
            <a href="#about"    className="hover:text-slate-900 transition-colors">Nosotros</a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors px-3 py-1.5"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Probar gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-700 font-medium mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          SaaS · Odontología Digital · IA Integrada
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
          La plataforma all-in-one<br />
          para clínicas dentales y laboratorios
        </h1>

        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          CRM, lab protésico, archivos 3D/STL, marketing con IA, academy y BI ejecutivo —
          integrados en un solo SaaS dental.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
          >
            Empezar gratis — 14 días
          </Link>
          <Link
            href="/login"
            className="border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-7 py-3 rounded-xl transition-colors"
          >
            Ver demo →
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">{s.value}</p>
                <p className="text-xs">{s.label}</p>
              </div>
              {i < STATS.length - 1 && <span className="w-px h-8 bg-slate-200" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Todo lo que necesita tu clínica
            </h2>
            <p className="text-slate-500 text-sm">
              Diseñado para clínicas dentales, grupos y laboratorios protésicos CAD/CAM
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-5 border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3 text-lg">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section id="plans" className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Planes adaptados a tu tamaño
            </h2>
            <p className="text-slate-500 text-sm">Sin contratos. Cancela cuando quieras.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={[
                  'rounded-2xl p-6 border flex flex-col',
                  p.featured
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200',
                ].join(' ')}
              >
                {p.featured && (
                  <div className="text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full w-fit mb-3">
                    Más popular
                  </div>
                )}
                <div className="mb-4">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${p.featured ? 'text-blue-200' : 'text-blue-600'}`}>
                    {p.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className={`text-3xl font-bold ${p.featured ? 'text-white' : 'text-slate-900'}`}>
                      {p.price}
                    </span>
                    {p.cycle && (
                      <span className={`text-sm mb-0.5 ${p.featured ? 'text-blue-200' : 'text-slate-400'}`}>
                        {p.cycle}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${p.featured ? 'text-blue-200' : 'text-slate-400'}`}>
                    {p.desc}
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className={`text-xs flex items-start gap-2 ${p.featured ? 'text-blue-100' : 'text-slate-600'}`}
                    >
                      <span className={`mt-0.5 shrink-0 ${p.featured ? 'text-white' : 'text-green-500'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={[
                    'text-center text-sm font-medium py-2.5 rounded-xl transition-colors',
                    p.featured
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800',
                  ].join(' ')}
                >
                  Empezar →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">O</span>
            </div>
            <span>Orthonoba © 2026 — Dental SaaS Platform</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Soporte</a>
            <span className="text-slate-300">CareNova Pro Extended · Listo</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
