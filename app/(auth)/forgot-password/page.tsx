'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, ArrowLeft, CheckCircle2, Send } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
    toast.success('Enlace enviado a tu correo')
  }

  return (
    <>
      <Link href="/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver al login
      </Link>

      {!sent ? (
        <>
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 mx-auto mb-5">
            <Mail className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Recuperar contraseña</h1>
          <p className="text-slate-400 text-sm text-center mb-7">
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@clinica.com"
                required
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Enviar enlace <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">¡Correo enviado!</h1>
          <p className="text-slate-400 text-sm mb-2">
            Hemos enviado un enlace de recuperación a{' '}
            <span className="text-sky-400 font-medium">{email}</span>
          </p>
          <p className="text-slate-500 text-xs mb-7">Revisa tu carpeta de spam si no lo ves en unos minutos.</p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ¿No recibiste el correo? Reenviar
          </button>
        </div>
      )}
    </>
  )
}
