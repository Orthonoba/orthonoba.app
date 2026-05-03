import Link from 'next/link'
import { User, Shield, Key, Building2, Bell, Globe, ChevronRight } from 'lucide-react'

const SETTINGS_LINKS = [
  { href: '/settings/profile',  label: 'Perfil',      desc: 'Nombre, avatar, cargo y datos personales', icon: User,     badge: null },
  { href: '/settings/security', label: 'Seguridad',   desc: 'Contraseña, 2FA y sesiones activas',       icon: Shield,   badge: null },
  { href: '/settings/api-keys', label: 'API Keys',    desc: 'Gestiona las claves de acceso a la API',   icon: Key,      badge: '2' },
]

const ACCOUNT = {
  name: 'Jose Greorio', email: 'jose@orthonoba.app', plan: 'Growth', clinic: 'Clínica Dental Norte',
  role: 'Super Admin', joined: 'Enero 2025', lastLogin: '2026-05-04 09:30',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-slate-400 text-sm mt-0.5">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {SETTINGS_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition group">
              <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition">
                <link.icon className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition">{link.label}</p>
                <p className="text-xs text-slate-500">{link.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {link.badge && <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-1.5 py-0.5 rounded-full">{link.badge}</span>}
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
              </div>
            </Link>
          ))}
        </div>

        {/* Account summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
                JG
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{ACCOUNT.name}</h2>
                <p className="text-slate-400 text-sm">{ACCOUNT.email}</p>
              </div>
              <div className="ml-auto">
                <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold px-2.5 py-1 rounded-full">{ACCOUNT.plan}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: Building2, label: 'Organización', value: ACCOUNT.clinic },
                { icon: Shield, label: 'Rol', value: ACCOUNT.role },
                { icon: Globe, label: 'Miembro desde', value: ACCOUNT.joined },
                { icon: Bell, label: 'Último acceso', value: ACCOUNT.lastLogin },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2.5 p-3 bg-slate-700/30 rounded-lg">
                  <row.icon className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">{row.label}</p>
                    <p className="text-slate-200 font-medium text-sm">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">Notificaciones activadas</p>
              <p className="text-xs text-amber-200/60 mt-0.5">Recibes notificaciones por email y en la plataforma. Puedes configurarlas en la sección de perfil.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
