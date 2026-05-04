import Link from 'next/link'

const NAV_LINKS = [
  { href: '/',           label: 'Home'      },
  { href: '/crm',        label: 'CRM'       },
  { href: '/cad-design', label: 'CAD'       },
  { href: '/marketing',  label: 'Marketing' },
  { href: '/pricing',    label: 'Pricing'   },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">O</span>
          </div>
          <span className="font-semibold text-slate-900 text-sm">Orthonoba</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/demo"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Solicitar demo
          </Link>
        </div>

      </nav>
    </header>
  )
}
