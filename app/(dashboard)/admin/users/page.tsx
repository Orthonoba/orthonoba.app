'use client'
import { useState } from 'react'
import { UserPlus, Search, Shield, Ban, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const USERS = [
  { id: '1',  name: 'Carlos García',      email: 'carlos@clinica.com',     role: 'clinic_admin', clinic: 'Clínica Dental Norte', status: 'active',   last: '2026-05-04 09:15' },
  { id: '2',  name: 'Ana Rodríguez',      email: 'ana@orthosmile.com',      role: 'doctor',       clinic: 'OrthoSmile Barcelona', status: 'active',   last: '2026-05-04 08:42' },
  { id: '3',  name: 'Juan Martínez',      email: 'juan@dentalvg.com',       role: 'lab_admin',    clinic: 'Dental Vanguard',      status: 'active',   last: '2026-05-03 17:30' },
  { id: '4',  name: 'Laura Fernández',    email: 'laura@sonrisa.com',       role: 'doctor',       clinic: 'Sonrisa Perfecta',     status: 'active',   last: '2026-05-03 16:20' },
  { id: '5',  name: 'Miguel Torres',      email: 'miguel@oraltech.com',     role: 'staff',        clinic: 'OralTech Bilbao',      status: 'inactive', last: '2026-04-28 10:00' },
  { id: '6',  name: 'Patricia Ruiz',      email: 'patricia@excellence.com', role: 'doctor',       clinic: 'Dental Excellence',    status: 'active',   last: '2026-05-04 07:55' },
  { id: '7',  name: 'Roberto Díaz',       email: 'roberto@clinica.com',     role: 'staff',        clinic: 'Clínica Dental Norte', status: 'active',   last: '2026-05-02 14:30' },
  { id: '8',  name: 'Carmen Alonso',      email: 'carmen@orthosmile.com',   role: 'instructor',   clinic: 'OrthoSmile Barcelona', status: 'active',   last: '2026-05-01 11:00' },
  { id: '9',  name: 'Diego Castro',       email: 'diego@dentalvg.com',      role: 'doctor',       clinic: 'Dental Vanguard',      status: 'inactive', last: '2026-04-20 09:00' },
  { id: '10', name: 'Isabel Moreno',      email: 'isabel@sonrisa.com',      role: 'staff',        clinic: 'Sonrisa Perfecta',     status: 'active',   last: '2026-05-04 08:00' },
  { id: '11', name: 'Francisco López',    email: 'francisco@oraltech.com',  role: 'clinic_admin', clinic: 'OralTech Bilbao',      status: 'active',   last: '2026-05-03 13:45' },
  { id: '12', name: 'Jose Greorio',       email: 'jose@orthonoba.app',      role: 'super_admin',  clinic: 'Orthonoba Platform',   status: 'active',   last: '2026-05-04 09:30' },
]

const ROLE_COLORS: Record<string, string> = {
  super_admin:  'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  clinic_admin: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
  lab_admin:    'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  doctor:       'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  staff:        'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  instructor:   'bg-teal-500/20 text-teal-400 border border-teal-500/30',
}
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin', clinic_admin: 'Admin Clínica', lab_admin: 'Admin Lab',
  doctor: 'Doctor', staff: 'Staff', instructor: 'Instructor',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const filtered = USERS.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    const matchStatus = !statusFilter || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} usuarios</p>
        </div>
        <button onClick={() => toast.info('Invitar usuario')} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <UserPlus className="w-4 h-4" /> Invitar usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuario..." className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todos los roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-sky-500/10 border border-sky-500/30 rounded-lg px-4 py-2.5 text-sm">
          <span className="text-sky-400 font-medium">{selected.length} seleccionados</span>
          <div className="flex gap-2 ml-2">
            <button onClick={() => { toast.info('Rol cambiado'); setSelected([]) }} className="flex items-center gap-1.5 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded px-3 py-1 transition text-xs">
              <Shield className="w-3.5 h-3.5" /> Cambiar rol
            </button>
            <button onClick={() => { toast.warning('Usuarios desactivados'); setSelected([]) }} className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded px-3 py-1 transition text-xs">
              <Ban className="w-3.5 h-3.5" /> Desactivar
            </button>
            <button onClick={() => { toast.error('Usuarios eliminados'); setSelected([]) }} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 border border-red-500/30 rounded px-3 py-1 transition text-xs">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left w-8"><input type="checkbox" className="rounded border-slate-600 bg-slate-700" onChange={(e) => setSelected(e.target.checked ? USERS.map((u) => u.id) : [])} /></th>
                <th className="text-left px-5 py-3">Usuario</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Rol</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Clínica</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Estado</th>
                <th className="text-left px-5 py-3 hidden xl:table-cell">Último acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((u) => (
                <tr key={u.id} className={['hover:bg-slate-700/30 transition', selected.includes(u.id) ? 'bg-sky-500/5' : ''].join(' ')}>
                  <td className="px-5 py-3.5">
                    <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} className="rounded border-slate-600 bg-slate-700" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{u.clinic}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
                      {u.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs hidden xl:table-cell">{u.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
