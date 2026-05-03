'use client'
import { useState } from 'react'
import { Eye, EyeOff, Shield, Smartphone, Laptop, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const SESSIONS = [
  { id: '1', device: 'Chrome · Windows 11',    location: 'Madrid, España',   last: 'Ahora mismo',        current: true },
  { id: '2', device: 'Safari · iPhone 15',      location: 'Madrid, España',   last: 'Hace 2 horas',       current: false },
  { id: '3', device: 'Firefox · MacBook Pro',   location: 'Barcelona, España', last: 'Ayer a las 18:30',  current: false },
]

const INPUT = "w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"

export default function SecurityPage() {
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false })
  const [pass, setPass] = useState({ current: '', new: '', confirm: '' })
  const [twoFA, setTwoFA] = useState(false)

  function handleChangePass(e: React.FormEvent) {
    e.preventDefault()
    if (!pass.current || !pass.new || !pass.confirm) { toast.error('Rellena todos los campos'); return }
    if (pass.new !== pass.confirm) { toast.error('Las contraseñas no coinciden'); return }
    if (pass.new.length < 8) { toast.error('La contraseña debe tener mínimo 8 caracteres'); return }
    toast.success('Contraseña actualizada correctamente')
    setPass({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Seguridad</h1>
        <p className="text-slate-400 text-sm mt-0.5">Gestiona tu contraseña, 2FA y sesiones activas</p>
      </div>

      {/* Change password */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-sky-400" />Cambiar contraseña</h2>
        <form onSubmit={handleChangePass} className="space-y-4">
          {[
            { key: 'current', label: 'Contraseña actual', show: show.current, toggle: () => setShow({ ...show, current: !show.current }) },
            { key: 'new',     label: 'Nueva contraseña',  show: show.newPass, toggle: () => setShow({ ...show, newPass: !show.newPass }) },
            { key: 'confirm', label: 'Confirmar nueva',   show: show.confirm, toggle: () => setShow({ ...show, confirm: !show.confirm }) },
          ].map((f) => (
            <div key={f.key} className="relative">
              <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
              <input
                type={f.show ? 'text' : 'password'}
                value={pass[f.key as keyof typeof pass]}
                onChange={(e) => setPass({ ...pass, [f.key]: e.target.value })}
                placeholder="••••••••"
                className={INPUT}
              />
              <button type="button" onClick={f.toggle} className="absolute right-3 top-7 text-slate-400 hover:text-white transition">
                {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ))}
          <button type="submit" className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition">
            Actualizar contraseña
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Autenticación de dos factores (2FA)</h2>
              <p className="text-xs text-slate-400 mt-1">Añade una capa extra de seguridad usando una app de autenticación</p>
            </div>
          </div>
          <button
            onClick={() => { setTwoFA(!twoFA); toast.success(twoFA ? '2FA desactivado' : '2FA activado') }}
            className={['relative w-11 h-6 rounded-full transition-colors shrink-0', twoFA ? 'bg-sky-500' : 'bg-slate-700'].join(' ')}
          >
            <div className={['absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', twoFA ? 'translate-x-6' : 'translate-x-1'].join(' ')} />
          </button>
        </div>

        {twoFA && (
          <div className="mt-5 p-4 bg-slate-700/40 rounded-xl flex items-center gap-5">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center text-slate-400 text-xs text-center shrink-0">
              <span>[QR Code]</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Escanea con tu app</p>
              <p className="text-xs text-slate-400">Usa Google Authenticator, Authy o similar para escanear el código QR.</p>
              <p className="font-mono text-xs text-sky-400 mt-2 bg-slate-800 px-2 py-1 rounded">JBSWY3DPEHPK3PXP</p>
            </div>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Laptop className="w-4 h-4 text-sky-400" />Sesiones activas</h2>
        <div className="space-y-2">
          {SESSIONS.map((s) => (
            <div key={s.id} className={['flex items-center gap-3 p-3 rounded-lg', s.current ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-slate-700/30'].join(' ')}>
              <div className={['w-2 h-2 rounded-full shrink-0', s.current ? 'bg-emerald-400' : 'bg-slate-500'].join(' ')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{s.device}</p>
                <p className="text-xs text-slate-400">{s.location} · {s.last}</p>
              </div>
              {s.current ? (
                <span className="text-xs text-emerald-400 font-medium shrink-0">Esta sesión</span>
              ) : (
                <button onClick={() => toast.success('Sesión cerrada')} className="text-xs text-red-400 hover:text-red-300 font-medium shrink-0 transition">
                  Cerrar
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => toast.warning('Todas las demás sesiones cerradas')} className="mt-3 flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition">
          <AlertTriangle className="w-3.5 h-3.5" /> Cerrar todas las sesiones remotas
        </button>
      </div>
    </div>
  )
}
