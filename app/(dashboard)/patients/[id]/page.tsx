'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Briefcase, FileText, MessageSquare, Plus, Clock } from 'lucide-react'

const PATIENT = {
  id: '1', name: 'María González Ruiz', age: 34, clinic: 'Clínica Dental Norte',
  doctor: 'Dr. García López', phone: '+34 612 345 678', email: 'maria@email.com',
  address: 'Calle Mayor 12, Madrid', allergies: 'Penicilina', medications: 'Ibuprofeno 400mg',
  nextAppointment: '2026-05-10 11:00',
  stats: { total: 5, active: 2, completed: 3 },
}

const HISTORY = [
  { date: '2026-04-28', event: 'Prueba de metal prótesis superior', type: 'clinical', icon: '🦷' },
  { date: '2026-04-22', event: 'Toma de impresiones digitales (iTero)', type: 'clinical', icon: '📷' },
  { date: '2026-03-15', event: 'Consulta inicial — plan de tratamiento completo', type: 'clinical', icon: '📋' },
  { date: '2026-02-10', event: 'Radiografía panorámica', type: 'diagnostic', icon: '🔬' },
  { date: '2026-01-05', event: 'Primera visita — diagnóstico caries múltiple', type: 'clinical', icon: '🏥' },
]

const CASES = [
  { id: '1', title: 'Prótesis superior completa', status: 'En Producción', type: 'Prótesis', date: '2026-04-22' },
  { id: '2', title: 'Retenedor Essix inferior',   status: 'Completado',    type: 'Retenedor', date: '2026-03-01' },
]

const STATUS_COLORS: Record<string, string> = {
  'En Producción': 'bg-sky-500/15 text-sky-400',
  'Completado':    'bg-emerald-500/15 text-emerald-400',
  'En Diseño':     'bg-violet-500/15 text-violet-400',
  'Nuevo':         'bg-amber-500/15 text-amber-400',
}

export default function PatientDetailPage() {
  const [tab, setTab] = useState<'historial' | 'casos' | 'documentos' | 'notas'>('historial')

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xl font-bold shrink-0">
            {PATIENT.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{PATIENT.name}</h1>
            <p className="text-slate-400 text-sm">{PATIENT.age} años · {PATIENT.clinic}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{PATIENT.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{PATIENT.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{PATIENT.address}</span>
            </div>
          </div>
          {PATIENT.nextAppointment && (
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-xs text-sky-400 font-medium mb-0.5">Próxima cita</p>
              <p className="text-white text-sm font-bold">{PATIENT.nextAppointment}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Casos totales',   value: PATIENT.stats.total,     color: 'text-white' },
          { label: 'Casos activos',   value: PATIENT.stats.active,    color: 'text-sky-400' },
          { label: 'Completados',     value: PATIENT.stats.completed, color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
        {(['historial', 'casos', 'documentos', 'notas'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={['px-4 py-2 rounded-lg text-sm font-medium transition capitalize', tab === t ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'].join(' ')}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'historial' && (
        <div className="space-y-3">
          {HISTORY.map((h, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-base shrink-0">
                  {h.icon}
                </div>
                {i < HISTORY.length - 1 && <div className="w-px h-6 bg-slate-700 mt-2" />}
              </div>
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{h.event}</p>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />{h.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'casos' && (
        <div className="space-y-3">
          {CASES.map((c) => (
            <Link key={c.id} href={`/cases/${c.id}`} className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-sky-500/40 transition">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center"><Briefcase className="w-5 h-5 text-slate-400" /></div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{c.title}</p>
                <p className="text-xs text-slate-500">{c.type} · {c.date}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status] ?? 'bg-slate-700 text-slate-300'}`}>{c.status}</span>
            </Link>
          ))}
        </div>
      )}

      {tab === 'documentos' && (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Sin documentos adjuntos</p>
        </div>
      )}

      {tab === 'notas' && (
        <div className="text-center py-12 text-slate-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Sin notas clínicas</p>
        </div>
      )}

      {/* Floating button */}
      <Link href="/cases/new" className="fixed bottom-6 right-6 flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-3 rounded-full shadow-lg shadow-sky-500/25 transition z-50">
        <Plus className="w-5 h-5" /> Nuevo caso
      </Link>
    </div>
  )
}
