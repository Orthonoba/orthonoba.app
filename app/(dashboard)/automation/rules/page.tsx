'use client'

import { useState } from 'react'
import { Plus, GitBranch, Play, Pause, Edit2, Trash2, ChevronDown, Clock, CheckCircle2, XCircle } from 'lucide-react'

const TRIGGERS = [
  'Nuevo lead creado',
  'Paciente programó cita',
  'Cita confirmada',
  'Cita cancelada',
  'Orden creada',
  'Orden entregada',
  'Factura generada',
  'Factura pagada',
  'Paciente inactivo > 30 días',
  'Lead sin contactar > 24h',
]

const ACTIONS = [
  'Enviar email de bienvenida',
  'Enviar WhatsApp recordatorio',
  'Asignar a dentista disponible',
  'Crear tarea de seguimiento',
  'Actualizar estado del lead',
  'Enviar factura por email',
  'Notificar al equipo',
  'Programar recordatorio 24h',
  'Marcar lead como urgente',
  'Enviar cuestionario de satisfacción',
]

const RULES = [
  { id: '1', name: 'Bienvenida nuevos pacientes', trigger: 'Nuevo lead creado', action: 'Enviar email de bienvenida', status: 'active', lastRun: 'hace 2h', executions: 124 },
  { id: '2', name: 'Recordatorio de cita 24h', trigger: 'Cita confirmada', action: 'Enviar WhatsApp recordatorio', status: 'active', lastRun: 'hace 30min', executions: 456 },
  { id: '3', name: 'Follow-up post entrega', trigger: 'Orden entregada', action: 'Enviar cuestionario de satisfacción', status: 'active', lastRun: 'hace 4h', executions: 89 },
  { id: '4', name: 'Lead sin contactar', trigger: 'Lead sin contactar > 24h', action: 'Notificar al equipo', status: 'paused', lastRun: 'hace 1 día', executions: 34 },
  { id: '5', name: 'Asignación automática', trigger: 'Nueva orden creada', action: 'Asignar a dentista disponible', status: 'active', lastRun: 'hace 1h', executions: 211 },
  { id: '6', name: 'Reactivación inactivos', trigger: 'Paciente inactivo > 30 días', action: 'Programar recordatorio 24h', status: 'paused', lastRun: 'hace 3 días', executions: 18 },
]

export default function AutomationRulesPage() {
  const [rules, setRules] = useState(RULES)
  const [showEditor, setShowEditor] = useState(false)
  const [newTrigger, setNewTrigger] = useState(TRIGGERS[0])
  const [newAction, setNewAction] = useState(ACTIONS[0])
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleStatus(id: string) {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r))
  }

  function deleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  async function saveRule() {
    if (!newName.trim()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    const newRule = {
      id: Date.now().toString(),
      name: newName,
      trigger: newTrigger,
      action: newAction,
      status: 'active',
      lastRun: 'nunca',
      executions: 0,
    }
    setRules((prev) => [newRule, ...prev])
    setNewName('')
    setSaving(false)
    setShowEditor(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reglas de Automatización</h1>
          <p className="text-slate-400 text-sm mt-0.5">Define condiciones y acciones automáticas para tu clínica</p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Nueva regla
        </button>
      </div>

      {/* Visual Rule Editor */}
      {showEditor && (
        <div className="bg-slate-800 border border-sky-500/30 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-400" /> Editor de regla
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de la regla</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Recordatorio automático de cita"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="flex-1">
              <div className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center font-bold">SI</span>
                Condición (Trigger)
              </div>
              <div className="relative">
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="w-full appearance-none bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 pr-8"
                >
                  {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="text-2xl text-slate-500 font-bold hidden md:block mt-5">→</div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">ENTONCES</span>
                Acción
              </div>
              <div className="relative">
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full appearance-none bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 pr-8"
                >
                  {ACTIONS.map((a) => <option key={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-sm text-slate-400 border border-slate-700">
            <span className="text-white font-medium">Vista previa: </span>
            Cuando &ldquo;<span className="text-sky-300">{newTrigger}</span>&rdquo;, ejecutar &ldquo;<span className="text-emerald-300">{newAction}</span>&rdquo;
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancelar</button>
            <button
              onClick={saveRule}
              disabled={saving || !newName.trim()}
              className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
            >
              {saving ? 'Guardando...' : 'Crear regla'}
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold text-white">Reglas configuradas ({rules.length})</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-700/20 transition">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${rule.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{rule.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  <span className="text-sky-400">{rule.trigger}</span>
                  <span className="text-slate-600 mx-1.5">→</span>
                  <span className="text-emerald-400">{rule.action}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 flex-shrink-0 hidden md:flex items-center gap-1">
                <Clock className="w-3 h-3" /> {rule.lastRun}
              </div>
              <div className="text-xs text-slate-500 flex-shrink-0 hidden md:block">{rule.executions} ejecuciones</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${
                rule.status === 'active'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-700 text-slate-400 border-slate-600'
              }`}>
                {rule.status === 'active' ? 'Activa' : 'Pausada'}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleStatus(rule.id)} className="p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-700" title="Pausar/Activar">
                  {rule.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1.5 text-slate-400 hover:text-sky-400 transition rounded-lg hover:bg-slate-700">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition rounded-lg hover:bg-slate-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reglas activas', value: rules.filter((r) => r.status === 'active').length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Reglas pausadas', value: rules.filter((r) => r.status === 'paused').length, icon: XCircle, color: 'text-slate-400' },
          { label: 'Total ejecuciones', value: rules.reduce((acc, r) => acc + r.executions, 0), icon: GitBranch, color: 'text-sky-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <Icon className={`w-4 h-4 ${color} mb-1`} />
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
