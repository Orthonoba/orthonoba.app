'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Pencil, Printer, Trash2, ChevronRight, FileText, Package, StickyNote, Play, User, Calendar, Building2 } from 'lucide-react'

const MOCK_CASE = {
  id: 'C-003',
  patient: 'Ana Martínez',
  patientId: 'P-003',
  clinic: 'Clínica Dental Providencia',
  doctor: 'Dr. Carlos Paredes',
  type: 'Ortodoncia — Retenedor Essix',
  status: 'En Producción',
  priority: 'Alta',
  createdAt: '2026-04-15',
  dueDate: '2026-05-10',
  lab: 'Laboratorio Ortho Pro',
  specs: {
    Material: 'EVA 1.0mm',
    Arcada: 'Ambas',
    Recorte: 'Scalloped',
    Color: 'Transparente',
  },
  notes: 'Paciente con bruxismo leve. Reforzar zona de molares superiores. Entregar en estuche doble.',
}

const STATUS_TIMELINE = ['Nuevo', 'En Diseño', 'En Producción', 'Completado']

const STATUS_COLORS: Record<string, string> = {
  'Nuevo': 'bg-slate-700 text-slate-300',
  'En Diseño': 'bg-sky-500/20 text-sky-400',
  'En Producción': 'bg-amber-500/20 text-amber-400',
  'Completado': 'bg-emerald-500/20 text-emerald-400',
}

const TABS = ['Resumen', 'Archivos', 'Notas', 'Producción']

export default function CaseDetailPage() {
  const [activeTab, setActiveTab] = useState('Resumen')
  const [status, setStatus] = useState(MOCK_CASE.status)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const currentIdx = STATUS_TIMELINE.indexOf(status)

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Case Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded">{MOCK_CASE.id}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}>{status}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${MOCK_CASE.priority === 'Alta' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  Prioridad {MOCK_CASE.priority}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">{MOCK_CASE.patient}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{MOCK_CASE.type}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  <Play className="w-4 h-4" /> Cambiar Estado
                </button>
                {showStatusMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                    {STATUS_TIMELINE.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setStatus(s); setShowStatusMenu(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between ${s === status ? 'bg-sky-500/15 text-sky-400' : 'text-slate-300 hover:bg-slate-700'}`}
                      >
                        {s}
                        {s === status && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
                <Pencil className="w-4 h-4" /> Editar
              </button>
              <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <button className="flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-sm font-medium px-4 py-2.5 rounded-lg transition">
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 flex items-center gap-0">
            {STATUS_TIMELINE.map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${idx < currentIdx ? 'bg-emerald-500 border-emerald-500' : idx === currentIdx ? 'bg-sky-500 border-sky-500' : 'bg-slate-800 border-slate-700'}`}>
                    {idx < currentIdx ? <CheckCircle2 className="w-4 h-4 text-white" /> : idx === currentIdx ? <Clock className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-600" />}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${idx === currentIdx ? 'text-sky-400' : idx < currentIdx ? 'text-emerald-400' : 'text-slate-600'}`}>{s}</span>
                </div>
                {idx < STATUS_TIMELINE.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mt-[-12px] ${idx < currentIdx ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700">
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${activeTab === t ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Resumen' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-white border-b border-slate-700 pb-3">Información del Caso</h3>
              {[
                { icon: User, label: 'Paciente', value: MOCK_CASE.patient },
                { icon: Building2, label: 'Clínica', value: MOCK_CASE.clinic },
                { icon: User, label: 'Doctor', value: MOCK_CASE.doctor },
                { icon: Package, label: 'Laboratorio', value: MOCK_CASE.lab },
                { icon: Calendar, label: 'Creado', value: new Date(MOCK_CASE.createdAt).toLocaleDateString('es-CL') },
                { icon: Calendar, label: 'Entrega Estimada', value: new Date(MOCK_CASE.dueDate).toLocaleDateString('es-CL') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-medium text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="font-semibold text-white border-b border-slate-700 pb-3 mb-4">Especificaciones</h3>
                <dl className="space-y-2">
                  {Object.entries(MOCK_CASE.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-slate-700/40">
                      <dt className="text-sm text-slate-400">{k}</dt>
                      <dd className="text-sm font-medium text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="font-semibold text-white border-b border-slate-700 pb-3 mb-3">Notas del Doctor</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{MOCK_CASE.notes}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Archivos' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center py-12">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Ver archivos completos en la sección de archivos del caso</p>
            <a href={`/cases/${MOCK_CASE.id}/files`} className="inline-block mt-3 text-sky-400 hover:text-sky-300 text-sm font-medium">Ir a Archivos <ChevronRight className="inline w-4 h-4" /></a>
          </div>
        )}

        {activeTab === 'Notas' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center py-12">
            <StickyNote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Ver todas las notas del caso</p>
            <a href={`/cases/${MOCK_CASE.id}/notes`} className="inline-block mt-3 text-sky-400 hover:text-sky-300 text-sm font-medium">Ir a Notas <ChevronRight className="inline w-4 h-4" /></a>
          </div>
        )}

        {activeTab === 'Producción' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-5">Estado de Producción</h3>
            <div className="space-y-3">
              {[
                { label: 'Recepción de caso', done: true, date: '2026-04-15' },
                { label: 'Verificación de archivos STL', done: true, date: '2026-04-16' },
                { label: 'Diseño digital (CAD)', done: true, date: '2026-04-18' },
                { label: 'Impresión/fresado', done: false, date: null },
                { label: 'Control de calidad', done: false, date: null },
                { label: 'Acabado y pulido', done: false, date: null },
                { label: 'Envío a clínica', done: false, date: null },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${step.done ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-900 border border-slate-700'}`}>
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0" />
                  )}
                  <span className={`text-sm flex-1 ${step.done ? 'text-white' : 'text-slate-400'}`}>{step.label}</span>
                  {step.date && <span className="text-xs text-slate-500">{new Date(step.date).toLocaleDateString('es-CL')}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
