import Link from 'next/link'
import { Plus, Building2, Users, Briefcase, MapPin } from 'lucide-react'

const CLINICS = [
  { id: '1', name: 'Clínica Dental Norte',    city: 'Madrid',    patients: 284, cases: 12, status: 'active',   plan: 'growth' },
  { id: '2', name: 'OrthoSmile Barcelona',    city: 'Barcelona', patients: 197, cases: 8,  status: 'active',   plan: 'enterprise' },
  { id: '3', name: 'Dental Vanguard',         city: 'Sevilla',   patients: 156, cases: 5,  status: 'active',   plan: 'starter' },
  { id: '4', name: 'Clínica Sonrisa Perfecta', city: 'Valencia', patients: 312, cases: 21, status: 'active',   plan: 'growth' },
  { id: '5', name: 'OralTech Bilbao',         city: 'Bilbao',    patients: 89,  cases: 3,  status: 'inactive', plan: 'starter' },
  { id: '6', name: 'Dental Excellence',       city: 'Zaragoza',  patients: 143, cases: 7,  status: 'active',   plan: 'growth' },
]

const STATUS_COLORS = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-slate-500/15  text-slate-400   border-slate-500/20',
}
const PLAN_COLORS: Record<string, string> = {
  starter:    'bg-slate-700  text-slate-300',
  growth:     'bg-sky-500/20 text-sky-400',
  enterprise: 'bg-violet-500/20 text-violet-400',
}

export default function ClinicsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clínicas</h1>
          <p className="text-slate-400 text-sm mt-0.5">{CLINICS.length} clínicas registradas</p>
        </div>
        <Link href="/clinics/new" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <Plus className="w-4 h-4" /> Nueva clínica
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input placeholder="Buscar clínica..." className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-56 transition" />
        <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </select>
        <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todas las ciudades</option>
          {[...new Set(CLINICS.map((c) => c.city))].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CLINICS.map((clinic) => (
          <div key={clinic.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-sky-500/40 transition-all group">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{clinic.name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" /> {clinic.city}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[clinic.status as keyof typeof STATUS_COLORS]}`}>
                  {clinic.status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[clinic.plan]}`}>
                  {clinic.plan}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-700/40 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1"><Users className="w-3 h-3" /> Pacientes</div>
                <p className="text-xl font-bold text-white">{clinic.patients}</p>
              </div>
              <div className="bg-slate-700/40 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1"><Briefcase className="w-3 h-3" /> Casos activos</div>
                <p className="text-xl font-bold text-sky-400">{clinic.cases}</p>
              </div>
            </div>

            <Link href={`/clinics/${clinic.id}`} className="block w-full text-center text-sm font-medium text-slate-300 hover:text-sky-400 border border-slate-600 hover:border-sky-500/40 rounded-lg py-2 transition">
              Ver detalle →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
