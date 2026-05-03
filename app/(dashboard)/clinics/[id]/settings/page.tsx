'use client'

import { useState } from 'react'
import { Save, AlertTriangle, Building2, Phone, Mail, MapPin, Globe } from 'lucide-react'

const INITIAL = {
  name: 'Clínica Dental Providencia',
  rut: '76.543.210-1',
  address: 'Av. Providencia 2345, Piso 3',
  city: 'Santiago',
  country: 'Chile',
  phone: '+56 2 2345 6789',
  email: 'contacto@dentalprov.cl',
  website: 'https://www.dentalprov.cl',
  timezone: 'America/Santiago',
  currency: 'CLP',
}

export default function ClinicSettingsPage() {
  const [form, setForm] = useState(INITIAL)
  const [saved, setSaved] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archiveText, setArchiveText] = useState('')

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleArchive = () => {
    if (archiveText === 'ARCHIVAR') {
      alert('Clínica archivada (mock)')
      setConfirmArchive(false)
      setArchiveText('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración de Clínica</h1>
          <p className="text-slate-400 text-sm mt-1">Edita la información y preferencias de la clínica</p>
        </div>

        {/* General Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
            <Building2 className="w-5 h-5 text-sky-400" />
            <h2 className="font-semibold text-white">Información General</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre *</label>
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">RUT / NIF *</label>
              <input
                value={form.rut}
                onChange={(e) => update('rut', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Dirección</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Ciudad</label>
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">País</label>
              <select
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option>Chile</option>
                <option>España</option>
                <option>México</option>
                <option>Argentina</option>
                <option>Colombia</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Sitio Web</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Zona Horaria</label>
              <select
                value={form.timezone}
                onChange={(e) => update('timezone', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value="America/Santiago">America/Santiago (UTC-3)</option>
                <option value="Europe/Madrid">Europe/Madrid (UTC+2)</option>
                <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
                <option value="America/Bogota">America/Bogota (UTC-5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Moneda</label>
              <select
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option>CLP</option>
                <option>EUR</option>
                <option>MXN</option>
                <option>USD</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 font-medium px-5 py-2.5 rounded-lg transition ${
              saved ? 'bg-emerald-500 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? '¡Guardado!' : 'Guardar Cambios'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-semibold text-red-400">Zona de Peligro</h2>
          </div>
          <div>
            <p className="text-sm text-slate-300 font-medium mb-1">Archivar Clínica</p>
            <p className="text-sm text-slate-500 mb-4">
              Al archivar la clínica, dejará de aparecer en la plataforma. Sus datos se conservarán pero no será accesible a usuarios. Esta acción puede revertirse contactando a soporte.
            </p>
            {!confirmArchive ? (
              <button
                onClick={() => setConfirmArchive(true)}
                className="flex items-center gap-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-medium px-4 py-2.5 rounded-lg transition"
              >
                <AlertTriangle className="w-4 h-4" /> Archivar Clínica
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-300 font-medium">
                  Escribe <span className="font-mono font-bold">ARCHIVAR</span> para confirmar
                </p>
                <input
                  value={archiveText}
                  onChange={(e) => setArchiveText(e.target.value)}
                  placeholder="ARCHIVAR"
                  className="w-full bg-slate-900 border border-red-500/40 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleArchive}
                    disabled={archiveText !== 'ARCHIVAR'}
                    className="bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition text-sm"
                  >
                    Confirmar Archivado
                  </button>
                  <button
                    onClick={() => { setConfirmArchive(false); setArchiveText('') }}
                    className="text-slate-400 hover:text-white font-medium px-4 py-2 rounded-lg transition text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
