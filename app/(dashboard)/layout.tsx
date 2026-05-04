'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Briefcase, Stethoscope,
  ClipboardList, FlaskConical, GraduationCap, Zap, TrendingUp,
  Brain, CreditCard, ShieldCheck, Settings, Bell, Search,
  ChevronDown, ChevronRight, Menu, X, LogOut, Box, Upload,
  Truck, MapPin, FileText, BarChart2, Megaphone, Filter,
  BookOpen, Award, PlayCircle, UserCheck, Key, User,
  DollarSign, Receipt, PieChart, Cpu, Clock, Hash,
  ExternalLink, Map, Tag,
} from 'lucide-react'
import type { ReactNode } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NavChild {
  href: string
  label: string
  icon?: typeof LayoutDashboard
  badge?: string
}

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string
  children?: NavChild[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// ─── Navigation tree (ALL pages) ──────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        href: '/dashboard/patients',
        label: 'Pacientes',
        icon: Users,
        children: [
          { href: '/dashboard/patients', label: 'Todos los pacientes', icon: Users },
          { href: '/dashboard/patients/new', label: 'Nuevo paciente', icon: User },
        ],
      },
      {
        href: '/dashboard/orders',
        label: 'Órdenes',
        icon: ClipboardList,
        badge: '5',
        children: [
          { href: '/dashboard/orders', label: 'Todas las órdenes', icon: ClipboardList },
          { href: '/dashboard/orders/pickup', label: 'Solicitar recogida', icon: Truck, badge: 'Nuevo' },
        ],
      },
      {
        href: '/dashboard/cases',
        label: 'Casos Clínicos',
        icon: Briefcase,
        badge: '12',
        children: [
          { href: '/dashboard/cases', label: 'Todos los casos', icon: Briefcase },
          { href: '/dashboard/cases/new', label: 'Nuevo caso', icon: FileText },
        ],
      },
      {
        href: '/dashboard/doctors',
        label: 'Doctores',
        icon: Stethoscope,
      },
      {
        href: '/dashboard/files/stl',
        label: 'Archivos 3D / STL',
        icon: Box,
        badge: 'STL',
      },
    ],
  },
  {
    label: 'Clínica & Laboratorio',
    items: [
      {
        href: '/dashboard/clinics',
        label: 'Clínicas',
        icon: Building2,
        children: [
          { href: '/dashboard/clinics', label: 'Todas las clínicas', icon: Building2 },
          { href: '/dashboard/clinics/new', label: 'Nueva clínica', icon: Building2 },
        ],
      },
      {
        href: '/dashboard/labs',
        label: 'Laboratorios',
        icon: FlaskConical,
      },
    ],
  },
  {
    label: 'Crecimiento',
    items: [
      {
        href: '/dashboard/marketing',
        label: 'Marketing',
        icon: Megaphone,
        children: [
          { href: '/dashboard/marketing/leads', label: 'Leads & CRM', icon: Filter },
          { href: '/dashboard/marketing/campaigns', label: 'Campañas', icon: Megaphone },
          { href: '/dashboard/marketing/funnels', label: 'Funnels', icon: TrendingUp },
          { href: '/dashboard/marketing/analytics', label: 'Analytics', icon: BarChart2 },
        ],
      },
      {
        href: '/dashboard/automation',
        label: 'Automatización',
        icon: Zap,
        badge: '3',
        children: [
          { href: '/dashboard/automation', label: 'Panel general', icon: Zap },
          { href: '/dashboard/automation/rules', label: 'Reglas N8N', icon: Hash },
          { href: '/dashboard/automation/reminders', label: 'Recordatorios', icon: Clock },
        ],
      },
      {
        href: '/dashboard/ai',
        label: 'IA & Predicciones',
        icon: Brain,
        badge: 'Beta',
      },
    ],
  },
  {
    label: 'Academy',
    items: [
      {
        href: '/dashboard/courses',
        label: 'Cursos',
        icon: GraduationCap,
        children: [
          { href: '/dashboard/courses', label: 'Catálogo', icon: BookOpen },
          { href: '/dashboard/courses/new', label: 'Nuevo curso', icon: PlayCircle },
        ],
      },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      {
        href: '/dashboard/billing',
        label: 'Facturación',
        icon: CreditCard,
        children: [
          { href: '/dashboard/billing', label: 'Resumen', icon: DollarSign },
          { href: '/dashboard/billing/invoices', label: 'Facturas', icon: Receipt },
          { href: '/dashboard/billing/plans', label: 'Planes & Suscripción', icon: Tag },
        ],
      },
    ],
  },
  {
    label: 'Plataforma',
    items: [
      {
        href: '/dashboard/executive',
        label: 'Reporte Ejecutivo',
        icon: PieChart,
      },
      {
        href: '/dashboard/admin',
        label: 'Administración',
        icon: ShieldCheck,
        children: [
          { href: '/dashboard/admin/users', label: 'Usuarios', icon: Users },
          { href: '/dashboard/admin/roles', label: 'Roles & Permisos', icon: UserCheck },
        ],
      },
      {
        href: '/dashboard/settings',
        label: 'Configuración',
        icon: Settings,
        children: [
          { href: '/dashboard/settings', label: 'General', icon: Settings },
          { href: '/dashboard/settings/profile', label: 'Perfil', icon: User },
          { href: '/dashboard/settings/security', label: 'Seguridad', icon: ShieldCheck },
          { href: '/dashboard/settings/api-keys', label: 'API Keys', icon: Key },
        ],
      },
      {
        href: '/dashboard/sitemap',
        label: 'Mapa del sitio',
        icon: Map,
        badge: '↗',
      },
    ],
  },
]

