'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, ChevronRight, ChevronLeft, Check, Building2, User, CreditCard } from 'lucide-react'

const step1Schema = z.object({
  name:     z.string().min(2, 'Mínimo 2 caracteres'),
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Las contraseñas no coinciden', path: ['confirm'] })

const step2Schema = z.object({
  clinicName: z.string().min(2, 'Requerido'),
  country:    z.string().min(1, 'Requerido'),
  phone:      z.string().min(7, 'Teléfono inválido'),
  type:       z.enum(['clinic', 'lab', 'academy']),
})

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>

const PLANS = [
  { id: 'starter',    name: 'Starter',    price: '€49',   features: ['5 usuarios', '500 tokens IA/mes', 'Cursos básicos', 'Soporte email'] },
  { id: 'growth',     name: 'Growth',     price: '€149',  features: ['15 usuarios', '2.000 tokens IA/mes', 'Cursos avanzados', 'Marketing tools', 'Soporte prioritario'], popular: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Ilimitado', 'Tokens IA ∞', 'Todo incluido', 'Manager dedicado', 'SLA 99.9%'] },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState('growth')
  const [showPass, setShowPass] = useState(false)
  const [data1, setData1] = useState<Step1 | null>(null)
  const [data2, setData2] = useState<Step2 | null>(null)

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { type: 'clinic', country: 'España' } })

  function onStep1(d: Step1) { setData1(d); setStep(2) }
  function onStep2(d: Step2) { setData2(d); setStep(3) }
  function onFinish() {
    toast.success('¡Cuenta creada! Revisa tu email para confirmar.')
  }

  const steps = [
    { n: 1, label: 'Tu cuenta',  icon: User },
    { n: 2, label: 'Tu clínica', icon: Building2 },
    { n: 3, label: 'Plan',       icon: CreditCard },
  ]

  return (
    <>
      <h1 className="text-2xl font-bold text-white text-center mb-2">Crear cuenta</h1>
      <p className="text-slate-400 text-sm text-center mb-6">Empieza gratis hoy</p>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className={[
              'flex items-center gap-2 text-sm font-medium transition-colors',
              step > s.n ? 'text-emerald-400' : step === s.n ? 'text-sky-400' : 'text-slate-500',
            ].join(' ')}>
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                step > s.n ? 'bg-emerald-500/20 border-emerald-500' : step === s.n ? 'bg-sky-500/20 border-sky-500' : 'border-slate-600',
              ].join(' ')}>
                {step > s.n ? <Check className="w-4 h-4" /> : <span className="text-xs">{s.n}</span>}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < 2 && <div className={['flex-1 h-px mx-2 transition-colors', step > s.n ? 'bg-emerald-500/40' : 'bg-slate-700'].join(' ')} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Nombre completo</label>
            <input {...form1.register('name')} placeholder="María González" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition" />
            {form1.formState.errors.name && <p className="text-red-400 text-xs mt-1">{form1.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <input {...form1.register('email')} type="email" placeholder="maria@clinica.com" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition" />
            {form1.formState.errors.email && <p className="text-red-400 text-xs mt-1">{form1.formState.errors.email.message}</p>}
          </div>
          <div className="relative">
            <label className="text-sm text-slate-300 mb-1 block">Contraseña</label>
            <input {...form1.register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-8 text-slate-400">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            {form1.formState.errors.password && <p className="text-red-400 text-xs mt-1">{form1.formState.errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Confirmar contraseña</label>
            <input {...form1.register('confirm')} type="password" placeholder="••••••••" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition" />
            {form1.formState.errors.confirm && <p className="text-red-400 text-xs mt-1">{form1.formState.errors.confirm.message}</p>}
          </div>
          <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Nombre de la clínica</label>
            <input {...form2.register('clinicName')} placeholder="Clínica Dental Norte" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition" />
            {form2.formState.errors.clinicName && <p className="text-red-400 text-xs mt-1">{form2.formState.errors.clinicName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">País</label>
              <select {...form2.register('country')} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                <option>España</option><option>México</option><option>Argentina</option><option>Colombia</option><option>Chile</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Teléfono</label>
              <input {...form2.register('phone')} placeholder="+34 600 000 000" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition" />
              {form2.formState.errors.phone && <p className="text-red-400 text-xs mt-1">{form2.formState.errors.phone.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Tipo de organización</label>
            <div className="grid grid-cols-3 gap-2">
              {(['clinic', 'lab', 'academy'] as const).map((t) => (
                <label key={t} className={['flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition', form2.watch('type') === t ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-slate-600 text-slate-400 hover:border-slate-500'].join(' ')}>
                  <input type="radio" value={t} {...form2.register('type')} className="sr-only" />
                  <span className="text-xs font-medium capitalize">{t === 'clinic' ? 'Clínica' : t === 'lab' ? 'Lab' : 'Academia'}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex-1 border border-slate-600 text-slate-300 hover:border-slate-500 font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button type="submit" className="flex-1 bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid gap-3">
            {PLANS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPlan(p.id)} className={['relative w-full text-left p-4 rounded-xl border-2 transition-all', plan === p.id ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 hover:border-slate-500'].join(' ')}>
                {p.popular && <span className="absolute -top-2 right-4 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Más popular</span>}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{p.name}</span>
                  <span className="text-sky-400 font-bold">{p.price}<span className="text-slate-400 text-xs font-normal">/mes</span></span>
                </div>
                <ul className="space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 border border-slate-600 text-slate-300 hover:border-slate-500 font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <button type="button" onClick={onFinish} className="flex-1 bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
              Crear cuenta <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-slate-500 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">Inicia sesión</Link>
      </p>
    </>
  )
}
