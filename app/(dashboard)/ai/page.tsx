'use client'
import { useState } from 'react'
import { Brain, Target, BarChart2, TrendingUp, AlertTriangle, Zap, Clock, Info } from 'lucide-react'
import { toast } from 'sonner'

const MODULES = [
  {
    id: 'qualify',
    title: 'Calificación de Leads',
    icon: Target,
    color: 'sky',
    description: 'Califica leads automáticamente con IA asignando score 0-100 y grado A/B/C/D según probabilidad de conversión.',
    endpoint: '/api/v1/ai/leads/qualify',
    lastRun: '2026-05-04 08:30',
    processed: 24,
  },
  {
    id: 'crm',
    title: 'Insights CRM',
    icon: BarChart2,
    color: 'violet',
    description: 'Genera un reporte de inteligencia CRM con análisis de comportamiento de pacientes, patrones de retención y oportunidades de upsell.',
    endpoint: '/api/v1/ai/crm/insights',
    lastRun: '2026-05-04 07:00',
    processed: 89,
  },
  {
    id: 'predict',
    title: 'Predicción de Órdenes',
    icon: TrendingUp,
    color: 'emerald',
    description: 'Predice los próximos tratamientos que probablemente necesitarán los pacientes activos basándose en su historial clínico.',
    endpoint: '/api/v1/ai/orders/predict',
    lastRun: '2026-05-03 18:45',
    processed: 156,
  },
  {
    id: 'retention',
    title: 'Riesgo de Retención',
    icon: AlertTriangle,
    color: 'amber',
    description: 'Identifica pacientes en riesgo de abandono (churn) y sugiere acciones preventivas personalizadas de retención.',
    endpoint: '/api/v1/ai/retention/risks',
    lastRun: '2026-05-03 12:00',
    processed: 43,
  },
]

const MOCK_RESULTS = {
  qualify: [
    { name: 'Roberto Silva',   score: 92, grade: 'A', action: 'Llamar en 24h — alto potencial Invisalign' },
    { name: 'Carmen Vázquez',  score: 78, grade: 'B', action: 'Enviar presupuesto personalizado' },
    { name: 'Luis Fernández',  score: 61, grade: 'B', action: 'Seguimiento por WhatsApp' },
    { name: 'Marta Jiménez',   score: 45, grade: 'C', action: 'Nurturing campaign — re-contactar en 7 días' },
  ],
  crm: [
    { name: 'Segmento A',  score: 0, grade: '', action: '34 pacientes premium con LTV >€5.000 — candidatos cross-sell' },
    { name: 'Segmento B',  score: 0, grade: '', action: '18 pacientes con tratamiento completado — candidatos mantenimiento' },
    { name: 'Tendencia',   score: 0, grade: '', action: 'Incremento 12% en tratamientos de ortodoncia vs mes anterior' },
  ],
  predict: [
    { name: 'María González',   score: 87, grade: 'A', action: 'Probable retenedor Essix post-ortodoncia en 45 días' },
    { name: 'Carlos Martínez',  score: 73, grade: 'B', action: 'Revisión periodoncia estimada en 2-3 meses' },
    { name: 'Ana Fernández',    score: 68, grade: 'B', action: 'Corona de porcelana molar 26 — probable en 60 días' },
  ],
  retention: [
    { name: 'Roberto Alonso',  score: 78, grade: 'A', action: 'ALTO RIESGO — Sin visita 8 meses, llamar urgente' },
    { name: 'Francisco Torres', score: 62, grade: 'B', action: 'RIESGO MEDIO — Enviar oferta revisión gratuita' },
    { name: 'Carmen López',    score: 41, grade: 'C', action: 'RIESGO BAJO — Incluir en próxima newsletter' },
  ],
}

const MODULE_COLORS: Record<string, string> = {
  sky:    'border-sky-500/30 bg-sky-500/5',
  violet: 'border-violet-500/30 bg-violet-500/5',
  emerald:'border-emerald-500/30 bg-emerald-500/5',
  amber:  'border-amber-500/30 bg-amber-500/5',
}
const ICON_COLORS: Record<string, string> = {
  sky: 'text-sky-400 bg-sky-500/15', violet: 'text-violet-400 bg-violet-500/15',
  emerald: 'text-emerald-400 bg-emerald-500/15', amber: 'text-amber-400 bg-amber-500/15',
}
const GRADE_COLORS: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-400', B: 'bg-sky-500/20 text-sky-400',
  C: 'bg-amber-500/20 text-amber-400', D: 'bg-red-500/20 text-red-400',
}

export default function AIPage() {
  const [running, setRunning] = useState<string | null>(null)
  const [results, setResults] = useState<string | null>(null)

  async function runAnalysis(moduleId: string) {
    setRunning(moduleId)
    await new Promise((r) => setTimeout(r, 1800))
    setRunning(null)
    setResults(moduleId)
    toast.success('Análisis completado', { description: 'Resultados disponibles a continuación' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6 text-sky-400" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Centro de Inteligencia Artificial</h1>
            <span className="bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs font-bold px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">Motor IA para calificación, predicción y análisis de retención de pacientes</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MODULES.map((mod) => (
          <div key={mod.id} className={`border rounded-xl p-5 ${MODULE_COLORS[mod.color]}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ICON_COLORS[mod.color]}`}>
                <mod.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{mod.title}</h3>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{mod.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />Última ejecución: {mod.lastRun}</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" />{mod.processed} procesados</span>
            </div>

            <button
              onClick={() => runAnalysis(mod.id)}
              disabled={running === mod.id}
              className={[
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition',
                running === mod.id
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-white',
              ].join(' ')}
            >
              {running === mod.id ? (
                <><span className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-400 rounded-full animate-spin" />Analizando...</>
              ) : (
                <><Brain className="w-4 h-4" />Ejecutar análisis</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Results */}
      {results && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Resultados: {MODULES.find((m) => m.id === results)?.title}
          </h2>
          <div className="space-y-2">
            {(MOCK_RESULTS[results as keyof typeof MOCK_RESULTS] ?? []).map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                {r.grade && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${GRADE_COLORS[r.grade] ?? 'bg-slate-700 text-slate-400'}`}>{r.grade}</span>
                )}
                {r.score > 0 && (
                  <span className="text-xs font-bold text-sky-400 shrink-0 mt-0.5 w-8 text-center">{r.score}</span>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{r.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/70 leading-relaxed">
          <strong className="text-amber-400">Aviso importante:</strong> La IA de Orthonoba es una herramienta de apoyo a la toma de decisiones clínicas. Sus análisis y predicciones no constituyen diagnóstico médico ni reemplazan el criterio profesional del dentista. Siempre consulte con su equipo clínico antes de tomar decisiones basadas en estos resultados.
        </p>
      </div>
    </div>
  )
}
