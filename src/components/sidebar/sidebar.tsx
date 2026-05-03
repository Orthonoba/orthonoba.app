'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/src/store/auth-store'
import { useUIStore } from '@/src/store/ui-store'
import { LogoutButton } from '@/src/components/ui/logout-button'
import type { UserRole } from '@/src/types/user'

// ─── Nav types ────────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: UserRole[]
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
  roles?: UserRole[]
}

// ─── Inline SVG icons (20×20) ─────────────────────────────────────────────────

const Icons = {
  grid: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
    </svg>
  ),
  beaker: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7z" clipRule="evenodd" />
    </svg>
  ),
  cube: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  ),
  academic: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>
  ),
  creditCard: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  ),
  trending: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
  ),
  cog: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
}

// ─── Navigation tree ──────────────────────────────────────────────────────────

const NAV: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: Icons.grid },
      {
        href: '/dashboard/patients',
        label: 'Pacientes',
        icon: Icons.users,
        roles: ['clinic_admin', 'doctor', 'staff'],
      },
      {
        href: '/dashboard/orders',
        label: 'Órdenes',
        icon: Icons.clipboard,
        roles: ['clinic_admin', 'doctor', 'staff', 'lab_admin'],
      },
      {
        href: '/dashboard/lab',
        label: 'Laboratorio',
        icon: Icons.beaker,
        roles: ['lab_admin'],
      },
      {
        href: '/dashboard/files/stl',
        label: 'Archivos 3D / STL',
        icon: Icons.cube,
        roles: ['clinic_admin', 'lab_admin', 'doctor'],
      },
    ],
  },
  {
    title: 'Crecimiento',
    roles: ['clinic_admin', 'lab_admin'],
    items: [
      {
        href: '/dashboard/marketing',
        label: 'Marketing',
        icon: Icons.chart,
        roles: ['clinic_admin'],
      },
      {
        href: '/dashboard/leads',
        label: 'Leads & CRM',
        icon: Icons.filter,
        roles: ['clinic_admin', 'staff'],
      },
      {
        href: '/dashboard/automation',
        label: 'Automatización',
        icon: Icons.bolt,
        roles: ['clinic_admin', 'lab_admin'],
      },
    ],
  },
  {
    title: 'Formación',
    items: [
      { href: '/dashboard/academy', label: 'Academy', icon: Icons.academic },
    ],
  },
  {
    title: 'Finanzas',
    roles: ['clinic_admin', 'lab_admin', 'super_admin'],
    items: [
      {
        href: '/dashboard/billing',
        label: 'Facturación',
        icon: Icons.creditCard,
        roles: ['clinic_admin', 'lab_admin', 'super_admin'],
      },
    ],
  },
  {
    title: 'Plataforma',
    roles: ['super_admin'],
    items: [
      {
        href: '/dashboard/executive',
        label: 'Reporte Ejecutivo',
        icon: Icons.trending,
        roles: ['super_admin'],
      },
      {
        href: '/dashboard/settings',
        label: 'Configuración',
        icon: Icons.cog,
        roles: ['super_admin', 'clinic_admin', 'lab_admin'],
      },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname    = usePathname()
  const user        = useAuthStore((s) => s.user)
  const open        = useUIStore((s) => s.sidebarOpen)
  const toggle      = useUIStore((s) => s.toggleSidebar)
  const role        = user?.role as UserRole | undefined

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const canShow = (item: { roles?: UserRole[] }) =>
    !item.roles || (role != null && item.roles.includes(role))

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : '?'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={toggle}
          aria-hidden
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'bg-white border-r border-slate-200',
          'transition-all duration-200 ease-in-out',
          'lg:static lg:translate-x-0',
          open
            ? 'w-64 translate-x-0 shadow-lg lg:shadow-none'
            : 'w-64 -translate-x-full lg:w-16',
        ].join(' ')}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          {open && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">O</span>
              </div>
              <span className="font-semibold text-slate-900 text-sm truncate">
                Orthonoba
              </span>
            </div>
          )}
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            {open ? Icons.chevronLeft : Icons.menu}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-5 overflow-y-auto">
          {NAV.map((section) => {
            if (!canShow(section)) return null
            const visibleItems = section.items.filter(canShow)
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title}>
                {open && (
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-1">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={!open ? item.label : undefined}
                          className={[
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                            'transition-colors duration-150',
                            active
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            !open && 'justify-center px-2',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <span
                            className={[
                              'shrink-0',
                              active ? 'text-blue-600' : 'text-slate-400',
                            ].join(' ')}
                          >
                            {item.icon}
                          </span>
                          {open && <span className="truncate">{item.label}</span>}
                          {open && item.badge && (
                            <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-100 p-3 shrink-0">
          {open ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-semibold text-xs">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-700 font-semibold text-xs">{initials}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
