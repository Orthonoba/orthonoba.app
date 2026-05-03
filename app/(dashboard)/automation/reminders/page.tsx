'use client'

import { useState } from 'react'
import { Bell, Mail, MessageSquare, Phone, Calendar, Plus } from 'lucide-react'

type Channel = 'email' | 'whatsapp' | 'sms'

interface Reminder {
  id: string
  patient: string
  type: string
  date: string
  time: string
  channel: Channel
  active: boolean
  dayOfWeek: number
}

const INITIAL_REMINDERS: Reminder[] = [
  { id: '1', patient: 'María González', type: 'Revisión ortodoncia', date: '05 May 2026', time: '10:00', channel: 'whatsapp', active: true, dayOfWeek: 1 },
  { id: '2', patient: 'Pedro Martínez', type: 'Implante — seguimiento', date: '06 May 2026', time: '11:30', channel: 'email', active: true, dayOfWeek: 2 },
  { id: '3', patient: 'Laura Sánchez', type: 'Blanqueamiento dental', date: '06 May 2026', time: '16:00', channel: 'sms', active: false, dayOfWeek: 2 },
  { id: '4', patient: 'Carlos López', type: 'Extracción muela del juicio', date: '07 May 2026', time: '09:00', channel: 'whatsapp', active: true, dayOfWeek: 3 },
  { id: '5', patient: 'Ana Fernández', type: 'Revisión periódica', date: '07 May 2026', time: '12:00', channel: 'email', active: true, dayOfWeek: 3 },
  { id: '6', patient: 'Roberto García', type: 'Prótesis — ajuste', date: '07 May 2026', time: '15:00', channel: 'whatsapp', active: false, dayOfWeek: 3 },
  { id: '7', patient: 'Isabel Moreno', type: 'Curetaje periodontal', date: '08 May 2026', time: '10:30', channel: 'email', active: true, dayOfWeek: 4 },
  { id: '8', patient: 'Miguel Torres', type: 'Ortodoncia — mensual', date: '08 May 2026', time: '14:00', channel: 'sms', active: true, dayOfWeek: 4 },
  { id: '9', patient: 'Carmen Ruiz', type: 'Endodoncia — control', date: '09 May 2026', time: '09:30', channel: 'whatsapp', active: true, dayOfWeek: 5 },
  { id: '10', patient: 'Javier Díaz', type: 'Revisión anual', date: '09 May 2026', time: '17:00', channel: 'email', active: false, dayOfWeek: 5 },
]

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DAY_DATES = ['04', '05', '06', '07', '08', '09', '10']

const CHANNEL_CONFIG: Record<Channel, { icon: typeof Mail; label: string; color: string }> = {
  email: { icon: Mail, label: 'Email', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  whatsapp: { icon: MessageSquare, label: 'WhatsApp', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  sms: { icon: Phone, label: 'SMS', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
}

function ChannelBadge({ channel }: { channel: Channel }) {
  const { icon: Icon, label, color } = CHANNEL_CONFIG[channel]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  )
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  function toggleReminder(id: string) {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  const filteredReminders = selectedDay !== null
    ? reminders.filter((r) => r.dayOfWeek === selectedDay + 1)
    : reminders

  const remindersByDay = (dayIdx: number) => reminders.filter((r) => r.dayOfWeek === dayIdx + 1)

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recordatorios</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestiona los recordatorios automáticos para tus pacientes</p>
        </div>
        <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" /> Nuevo recordatorio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total recordatorios', value: reminders.length, color: 'text-white' },
          { label: 'Activos', value: reminders.filter((r) => r.active).length, color: 'text-emerald-400' },
          { label: 'Por WhatsApp', value: reminders.filter((r) => r.channel === 'whatsapp').length, color: 'text-emerald-400' },
          { label: 'Por Email', value: reminders.filter((r) => r.channel === 'email').length, color: 'text-sky-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Weekly calendar */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-sky-400" />
          <h2 className="font-semibold text-white">Semana del 4 — 10 de Mayo 2026</h2>
          <button
            onClick={() => setSelectedDay(null)}
            className={`ml-auto text-xs px-2.5 py-1 rounded-lg transition ${selectedDay === null ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Todos
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, idx) => {
            const count = remindersByDay(idx).length
            const isSelected = selectedDay === idx
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : idx)}
                className={`rounded-xl p-2 text-center transition ${isSelected ? 'bg-sky-500 border border-sky-400' : 'bg-slate-900 border border-slate-700 hover:border-slate-600'}`}
              >
                <div className={`text-xs font-medium ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>{day}</div>
                <div className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-white'}`}>{DAY_DATES[idx]}</div>
                {count > 0 && (
                  <div className={`mt-1 text-xs font-semibold ${isSelected ? 'text-sky-200' : 'text-sky-400'}`}>
                    {count}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Reminders list */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">
            {selectedDay !== null ? `${DAYS[selectedDay]} ${DAY_DATES[selectedDay]} de Mayo` : 'Todos los recordatorios'}
            <span className="ml-2 text-sm text-slate-400 font-normal">({filteredReminders.length})</span>
          </h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {filteredReminders.map((reminder) => (
            <div key={reminder.id} className={`flex items-center gap-4 px-5 py-3.5 transition ${!reminder.active ? 'opacity-50' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {reminder.patient.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{reminder.patient}</div>
                <div className="text-xs text-slate-400 mt-0.5">{reminder.type}</div>
              </div>
              <div className="text-xs text-slate-400 flex-shrink-0">
                {reminder.date} · {reminder.time}
              </div>
              <ChannelBadge channel={reminder.channel} />
              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${reminder.active ? 'bg-sky-500' : 'bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${reminder.active ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
