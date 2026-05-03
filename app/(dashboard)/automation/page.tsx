'use client'

import { useState } from 'react'
import { Bell, Mail, MessageSquare, GitBranch, Settings, CheckCircle2, XCircle, Clock, TrendingUp, Send } from 'lucide-react'

const AUTOMATION_TYPES = [
  { id: 'reminders', label: 'Recordatorios', icon: Bell, activeCount: 14, color: 'sky', description: 'Citas y seguimientos automáticos' },
  { id: 'emails', label: 'Emails', icon: Mail, activeCount: 8, color: 'violet', description: 'Campañas y correos transaccionales' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, activeCount: 5, color: 'emerald', description: 'Mensajes via Meta Business API' },
  { id: 'rules', label: 'Reglas', icon: GitBranch, activeCount: 11, color: 'amber', description: 'Automatizaciones condicionales' },
]

const EXECUTIONS = [
  { id: 1, type: 'WhatsApp', description: 'Recordatorio cita — María González', time: 'hace 5 min', status: 'success' },
  { id: 2, type: 'Email', description: 'Bienvenida nuevo paciente — Pedro Martínez', time: 'hace 12 min', status: 'success' },
  { id: 3, type: 'Regla', description: 'Lead calificado → asignar dentista', time: 'hace 28 min', status: 'success' },
  { id: 4, type: 'WhatsApp', description: 'Seguimiento post-tratamiento — Laura Sánchez', time: 'hace 45 min', status: 'failed' },
  { id: 5, type: 'Recordatorio', description: 'Cita ortodoncia — Carlos López', time: 'hace 1h', status: 'success' },
  { id: 6, type: 'Email', description: 'Factura enviada — Clínica Sonrisa', time: 'hace 1h 15min', status: 'success' },
  { id: 7, type: 'Regla', description: 'Orden entregada → solicitar reseña', time: 'hace 2h', status: 'success' },
  { id: 8, type: 'WhatsApp', description: 'Promoción verano — 124 contactos', time: 'hace 2h 30min', status: 'success' },
  { id: 9, type: 'Recordatorio', description: 'Revisión implante — Ana Fernández', time: 'hace 3h', status: 'failed' },
  { id: 10, type: 'Email', description: 'Reactivación — 35 pacientes inactivos', time: 'hace 4h', status: 'success' },
]

const COLOR_MAP: Record<string, string> = {
  sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

const ICON_COLORS: Record<string, string> = {
  sky: 'bg-sky-500/20 text-sky-400',
  violet: 'bg-violet-500/20 text-violet-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
}

export default function AutomationPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    reminders: true, emails: true, whatsapp: true, rules: false,
  })

  function toggle(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const successCount = EXECUTIONS.filter((e) => e.status === 'success').length
  const successRate = Math.round((successCount / EXECUTIONS.length) * 100)

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Centro de Automatización</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestiona todas tus automatizaciones desde un solo lugar</p>
        </div>
        <a href="/automation/rules" className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + Nueva regla
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mensajes hoy', value: '247', icon: Send, color: 'text-sky-400' },
          { label: 'Tasa de éxito', value: `${successRate}%`, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Automatizaciones activas', value: '38', icon: GitBranch, color: 'text-violet-400' },
          { label: 'Ahorro estimado', value: '4.2h/día', icon: TrendingUp, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Automation type cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {AUTOMATION_TYPES.map(({ id, label, icon: Icon, activeCount, color, description }) => (
          <div key={id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${ICON_COLORS[color]} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              {/* Toggle */}
              <button
                onClick={() => toggle(id)}
                className={`relative w-11 h-6 rounded-full transition-colors ${toggles[id] ? 'bg-sky-500' : 'bg-slate-600'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${toggles[id] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div>
              <div className="font-semibold text-white">{label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{description}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${COLOR_MAP[color]}`}>
                {activeCount} activos
              </span>
              <a
                href={`/automation/${id}`}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
              >
                <Settings className="w-3.5 h-3.5" /> Configurar
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Execution log */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Registro de ejecuciones
          </h2>
          <span className="text-xs text-slate-400">Últimas 10 ejecuciones</span>
        </div>
        <div className="divide-y divide-slate-700/50">
          {EXECUTIONS.map((exec) => (
            <div key={exec.id} className="flex items-center gap-4 px-5 py-3.5">
              {exec.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{exec.description}</div>
                <div className="text-xs text-slate-500 mt-0.5">{exec.type}</div>
              </div>
              <div className="text-xs text-slate-500 flex-shrink-0">{exec.time}</div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  exec.status === 'success'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }`}
              >
                {exec.status === 'success' ? 'Exitoso' : 'Fallido'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
