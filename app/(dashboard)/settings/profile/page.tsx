'use client'
import { useState } from 'react'
import { Camera, Save } from 'lucide-react'
import { toast } from 'sonner'

const TIMEZONES = ['Europe/Madrid', 'America/Mexico_City', 'America/Buenos_Aires', 'America/Bogota', 'America/Santiago']
const LANGUAGES = [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }, { value: 'pt', label: 'Português' }]

const INPUT = "w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: 'Jose', lastName: 'Greorio', email: 'jose@orthonoba.app',
    phone: '+34 612 345 678', cargo: 'Director Clínico', bio: '',
    language: 'es', timezone: 'Europe/Madrid',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success('Perfil actualizado correctamente')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
        <p className="text-slate-400 text-sm mt-0.5">Actualiza tus datos personales y preferencias</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-sky-500 hover:bg-sky-400 rounded-lg flex items-center justify-center cursor-pointer transition shadow-lg">
            <input type="file" accept="image/*" className="sr-only" onChange={() => toast.success('Avatar actualizado')} />
            <Camera className="w-3.5 h-3.5 text-white" />
          </label>
        </div>
        <div>
          <p className="text-white font-semibold">{form.firstName} {form.lastName}</p>
          <p className="text-slate-400 text-sm">{form.email}</p>
          <p className="text-xs text-slate-500 mt-0.5">JPG, PNG o GIF. Máx. 2 MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Datos personales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nombre</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Apellidos</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={INPUT} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Teléfono</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Cargo</label>
              <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className={INPUT} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Biografía</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Una breve descripción sobre ti..." className={INPUT + ' resize-none'} />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Preferencias</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Idioma</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={INPUT}>
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Zona horaria</label>
              <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className={INPUT}>
                {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
            <Save className="w-4 h-4" /> Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}
