'use client'
import { useState } from 'react'
import { Check, Zap, Star, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const PLANS = [
  {
    id: 'starter', name: 'Starter', monthly: 49, annual: 470, icon: Zap,
    color: 'border-slate-600',
    features: ['5 usuarios', '500 tokens IA/mes', 'Módulo clínico básico', 'Cursos gratuitos', 'Soporte por email', '5 GB almacenamiento'],
    notIncluded: ['Marketing tools', 'IA avanzada', 'Laboratorio', 'API acceso'],
  },
  {
    id: 'growth', name: 'Growth', monthly: 149, annual: 1430, icon: Star, popular: true,
    color: 'border-sky-500',
    features: ['15 usuarios', '2.000 tokens IA/mes', 'CRM + Marketing', 'Cursos Growth', 'Automatización', 'Laboratorio integrado', 'Soporte prioritario', '50 GB almacenamiento'],
    notIncluded: ['API dedicada', 'Manager dedicado'],
  },
  {
    id: 'enterprise', name: 'Enterprise', monthly: null, annual: null, icon: Building2,
    color: 'border-violet-500/50',
    features: ['Usuarios ilimitados', 'Tokens IA ilimitados', 'Todo incluido', 'Todos los cursos', 'Automatización avanzada', 'API dedicada', 'Manager dedicado', 'SLA 99.9%', 'Almacenamiento ilimitado'],
    notIncluded: [],
  },
]

export default function PlansPage() {
  const [annual, setAnnual] = useState(false)
  const currentPlan = 'growth'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Planes y Precios</h1>
        <p className="text-slate-400 text-sm mt-1">Actualiza o cambia tu plan en cualquier momento</p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-slate-500'}`}>Mensual</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={['relative w-12 h-6 rounded-full transition-colors', annual ? 'bg-sky-500' : 'bg-slate-700'].join(' ')}
        >
          <div className={['absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', annual ? 'translate-x-7' : 'translate-x-1'].join(' ')} />
        </button>
        <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-slate-500'}`}>
          Anual <span className="text-emerald-400 font-bold">−20%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const price = annual ? plan.annual : plan.monthly
          const isCurrent = plan.id === currentPlan
          return (
            <div key={plan.id} className={['relative bg-slate-800 border-2 rounded-2xl p-6 flex flex-col', plan.color, plan.popular ? 'shadow-xl shadow-sky-500/10' : ''].join(' ')}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">Más popular</span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Plan actual</span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={['w-10 h-10 rounded-xl flex items-center justify-center', plan.popular ? 'bg-sky-500/20' : 'bg-slate-700'].join(' ')}>
                  <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-sky-400' : 'text-slate-300'}`} />
                </div>
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              </div>

              <div className="mb-6">
                {price !== null ? (
                  <>
                    <span className="text-4xl font-bold text-white">€{price}</span>
                    <span className="text-slate-400 text-sm">/{annual ? 'año' : 'mes'}</span>
                    {annual && plan.monthly && (
                      <p className="text-xs text-emerald-400 mt-1">
                        Ahorra €{(plan.monthly * 12 - plan.annual!).toFixed(0)}/año
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white">A medida</span>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 line-through">
                    <span className="w-4 h-4 shrink-0 text-center text-slate-600">✕</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => isCurrent ? toast.info('Ya tienes este plan') : toast.success(`Actualizando a ${plan.name}...`)}
                className={[
                  'w-full py-3 rounded-xl font-semibold text-sm transition',
                  isCurrent
                    ? 'bg-slate-700 text-slate-400 cursor-default'
                    : plan.popular
                      ? 'bg-sky-500 hover:bg-sky-400 text-white'
                      : 'border border-slate-600 hover:border-sky-500 text-slate-300 hover:text-white',
                ].join(' ')}
              >
                {isCurrent ? 'Plan actual' : plan.monthly ? 'Actualizar' : 'Contactar ventas'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