// ─── Sidebar component ─────────────────────────────────────────────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    NAV_GROUPS.forEach((g) =>
      g.items.forEach((item) => {
        if (item.children && pathname.startsWith(item.href)) init[item.href] = true
      })
    )
    return init
  })

  function toggleExpand(href: string) {
    setExpanded((p) => ({ ...p, [href]: !p[href] }))
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname === href || pathname.startsWith(href + '/')

  const isParentActive = (item: NavItem) =>
    isActive(item.href) || (item.children?.some((c) => isActive(c.href)) ?? false)

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700/60 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5">
            <path d="M12 2C8 2 5 5 5 9c0 2 .5 3.5 1 5l2 6c.3.9 1.1 1.5 2 1.5h4c.9 0 1.7-.6 2-1.5l2-6c.5-1.5 1-3 1-5 0-4-3-7-7-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-white font-bold text-base tracking-tight">Orthonoba</span>
          <p className="text-sky-400 text-[10px] font-medium">SaaS Dental Platform</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-1.5 mb-1">
              {group.label}
            </p>

            {group.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const isOpen = expanded[item.href]
              const active = isParentActive(item)

              return (
                <div key={item.href}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className={[
                        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
                        active
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80',
                      ].join(' ')}
                    >
                      <item.icon className={['w-4 h-4 shrink-0 transition-colors', active ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'].join(' ')} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={[
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                          item.badge === 'Beta' ? 'bg-violet-500/20 text-violet-400'
                          : item.badge === 'STL' ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-sky-500/20 text-sky-400',
                        ].join(' ')}>
                          {item.badge}
                        </span>
                      )}
                      {isOpen
                        ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={[
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group',
                        active
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80',
                      ].join(' ')}
                    >
                      <item.icon className={['w-4 h-4 shrink-0 transition-colors', active ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'].join(' ')} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={[
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                          item.badge === 'Beta' ? 'bg-violet-500/20 text-violet-400'
                          : item.badge === 'STL' ? 'bg-emerald-500/20 text-emerald-400'
                          : item.badge === '↗' ? 'bg-slate-600/50 text-slate-400'
                          : 'bg-sky-500/20 text-sky-400',
                        ].join(' ')}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Sub-items */}
                  {hasChildren && isOpen && (
                    <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-slate-700/60 space-y-0.5">
                      {item.children!.map((child) => {
                        const childActive = isActive(child.href)
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={[
                              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group',
                              childActive
                                ? 'bg-sky-500/10 text-sky-300'
                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60',
                            ].join(' ')}
                          >
                            {ChildIcon && <ChildIcon className={['w-3.5 h-3.5 shrink-0', childActive ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'].join(' ')} />}
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className="ml-auto text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-700/60 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer group transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
            JG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">Jose Greorio</p>
            <p className="text-xs text-slate-500 truncate">Clinic Admin · Growth</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors shrink-0" />
        </div>
      </div>
    </div>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop Sidebar — fixed */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[268px] lg:shrink-0 lg:fixed lg:inset-y-0 lg:z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-[280px] h-full max-w-[85vw] shadow-2xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[268px]">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 h-14 px-4 bg-slate-900/95 backdrop-blur border-b border-slate-700/60 shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0 flex-1">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
              Inicio
            </Link>
            {breadcrumbs.slice(1).map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                {i === breadcrumbs.length - 2 ? (
                  <span className="text-slate-200 font-medium truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-slate-500 hover:text-slate-300 transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Search */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-sm hover:border-sky-500/50 hover:text-slate-300 transition-all">
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Buscar...</span>
              <kbd className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Mobile search */}
            <button className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-500 rounded-full" />
            </button>

            {/* Quick links */}
            <Link
              href="/dashboard/sitemap"
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Ver todos los enlaces"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow">
              JG
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            © 2026 Orthonoba SaaS · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/sitemap" className="text-xs text-slate-600 hover:text-sky-400 transition-colors">
              Mapa del sitio
            </Link>
            <Link href="/dashboard/settings" className="text-xs text-slate-600 hover:text-sky-400 transition-colors">
              Configuración
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
