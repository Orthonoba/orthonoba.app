'use client'
import type { Metadata } from 'next'
import { useState } from 'react'
import { Calendar, Plus, Clock, User, Building2, Check, X, Phone } from 'lucide-react'
import { toast } from 'sonner'

const APPOINTMENTS = [
  { id: '1', patient: 'María González',  doctor: 'Dr. García',   clinic: 'Clínica Norte',  time: '09:00', date: '2026-05-05', type: 'Consulta inicial',    status: 'confirmed', phone: '+34 612 001 002' },
  { id: '2', patient: 'Carlos Martínez', doctor: 'Dra. Rodríguez', clinic: 'OrthoSmile',  time: '10:30', date: '2026-05-05', type: 'Revisión ortodoncia',  status: 'pending',   phone: '+34 623 003 004' },
  { id: '3', patient: 'Ana Fernández',   doctor: 'Dr. Martínez', clinic: 'Dental Norte',  time: '11:00', date: '2026-05-05', type: 'Impresiones CAD',     status: 'confirmed', phone: '+34 634 005 006' },
  { id: '4', patient: 'José Ramírez',    doctor: 'Dr. García',   clinic: 'Clínica Norte',  time: '12:00', date: '2026-05-05', type: 'Colocación prótesis', status: 'confirmed', phone: '+34 645 007 008' },
  { id: '5', patient: 'Laura Sánchez',   doctor: 'Dra. Fernández', clinic: 'Sonrisa',    time: '16:00', date: '2026-05-06', type: 'Consulta implante',   status: 'pending',   phone: '+34 656 009 010' },
  { id: '6', patient: 'Pedro Jiménez',   doctor: 'Dra. Rodríguez', clinic: 'OrthoSmile', time: '17:30', date: '2026-05-06', type: 'Ajuste retenedor',    status: 'cancelled', phone: '+34 667 011 012' },
]

const STATUS_COLORS = {
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  pending:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
}
const STATUS_LABELS = { confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada' }

const DAYS = ['Lunes 5', 'Martes 6', 'Miércoles 7', 'Jueves 8', 'Viernes 9']

export default function AppointmentsPage() {
  const [selectedDay, setSelectedDay] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Citas</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestión de agenda clínica · Semana del 5 al 9 de mayo 2026</p>
        </div>
        <button onClick={() => toast.info('Nueva cita')} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <Plus className="w-4 h-4" /> Nueva cita
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Hoy', value: APPOINTMENTS.filter((a) => a.date === '2026-05-05').length, color: 'text-sky-400' },
          { label: 'Esta semana', value: APPOINTMENTS.length, color: 'text-emerald-400' },
          { label: 'Pendientes confirmación', value: APPOINTMENTS.filter((a) => a.status === 'pending').length, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto">
        {DAYS.map((d, i) => (
          <button key={d} onClick={() => setSelectedDay(i)}
            className={['px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap', selectedDay === i ? 'bg-sky-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'].join(' ')}>
            {d}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      <div className="space-y-3">
        {APPOINTMENTS.filter((a) => a.date === (selectedDay === 0 ? '2026-05-05' : '2026-05-06')).map((apt) => (
          <div key={apt.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-wrap gap-4 items-start hover:border-slate-600 transition">
            <div className="flex items-center gap-2 shrink-0 w-16">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-bold text-white">{apt.time}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white">{apt.patient}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[apt.status as keyof typeof STATUS_COLORS]}`}>
                  {STATUS_LABELS[apt.status as keyof typeof STATUS_LABELS]}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{apt.doctor}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{apt.clinic}</span>
                <span>{apt.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`tel:${apt.phone}`} className="p-2 text-slate-400 hover:text-sky-400 border border-slate-700 hover:border-sky-500/40 rounded-lg transition">
                <Phone className="w-4 h-4" />
              </a>
              {apt.status === 'pending' && (
                <>
                  <button onClick={() => toast.success('Cita confirmada')} className="p-2 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg transition">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => toast.warning('Cita cancelada')} className="p-2 text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
