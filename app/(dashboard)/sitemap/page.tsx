import Link from 'next/link'
import {
  LayoutDashboard, Users, ClipboardList, Briefcase, Stethoscope,
  Box, Truck, Building2, FlaskConical, Megaphone, Filter,
  TrendingUp, BarChart2, Zap, Hash, Clock, Brain,
  GraduationCap, BookOpen, CreditCard, DollarSign, Receipt,
  Tag, PieChart, ShieldCheck, Settings, User, Key, Map,
  ExternalLink, CheckCircle2, Sparkles, AlertCircle,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type PageStatus = 'active' | 'new' | 'beta' | 'wip'

interface SitemapPage {
  href: string
  label: string
  description: string
  icon: typeof LayoutDashboard
  status?: PageStatus
}

interface SitemapSection {
  title: string
  description: string
  color: string
  accent: string
  icon: typeof LayoutDashboard
  pages: SitemapPage[]
}

// ─── All pages ────────────────────────────────────────────────────────────────

const SECTIONS: SitemapSection[] = [
  {
    title: 'Principal',
    description: 'Núcleo de la plataforma clínica',
    color: 'bg-sky-500/10 border-sky-500/20',
    accent: 'text-sky-400',
    icon: LayoutDashboard,
    pages: [
      { href: '/dashboard', label: 'Dashboard', description: 'Resumen general de KPIs y actividad', icon: LayoutDashboard },
      { href: '/dashboard/patients', label: 'Pacientes', description: 'Gestión completa de pacientes', icon: Users },
      { href: '/dashboard/patients/new', label: 'Nuevo paciente', description: 'Alta de nuevo paciente', icon: User },
      { href: '/dashboard/orders', label: 'Órdenes', description: 'Seguimiento de órdenes de laboratorio', icon: ClipboardList },
      { href: '/dashboard/orders/pickup', label: 'Solicitar recogida', description: 'Programa recogida de materiales en clínica', icon: Truck, status: 'new' },
      { href: '/dashboard/cases', label: 'Casos clínicos', description: 'Gestión de casos y tratamientos', icon: Briefcase },
      { href: '/dashboard/cases/new', label: 'Nuevo caso', description: 'Crear caso clínico nuevo', icon: Briefcase },
      { href: '/dashboard/doctors', label: 'Doctores', description: 'Directorio de doctores y especialistas', icon: Stethoscope },
      { href: '/dashboard/files/stl', label: 'Archivos 3D / STL', description: 'Upload y gestión de escaneos dentales 3D', icon: Box, status: 'new' },
    ],
  },
  {
    title: 'Clínica & Laboratorio',
    description: 'Gestión de entidades y laboratorios',
    color: 'bg-violet-500/10 border-violet-500/20',
    accent: 'text-violet-400',
    icon: Building2,
    pages: [
      { href: '/dashboard/clinics', label: 'Clínicas', description: 'Listado y gestión de clínicas', icon: Building2 },
      { href: '/dashboard/clinics/new', label: 'Nueva clínica', description: 'Registrar nueva clínica en la plataforma', icon: Building2 },
      { href: '/dashboard/labs', label: 'Laboratorios', description: 'Directorio de laboratorios dentales', icon: FlaskConical },
    ],
  },
  {
    title: 'Marketing & Crecimiento',
    description: 'CRM, leads, campañas y analytics',
    color: 'bg-emerald-500/10 border-emerald-500/20',
    accent: 'text-emerald-400',
    icon: Megaphone,
    pages: [
      { href: '/dashboard/marketing/leads', label: 'Leads & CRM', description: 'Gestión de leads con scoring automático', icon: Filter },
      { href: '/dashboard/marketing/campaigns', label: 'Campañas', description: 'Google Ads, Meta y campañas de email', icon: Megaphone },
      { href: '/dashboard/marketing/funnels', label: 'Funnels', description: 'Embudos de conversión y landing pages', icon: TrendingUp },
      { href: '/dashboard/marketing/analytics', label: 'Analytics', description: 'Métricas de marketing y rendimiento', icon: BarChart2 },
      { href: '/dashboard/ai', label: 'IA & Predicciones', description: 'Inteligencia artificial para clínicas', icon: Brain, status: 'beta' },
    ],
  },
  {
    title: 'Automatización N8N',
    description: 'Bots, reglas y recordatorios automáticos',
    color: 'bg-amber-500/10 border-amber-500/20',
    accent: 'text-amber-400',
    icon: Zap,
    pages: [
      { href: '/dashboard/automation', label: 'Panel de automatización', description: 'Vista general de automatizaciones activas', icon: Zap },
      { href: '/dashboard/automation/rules', label: 'Reglas N8N', description: 'Configuración de reglas y triggers automáticos', icon: Hash },
      { href: '/dashboard/automation/reminders', label: 'Recordatorios', description: 'Recordatorios automáticos por WhatsApp y email', icon: Clock },
    ],
  },
  {
    title: 'Orthonoba Academy',
    description: 'LMS de formación dental profesional',
    color: 'bg-pink-500/10 border-pink-500/20',
    accent: 'text-pink-400',
    icon: GraduationCap,
    pages: [
      { href: '/dashboard/courses', label: 'Catálogo de cursos', description: 'Todos los cursos disponibles por plan', icon: BookOpen },
      { href: '/dashboard/courses/new', label: 'Nuevo curso', description: 'Crear curso para instructores', icon: GraduationCap },
    ],
  },
  {
    title: 'Facturación & Finanzas',
    description: 'Stripe, facturas, planes y suscripciones',
    color: 'bg-teal-500/10 border-teal-500/20',
    accent: 'text-teal-400',
    icon: CreditCard,
    pages: [
      { href: '/dashboard/billing', label: 'Resumen financiero', description: 'MRR, ARR y métricas de ingresos', icon: DollarSign },
      { href: '/dashboard/billing/invoices', label: 'Facturas', description: 'Historial completo de facturas', icon: Receipt },
      { href: '/dashboard/billing/plans', label: 'Planes & Suscripción', description: 'Cambio de plan, Stripe Portal', icon: Tag },
    ],
  },
  {
    title: 'Plataforma & Admin',
    description: 'Configuración, usuarios y reportes ejecutivos',
    color: 'bg-slate-500/10 border-slate-600/30',
    accent: 'text-slate-300',
    icon: ShieldCheck,
    pages: [
      { href: '/dashboard/executive', label: 'Reporte Ejecutivo', description: 'Visión cross-tenant para super_admin', icon: PieChart },
      { href: '/dashboard/admin/users', label: 'Usuarios', description: 'Gestión de usuarios y accesos', icon: Users },
      { href: '/dashboard/admin/roles', label: 'Roles & Permisos', description: 'Control de acceso por rol', icon: ShieldCheck },
      { href: '/dashboard/settings', label: 'Configuración general', description: 'Ajustes de la plataforma', icon: Settings },
      { href: '/dashboard/settings/profile', label: 'Perfil', description: 'Datos personales y preferencias', icon: User },
      { href: '/dashboard/settings/security', label: 'Seguridad', description: 'Contraseña, 2FA y sesiones', icon: ShieldCheck },
      { href: '/dashboard/settings/api-keys', label: 'API Keys', description: 'Claves de integración con terceros', icon: Key },
    ],
  },
]

const STATUS_CONFIG: Record<PageStatus, { label: string; className: string; icon: React.ReactNode }> = {
  active: { label: 'Activo', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-2.5 h-2.5" /> },
  new: { label: 'Nuevo', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20', icon: <Sparkles className="w-2.5 h-2.5" /> },
  beta: { label: 'Beta', className: 'bg-violet-500/15 text-violet-400 border-violet-500/20', icon: <Sparkles className="w-2.5 h-2.5" /> },
  wip: { label: 'En desarrollo', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: <AlertCircle className="w-2.5 h-2.5" /> },
}

function StatusTag({ status }: { status?: PageStatus }) {
  if (!status) return null
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.className}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SitemapPage() {
  const totalPages = SECTIONS.reduce((acc, s) => acc + s.pages.length, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/60 border border-slate-600/50 flex items-center justify-center">
              <Map className="w-5 h-5 text-slate-300" />
            </div>
            Mapa del sitio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Todos los módulos y páginas de Orthonoba en un solo lugar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalPages}</p>
            <p className="text-xs text-slate-500">páginas disponibles</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-sky-400" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Módulos', value: SECTIONS.length },
          { label: 'Páginas activas', value: totalPages },
          { label: 'Nuevas esta versión', value: SECTIONS.flatMap((s) => s.pages).filter((p) => p.status === 'new').length },
          { label: 'En Beta', value: SECTIONS.flatMap((s) => s.pages).filter((p) => p.status === 'beta').length },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sections grid */}
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const SectionIcon = section.icon
          return (
            <div key={section.title} className={`rounded-2xl border p-5 ${section.color}`}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-slate-800/60 flex items-center justify-center shrink-0">
                  <SectionIcon className={`w-5 h-5 ${section.accent}`} />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${section.accent}`}>{section.title}</h2>
                  <p className="text-slate-400 text-xs">{section.description}</p>
                </div>
                <span className="ml-auto text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
                  {section.pages.length} páginas
                </span>
              </div>

              {/* Pages grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {section.pages.map((page) => {
                  const PageIcon = page.icon
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="group flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-transparent hover:border-slate-600/50 transition-all duration-150"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-slate-700 transition-colors">
                        <PageIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                            {page.label}
                          </span>
                          <StatusTag status={page.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{page.description}</p>
                        <p className="text-[10px] text-slate-600 mt-1 font-mono group-hover:text-slate-400 transition-colors">
                          {page.href}
                        </p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* API endpoints reference */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-bold mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400" /> API Endpoints
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs font-mono">
          {[
            'POST /api/v1/auth/login',
            'GET  /api/v1/auth/me',
            'POST /api/v1/files/stl',
            'GET  /api/v1/patients',
            'GET  /api/v1/orders',
            'GET  /api/v1/cases',
            'GET  /api/v1/dashboard/role',
            'GET  /api/v1/dashboard/clinic',
            'GET  /api/v1/dashboard/finance',
            'GET  /api/v1/marketing/leads',
            'POST /api/v1/automation/rules',
            'GET  /api/v1/courses',
            'GET  /api/v1/billing',
            'POST /api/v1/stripe/checkout',
            'POST /api/v1/ai/leads/qualify',
          ].map((ep) => (
            <span key={ep} className="text-slate-500 bg-slate-900/60 px-2 py-1 rounded-lg">
              {ep}
            </span>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-600 pb-4">
        Orthonoba SaaS Platform · v2.0 · {new Date().getFullYear()} · {totalPages} rutas activas
      </p>
    </div>
  )
}
