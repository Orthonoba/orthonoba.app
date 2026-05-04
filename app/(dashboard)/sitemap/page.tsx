import Link from 'next/link'
import { LayoutDashboard, Building2, Megaphone, Zap, GraduationCap, CreditCard, ShieldCheck } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Principal', color: 'sky', icon: LayoutDashboard,
    pages: [
      { href: '/dashboard',   label: 'Dashboard',      desc: 'Panel principal con KPIs' },
      { href: '/patients',    label: 'Pacientes',       desc: 'Gestión de pacientes' },
      { href: '/cases',       label: 'Casos clínicos',  desc: 'Órdenes de trabajo' },
      { href: '/orders',      label: 'Órdenes Lab',     desc: 'Órdenes de laboratorio' },
      { href: '/doctors',     label: 'Doctores',        desc: 'Gestión de doctores' },
      { href: '/files/stl',   label: 'Archivos 3D',     desc: 'STL y escaneados' },
    ],
  },
  {
    title: 'Clínica & Lab', color: 'violet', icon: Building2,
    pages: [
      { href: '/clinics', label: 'Clínicas',       desc: 'Gestión de clínicas' },
      { href: '/labs',    label: 'Laboratorios',   desc: 'Red de laboratorios' },
    ],
  },
  {
    title: 'Marketing & CRM', color: 'amber', icon: Megaphone,
    pages: [
      { href: '/marketing/leads',     label: 'Leads & CRM',    desc: 'Pipeline Kanban' },
      { href: '/marketing/campaigns', label: 'Campañas',        desc: 'Email, Google, Meta' },
      { href: '/marketing/funnels',   label: 'Funnels',         desc: 'Análisis de conversión' },
      { href: '/marketing/analytics', label: 'Analytics',       desc: 'Métricas y canales' },
    ],
  },
  {
    title: 'Automatización & IA', color: 'emerald', icon: Zap,
    pages: [
      { href: '/automation',           label: 'Automatización',    desc: 'Reglas y triggers' },
      { href: '/automation/rules',     label: 'Reglas',            desc: 'Editor IF/THEN' },
      { href: '/automation/reminders', label: 'Recordatorios',     desc: 'Scheduling' },
      { href: '/ai',                   label: 'IA & Predicciones', desc: 'Módulos Claude' },
    ],
  },
  {
    title: 'Academy', color: 'teal', icon: GraduationCap,
    pages: [
      { href: '/courses',     label: 'Catálogo',    desc: 'Todos los cursos' },
      { href: '/courses/new', label: 'Crear curso', desc: 'Editor de cursos' },
    ],
  },
  {
    title: 'Finanzas', color: 'rose', icon: CreditCard,
    pages: [
      { href: '/billing',          label: 'Facturación', desc: 'Panel de suscripción' },
      { href: '/billing/invoices', label: 'Facturas',    desc: 'Historial de facturas' },
      { href: '/billing/plans',    label: 'Planes',      desc: 'Comparador de planes' },
    ],
  },
  {
    title: 'Plataforma', color: 'slate', icon: ShieldCheck,
    pages: [
      { href: '/executive',    label: 'Reporte Ejecutivo', desc: 'KPIs de plataforma' },
      { href: '/admin/users',  label: 'Usuarios',          desc: 'Gestión de usuarios' },
      { href: '/admin/roles',  label: 'Roles & Permisos',  desc: 'Matriz de permisos' },
      { href: '/settings',     label: 'Configuración',     desc: 'Ajustes de cuenta' },
    ],
  },
]

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/20' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  teal:    { bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/20' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20' },
  slate:   { bg: 'bg-slate-500/10',   text: 'text-slate-300',   border: 'border-slate-500/20' },
}

export default function SitemapPage() {
  const total = SECTIONS.reduce((s, sec) => s + sec.pages.length, 0)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mapa del sitio</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} páginas · {SECTIONS.length} secciones</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SECTIONS.map((section) => {
          const c = COLORS[section.color]!
          return (
            <div key={section.title} className={`bg-slate-800 border ${c.border} rounded-xl p-5`}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
                  <section.icon className={`w-4 h-4 ${c.text}`} />
                </div>
                <h2 className={`font-semibold ${c.text}`}>{section.title}</h2>
                <span className="ml-auto text-xs text-slate-500">{section.pages.length}</span>
              </div>
              <div className="space-y-1">
                {section.pages.map((page) => (
                  <Link key={page.href} href={page.href}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition group">
                    <span className="text-slate-600 text-xs font-mono mt-0.5 shrink-0 group-hover:text-slate-400 transition">→</span>
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition">{page.label}</p>
                      <p className="text-xs text-slate-500">{page.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
