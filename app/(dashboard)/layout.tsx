'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Briefcase, Stethoscope,
  ClipboardList, FlaskConical, GraduationCap, Zap, TrendingUp,
  Brain, CreditCard, ShieldCheck, Settings, Bell, Search,
  ChevronDown, ChevronRight, Menu, X, LogOut, Box,
  Truck, FileText, BarChart2, Megaphone, Filter,
  BookOpen, PlayCircle, UserCheck, Key, User,
  DollarSign, Receipt, PieChart, Clock, Hash,
  Map, Tag, Star,
} from 'lucide-react'
import type { ReactNode } from 'react'

// ─── Nav types ─────────────────────────────────────────────────────────────────

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

// ─── Navigation — all routes use /X paths (route group strips /dashboard prefix)

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      {
        href: '/patients',
        label: 'Pacientes',
        icon: Users,
        children: [
          { href: '/patients',     label: 'Todos los pacientes', icon: Users },
          { href: '/patients/new', label: 'Nuevo paciente',      icon: User },
        ],
      },
      {
        href: '/cases',
        label: 'Casos Clínicos',
        icon: Briefcase,
        badge: '12',
        children: [
          { href: '/cases',     label: 'Todos los casos', icon: Briefcase },
          { href: '/cases/new', label: 'Nuevo caso',      icon: FileText },
        ],
      },
      {
        href: '/orders',
        label: 'Órdenes Lab',
        icon: ClipboardList,
        badge: '5',
        children: [
          { href: '/orders',         label: 'Todas las órdenes',  icon: ClipboardList },
          { href: '/orders/pickup',  label: 'Solicitar recogida', icon: Truck, badge: 'Nuevo' },
        ],
      },
      { href: '/doctors',    label: 'Doctores',    icon: Stethoscope },
      { href: '/files/stl',  label: 'Archivos 3D', icon: Box, badge: 'STL' },
    ],
  },
  {
    label: 'Clínica & Lab',
    items: [
      {
        href: '/clinics',
        label: 'Clínicas',
        icon: Building2,
        children: [
          { href: '/clinics',     label: 'Todas las clínicas', icon: Building2 },
          { href: '/clinics/new', label: 'Nueva clínica',      icon: Building2 },
        ],
      },
      { href: '/labs', label: 'Laboratorios', icon: FlaskConical },
    ],
  },
  {
    label: 'Crecimiento',
    items: [
      {
        href: '/marketing/leads',
        label: 'Marketing',
        icon: Megaphone,
        children: [
          { href: '/marketing/leads',     label: 'Leads & CRM',   icon: Filter },
          { href: '/marketing/campaigns', label: 'Campañas',       icon: Megaphone },
          { href: '/marketing/funnels',   label: 'Funnels',        icon: TrendingUp },
          { href: '/marketing/analytics', label: 'Analytics',      icon: BarChart2 },
        ],
      },
      {
        href: '/automation',
        label: 'Automatización',
        icon: Zap,
        badge: '3',
        children: [
          { href: '/automation',           label: 'Panel general',  icon: Zap },
          { href: '/automation/rules',     label: 'Reglas',         icon: Hash },
          { href: '/automation/reminders', label: 'Recordatorios',  icon: Clock },
        ],
      },
      { href: '/ai', label: 'IA & Predicciones', icon: Brain, badge: 'Beta' },
    ],
  },
  {
    label: 'Academy',
    items: [
      {
        href: '/courses',
        label: 'Cursos',
        icon: GraduationCap,
        children: [
          { href: '/courses',     label: 'Catálogo',    icon: BookOpen },
          { href: '/courses/new', label: 'Nuevo curso', icon: PlayCircle },
        ],
      },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      {
        href: '/billing',
        label: 'Facturación',
        icon: CreditCard,
        children: [
          { href: '/billing',          label: 'Resumen',             icon: DollarSign },
          { href: '/billing/invoices', label: 'Facturas',            icon: Receipt },
          { href: '/billing/plans',    label: 'Planes & Suscripción', icon: Tag },
        ],
      },
    ],
  },
  {
    label: 'Plataforma',
    items: [
      { href: '/executive', label: 'Reporte Ejecutivo', icon: PieChart },
      {
        href: '/admin/users',
        label: 'Administración',
        icon: ShieldCheck,
        children: [
          { href: '/admin/users', label: 'Usuarios',         icon: Users },
          { href: '/admin/roles', label: 'Roles & Permisos', icon: UserCheck },
        ],
      },
      {
        href: '/settings',
        label: 'Configuración',
        icon: Settings,
        children: [
          { href: '/settings',           label: 'General',   icon: Settings },
          { href: '/settings/profile',   label: 'Perfil',    icon: User },
          { href: '/settings/security',  label: 'Seguridad', icon: ShieldCheck },
          { href: '/settings/api-keys',  label: 'API Keys',  icon: Key },
        ],
      },
      { href: '/sitemap', label: 'Mapa del sitio', icon: Map },
    ],
  },
]

