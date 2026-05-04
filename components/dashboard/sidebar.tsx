'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UserCheck,
  Users,
  ClipboardList,
  Box,
  Upload,
  Megaphone,
  Zap,
  CreditCard,
  Settings,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',        label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/marketing/leads',  label: 'CRM',           icon: UserCheck       },
  { href: '/patients',         label: 'Patients',      icon: Users           },
  { href: '/orders',           label: 'Orders',        icon: ClipboardList   },
  { href: '/cases',            label: 'CAD Design',    icon: Box             },
  { href: '/files/stl',        label: 'STL Upload',    icon: Upload          },
  { href: '/marketing',        label: 'Marketing',     icon: Megaphone       },
  { href: '/automation',       label: 'AI Automation', icon: Zap             },
  { href: '/billing',          label: 'Billing',       icon: CreditCard      },
  { href: '/settings',         label: 'Settings',      icon: Settings        },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-slate-100 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">O</span>
        </div>
        <span className="font-semibold text-slate-900 text-sm">Orthonoba</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon
                size={16}
                className={active ? 'text-blue-600' : 'text-slate-400'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-700 font-semibold text-xs">AD</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Admin</p>
            <p className="text-xs text-slate-400 truncate">clinic_admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
