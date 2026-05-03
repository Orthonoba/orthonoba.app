'use client'

import { useState } from 'react'
import { Building2, User, Clock, ChevronRight, ChevronLeft, Check, Upload, Plus, X, MapPin, Phone, Mail, Globe } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Información', icon: Building2 },
  { id: 2, label: 'Logo & Horario', icon: Clock },
  { id: 3, label: 'Invitar Usuarios', icon: User },
]

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

interface FormData {
  name: string
  rut: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  schedule: Record<string, { open: boolean; from: string; to: string }>
  invites: string[]
}

const defaultSchedule = DAYS.reduce((acc, day) => {
  acc[day] = { open: day !== 'Domingo', from: '09:00', to: '18:00' }
  return acc
}, {} as Record<string, { open: boolean; from: string; to: string }>)

export default function NewClinicPage() {
  const [step, setStep] = useState(1)
  const [inviteEmail, setInviteEmail] = useState('')
  const [form, setForm] = useState<FormData>({
    name: '',
    rut: '',
    address: '',
    city: '',
    country: 'Chile',
    phone: '',
    email: '',
    website: '',
    schedule: defaultSchedule,
    invites: [],
  })

  const updateField = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const toggleDay = (day: string) =>
    setForm((f) => ({
      ...f,
      schedule: { ...f.schedule, [day]: { ...f.schedule[day], open: !f.schedule[day].open } },
    }))

  const updateTime = (day: string, key: 'from' | 'to', value: string) =>
    setForm((f) => ({
      ...f,
      schedule: { ...f.schedule, [day]: { ...f.schedule[day], [key]: value } },
    }))

  const addInvite = () => {
    if (inviteEmail && !form.invites.includes(inviteEmail)) {
      setForm((f) => ({ ...f, invites: [...f.invites, inviteEmail] }))
      setInviteEmail('')
    }
  }

  const removeInvite = (email: string) =>
    setForm((f) => ({ ...f, invites: f.invites.filter((e) => e !== email) }))

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Nueva Clínica</h1>
          <p className="text-slate-400 mt-1">Completa los pasos para registrar una nueva clínica en la plataforma</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step > s.id
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : step === s.id
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-1 font-medium ${step === s.id ? 'text-sky-400' : step > s.id ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-12px] ${step > s.id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-white mb-4">Información de la Clínica</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Nombre de la Clínica *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Clínica Dental Santiago"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">RUT / NIF *</label>
                      <input
                        type="text"
                        value={form.rut}
                        onChange={(e) => updateField('rut', e.target.value)}
                        placeholder="76.123.456-7"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-1">Dirección *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          placeholder="Av. Providencia 1234, Oficina 502"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Ciudad *</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Santiago"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">País *</label>
                      <select
                        value={form.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                      >
                        <option>Chile</option>
                        <option>España</option>
                        <option>México</option>
                        <option>Argentina</option>
                        <option>Colombia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="+56 9 1234 5678"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="contacto@clinica.cl"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-1">Sitio Web</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="url"
                          value={form.website}
                          onChange={(e) => updateField('website', e.target.value)}
                          placeholder="https://www.clinicadental.cl"
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Logo & Horario de Atención</h2>
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Logo de la Clínica</label>
                    <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-sky-500 transition cursor-pointer">
                      <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white">Arrastra tu logo aquí</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG o SVG · máx. 2 MB</p>
                      </div>
                      <button className="text-sm text-sky-400 hover:text-sky-300 font-medium">Seleccionar archivo</button>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Horario de Atención</label>
                    <div className="space-y-2">
                      {DAYS.map((day) => (
                        <div key={day} className="flex items-center gap-3 p-2.5 bg-slate-900 rounded-lg">
                          <button
                            onClick={() => toggleDay(day)}
                            className={`w-10 h-5 rounded-full transition-all relative ${form.schedule[day].open ? 'bg-sky-500' : 'bg-slate-700'}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.schedule[day].open ? 'left-5' : 'left-0.5'}`}
                            />
                          </button>
                          <span className={`text-sm w-20 font-medium ${form.schedule[day].open ? 'text-white' : 'text-slate-500'}`}>{day}</span>
                          {form.schedule[day].open ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="time"
                                value={form.schedule[day].from}
                                onChange={(e) => updateTime(day, 'from', e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-sky-500"
                              />
                              <span className="text-slate-500 text-sm">—</span>
                              <input
                                type="time"
                                value={form.schedule[day].to}
                                onChange={(e) => updateTime(day, 'to', e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-sky-500"
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500 flex-1">Cerrado</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-white mb-4">Invitar Usuarios</h2>
                  <p className="text-slate-400 text-sm">Agrega los emails de los profesionales que tendrán acceso a esta clínica.</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addInvite()}
                        placeholder="doctor@clinica.cl"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                      />
                    </div>
                    <button
                      onClick={addInvite}
                      className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2.5 rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" /> Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.invites.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm">No hay usuarios invitados aún</div>
                    )}
                    {form.invites.map((email) => (
                      <div key={email} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-sky-400" />
                          </div>
                          <span className="text-sm text-white">{email}</span>
                        </div>
                        <button onClick={() => removeInvite(email)} className="text-slate-500 hover:text-red-400 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                {step < 3 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(3, s + 1))}
                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-medium px-5 py-2.5 rounded-lg transition"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-6 py-2.5 rounded-lg transition">
                    <Check className="w-4 h-4" /> Crear Clínica
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sticky top-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Vista Previa</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{form.name || 'Nombre de clínica'}</p>
                    <p className="text-sm text-slate-400">{form.rut || 'RUT —'}</p>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <span className="text-slate-300">{form.address || '—'}{form.city ? `, ${form.city}` : ''}{form.country ? `, ${form.country}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-300">{form.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-300">{form.email || '—'}</span>
                  </div>
                  {form.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-sky-400">{form.website}</span>
                    </div>
                  )}
                </div>
                {step >= 2 && (
                  <div className="border-t border-slate-700 pt-3">
                    <p className="text-xs font-medium text-slate-400 mb-2">Horario activo</p>
                    <div className="space-y-1">
                      {DAYS.filter((d) => form.schedule[d].open).map((d) => (
                        <div key={d} className="flex justify-between text-xs text-slate-300">
                          <span>{d.slice(0, 3)}</span>
                          <span>{form.schedule[d].from} – {form.schedule[d].to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {step >= 3 && form.invites.length > 0 && (
                  <div className="border-t border-slate-700 pt-3">
                    <p className="text-xs font-medium text-slate-400 mb-2">Invitados ({form.invites.length})</p>
                    {form.invites.map((e) => (
                      <p key={e} className="text-xs text-slate-300 truncate">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