// ─── Sidebar ────────────────────────────────────────────────────────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const g of NAV_GROUPS) {
      for (const item of g.items) {
        if (item.children && (pathname === item.href || pathname.startsWith(item.href + '/'))) {
          init[item.href] = true
        }
      }
    }
    return init
  })

  function toggleExpand(href: string) {
    setExpanded((p) => ({ ...p, [href]: !p[href] }))
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  function isParentActive(item: NavItem) {
    return isActive(item.href) || (item.children?.some((c) => isActive(c.href)) ?? false)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700/60 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5">
            <path d="M12 2C8 2 5 5 5 9c0 2 .5 3.5 1 5l2 6c.3.9 1.1 1.5 2 1.5h4c.9 0 1.7-.6 2-1.5l2-6c.5-1.5 1-3 1-5 0-4-3-7-7-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-base leading-tight">Orthonoba</p>
          <p className="text-[10px] text-sky-400 font-medium tracking-wider uppercase">Dental SaaS</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white transition lg:hidden p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isParentActive(item)
              const open = expanded[item.href] ?? false

              return (
                <div key={item.href}>
                  {item.children ? (
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className={[
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'text-sky-400 bg-sky-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                      ].join(' ')}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={[
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                          item.badge === 'Beta' ? 'bg-violet-500/20 text-violet-400'
                          : item.badge === 'Nuevo' ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-sky-500/20 text-sky-400',
                        ].join(' ')}>
                          {item.badge}
                        </span>
                      )}
                      {open ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={[
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        isActive(item.href)
                          ? 'text-sky-400 bg-sky-500/10 border border-sky-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                      ].join(' ')}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={[
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                          item.badge === 'Beta' ? 'bg-violet-500/20 text-violet-400'
                          : item.badge === 'STL' ? 'bg-teal-500/20 text-teal-400'
                          : 'bg-sky-500/20 text-sky-400',
                        ].join(' ')}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Children */}
                  {item.children && open && (
                    <div className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-700/60 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={[
                            'flex items-center gap-2 py-1.5 px-2 rounded-md text-xs font-medium transition-all',
                            isActive(child.href)
                              ? 'text-sky-400 bg-sky-500/10'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800',
                          ].join(' ')}
                        >
                          {child.icon && <child.icon className="w-3.5 h-3.5 shrink-0" />}
                          <span>{child.label}</span>
                          {child.badge && (
                            <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
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
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 cursor-pointer group transition">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            JG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">Jose Greorio</p>
            <p className="text-xs text-slate-500 truncate">clinic_admin · Growth</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-400 transition shrink-0" />
        </div>
      </div>
    </div>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((seg, i, arr) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      href: '/' + arr.slice(0, i + 1).join('/'),
    }))

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:shrink-0 lg:fixed lg:inset-y-0 lg:z-50">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-[260px] h-full z-10">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 h-14 px-4 bg-slate-900/95 backdrop-blur border-b border-slate-700/60 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-slate-200 font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-slate-500 hover:text-slate-300 transition">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-sm hover:border-sky-500/50 transition group">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Buscar...</span>
            <kbd className="hidden sm:inline text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-slate-900" />
          </button>

          {/* Plan badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg">
            <Star className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-semibold text-sky-400">Growth</span>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-transparent hover:ring-sky-500/50 transition">
            JG
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
