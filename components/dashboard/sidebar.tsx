'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  TrendingUp,
  Kanban,
  ClipboardList,
  Plus,
  Upload,
  Library,
  Cpu,
  Wrench,
  Megaphone,
  BarChart2,
  MessageCircle,
  Mail,
  CreditCard,
  Package,
  FileText,
  Settings,
  User,
  UsersRound,
  ShieldCheck,
} from 'lucide-react'
import type { ComponentType } from 'react'

type NavChild = {
  href: string
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

type NavGroup = {
  section: string
  href: string
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
  children?: NavChild[]
}

const NAV: NavGroup[] = [
  {
    section: '',
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    section: 'CRM',
    href: '/crm',
    label: 'CRM',
    icon: UserCheck,
    children: [
      { href: '/crm/leads',    label: 'Leads',    icon: TrendingUp },
      { href: '/crm/patients', label: 'Patients', icon: Users },
      { href: '/crm/pipeline', label: 'Pipeline', icon: Kanban },
    ],
  },
  {
    section: 'Operaciones',
    href: '/orders',
    label: 'Orders',
    icon: ClipboardList,
    children: [
      { href: '/orders/new', label: 'New Order', icon: Plus },
    ],
  },
  {
    section: 'Operaciones',
    href: '/stl-upload',
    label: 'STL Upload',
    icon: Upload,
  },
  {
    section: 'Operaciones',
    href: '/stl-library',
    label: 'STL Library',
    icon: Library,
  },
  {
    section: 'Operaciones',
    href: '/cad-design',
    label: 'CAD Design',
    icon: Cpu,
    children: [
      { href: '/cad-design/exocad', label: 'Exocad', icon: Cpu },
      { href: '/cad-design/jobs',   label: 'Jobs',   icon: Wrench },
    ],
  },
  {
    section: 'Marketing',
    href: '/marketing',
    label: 'Marketing',
    icon: Megaphone,
    children: [
      { href: '/marketing/campaigns', label: 'Campaigns', icon: BarChart2 },
      { href: '/marketing/whatsapp',  label: 'WhatsApp',  icon: MessageCircle },
      { href: '/marketing/email',     label: 'Email',     icon: Mail },
    ],
  },
  {
    section: 'Finanzas',
    href: '/billing',
    label: 'Billing',
    icon: CreditCard,
    children: [
      { href: '/billing/plans',    label: 'Plans',    icon: Package },
      { href: '/billing/invoices', label: 'Invoices', icon: FileText },
    ],
  },
  {
    section: 'Cuenta',
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { href: '/settings/profile',  label: 'Profile',  icon: User },
      { href: '/settings/team',     label: 'Team',     icon: UsersRound },
      { href: '/settings/security', label: 'Security', icon: ShieldCheck },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  let lastSection = ''

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
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {NAV.map(({ section, href, label, icon: Icon, children }) => {
          const active = isActive(href)
          const showSection = section && section !== lastSection
          if (showSection) lastSection = section

          return (
            <div key={href}>
              {showSection && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {section}
                </p>
              )}

              {/* Parent item */}
              <Link
                href={href}
                className={[
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')}
              >
                <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
                {label}
              </Link>

              {/* Children — always visible */}
              {children?.map((child) => {
                const childActive = pathname === child.href
                const ChildIcon = child.icon
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={[
                      'flex items-center gap-3 pl-9 pr-3 py-1.5 rounded-lg text-sm transition-colors duration-150',
                      childActive
                        ? 'text-blue-700 font-medium bg-blue-50/60'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                    ].join(' ')}
                  >
                    <ChildIcon size={14} className={childActive ? 'text-blue-500' : 'text-slate-300'} />
                    {child.label}
                  </Link>
                )
              })}
            </div>
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
