'use client'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { ShieldCheck, RefreshCw } from 'lucide-react'

export default function VerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const [loading, setLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const canResend = countdown <= 0

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function handleVerify() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    toast.success('Email verificado correctamente')
  }

  function handleChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) {
      refs.current[i + 1]?.focus()
    } else if (val && i === 5 && next.every((d) => d !== '')) {
      // Last digit filled — auto-submit outside of render cycle
      setTimeout(() => { void handleVerify() }, 0)
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handleResend() {
    setCountdown(60)
    setOtp(['', '', '', '', '', ''])
    toast.info('Nuevo código enviado')
    refs.current[0]?.focus()
  }

  return (
    <>
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 mx-auto mb-5">
        <ShieldCheck className="w-6 h-6 text-sky-400" />
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">Verificar email</h1>
      <p className="text-slate-400 text-sm text-center mb-8">
        Hemos enviado un código de 6 dígitos a tu email
      </p>

      {/* OTP Inputs */}
      <div className="flex gap-2 justify-center mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={[
              'w-11 h-12 text-center text-xl font-bold rounded-lg border-2 bg-slate-700/50 text-white transition-all focus:outline-none',
              digit ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 focus:border-sky-500',
            ].join(' ')}
          />
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
          <span className="w-4 h-4 border-2 border-sky-500/40 border-t-sky-500 rounded-full animate-spin" />
          Verificando...
        </div>
      )}

      <div className="text-center">
        {canResend ? (
          <button onClick={handleResend} className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 mx-auto transition">
            <RefreshCw className="w-4 h-4" /> Reenviar código
          </button>
        ) : (
          <p className="text-sm text-slate-500">
            Reenviar en <span className="text-slate-300 font-mono font-bold">{countdown}s</span>
          </p>
        )}
      </div>
    </>
  )
}
