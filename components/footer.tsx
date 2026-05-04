import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <span>© {new Date().getFullYear()} Orthonoba. Todos los derechos reservados.</span>
        <nav className="flex items-center gap-4">
          <Link href="/legal/privacy-policy" className="hover:text-slate-900 transition-colors">Privacidad</Link>
          <Link href="/legal/terms" className="hover:text-slate-900 transition-colors">Términos</Link>
          <Link href="/legal/cookies" className="hover:text-slate-900 transition-colors">Cookies</Link>
          <Link href="/legal/data-protection" className="hover:text-slate-900 transition-colors">Protección de datos</Link>
        </nav>
      </div>
    </footer>
  )
}
