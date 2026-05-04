'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Briefcase, Stethoscope,
  ClipboardList, FlaskConical, GraduationCap, Zap, TrendingUp,
  Brain, CreditCard, ShieldCheck, Settings, Bell, Search,
  ChevronDown, ChevronRight, Menu, X, LogOut, User,
} from 'lucide-react'
import type { ReactNode } from 'react'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Clínica',
    items: [
      { href: '/clinics',  label: 'Clínicas',   icon: Building2 },
      { href: '/patients', label: 'Pacientes',  icon: Users },
      { href: '/cases',    label: 'Casos',      icon: Briefcase, badge: '12' },
      { href: '/doctors',  label: 'Doctores',   icon: Stethoscope },
    ],
  },
  {
    label: 'Laboratorio',
    items: [
      { href: '/orders', label: 'Órdenes', icon: ClipboardList, badge: '5' },
      { href: '/labs',   label: 'Labs',    icon: FlaskConical },
    ],
  },
  {
    label: 'Academia',
    items: [{ href: '/courses', label: 'Cursos', icon: GraduationCap }],
  },
  {
    label: 'Automatización',
    items: [{ href: '/automation', label: 'Automatización', icon: Zap, badge: '3' }],
  },
  {
    label: 'Crecimiento',
    items: [
      { href: '/marketing', label: 'Marketing', icon: TrendingUp },
      { href: '/ai',        label: 'IA',         icon: Brain, badge: 'Beta' },
    ],
  },
  {
    label: 'Finanzas',
    items: [{ href: '/billing', label: 'Billing', icon: CreditCard }],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin',    label: 'Admin',    icon: ShieldCheck },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  function toggle(label: string) {
    setCollapsed((p) => ({ ...p, [label]: !p[label] }))
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700/60">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white">
            <path d="M12 2C8 2 5 5 5 9c0 2 .5 3.5 1 5l2 6c.3.9 1.1 1.5 2 1.5h4c.9 0 1.7-.6 2-1.5l2-6c.5-1.5 1-3 1-5 0-4-3-7-7-7z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Orthonoba</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <button
              onClick={() => toggle(group.label)}
              className="flex items-center w-full gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
            >
              {collapsed[group.label] ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {group.label}
            </button>

            {!collapsed[group.label] && (
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={[
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
                      ].join(' ')}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className={[
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                          item.badge === 'Beta'
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-sky-500/20 text-sky-400',
                        ].join(' ')}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-700/60">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            JG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">Jose Greorio</p>
            <p className="text-xs text-slate-500 truncate">clinic_admin</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const breadcrumb = pathname
    .split('/')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
    .join(' › ')

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:shrink-0 lg:fixed lg:inset-y-0 lg:z-50">
        <SidebarNav />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-[260px] h-full">
            <SidebarNav onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-4 h-14 px-4 bg-slate-900/95 backdrop-blur border-b border-slate-700/60">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center text-sm text-slate-400">
            <span className="text-slate-200 font-medium">{breadcrumb || 'Dashboard'}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-sm hover:border-sky-500/50 transition-colors">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline text-xs bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            JG
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
