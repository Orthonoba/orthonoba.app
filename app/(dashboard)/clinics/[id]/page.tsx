import { Building2, Users, FileText, TrendingUp, Settings, MapPin, Phone, Mail, Star, Activity } from 'lucide-react'

const mockClinic = {
  id: 'clinic-001',
  name: 'Clínica Dental Providencia',
  rut: '76.543.210-1',
  address: 'Av. Providencia 2345, Piso 3',
  city: 'Santiago',
  country: 'Chile',
  phone: '+56 2 2345 6789',
  email: 'contacto@dentalprov.cl',
  plan: 'Growth',
  status: 'active',
  doctorsCount: 4,
  patientsCount: 187,
  activeCases: 34,
  completedCases: 892,
  monthlyRevenue: 4850000,
  rating: 4.8,
  since: '2022-03-15',
}

const mockPatients = [
  { id: '1', name: 'María González', age: 34, phone: '+56 9 1234 5678', activeCases: 2, lastVisit: '2026-04-28' },
  { id: '2', name: 'Carlos Fuentes', age: 52, phone: '+56 9 2345 6789', activeCases: 1, lastVisit: '2026-04-25' },
  { id: '3', name: 'Ana Martínez', age: 27, phone: '+56 9 3456 7890', activeCases: 0, lastVisit: '2026-04-20' },
]

const mockCases = [
  { id: 'C-001', patient: 'María González', type: 'Ortodoncia', status: 'En Producción', date: '2026-04-01' },
  { id: 'C-002', patient: 'Carlos Fuentes', type: 'Prótesis', status: 'Completado', date: '2026-03-15' },
  { id: 'C-003', patient: 'Ana Martínez', type: 'Retenedor', status: 'Nuevo', date: '2026-04-28' },
]

const TAB_LIST = ['Resumen', 'Pacientes', 'Casos', 'Estadísticas', 'Configuración']

const statusColor: Record<string, string> = {
  'Nuevo': 'bg-slate-700 text-slate-300',
  'En Diseño': 'bg-sky-500/20 text-sky-400',
  'En Producción': 'bg-amber-500/20 text-amber-400',
  'Completado': 'bg-emerald-500/20 text-emerald-400',
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default async function ClinicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab = 'Resumen' } = await searchParams
  const clinic = { ...mockClinic, id }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Clinic Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{clinic.name}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{clinic.rut}</p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    {clinic.address}, {clinic.city}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Phone className="w-4 h-4" />
                    {clinic.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    {clinic.email}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-sm font-medium px-3 py-1 rounded-full">
                <Activity className="w-3.5 h-3.5" /> Activa
              </span>
              <span className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-400 text-sm font-medium px-3 py-1 rounded-full">
                Plan {clinic.plan}
              </span>
              <div className="flex items-center gap-1 bg-amber-500/15 text-amber-400 text-sm font-medium px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {clinic.rating}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Pacientes" value={clinic.patientsCount} sub="Total registrados" color="bg-sky-500/20 text-sky-400" />
          <StatCard icon={FileText} label="Casos Activos" value={clinic.activeCases} sub="En curso" color="bg-amber-500/20 text-amber-400" />
          <StatCard icon={TrendingUp} label="Casos Completados" value={clinic.completedCases} sub="Histórico" color="bg-emerald-500/20 text-emerald-400" />
          <StatCard icon={Building2} label="Doctores" value={clinic.doctorsCount} sub="Profesionales activos" color="bg-violet-500/20 text-violet-400" />
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700">
          <div className="flex gap-1 overflow-x-auto">
            {TAB_LIST.map((t) => (
              <a
                key={t}
                href={`/clinics/${id}?tab=${t}`}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition -mb-px ${
                  tab === t
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </a>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {tab === 'Resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Información General</h3>
              <dl className="space-y-3">
                {[
                  { label: 'Nombre', value: clinic.name },
                  { label: 'RUT', value: clinic.rut },
                  { label: 'Dirección', value: `${clinic.address}, ${clinic.city}, ${clinic.country}` },
                  { label: 'Teléfono', value: clinic.phone },
                  { label: 'Email', value: clinic.email },
                  { label: 'Plan', value: clinic.plan },
                  { label: 'Miembro desde', value: new Date(clinic.since).toLocaleDateString('es-CL') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-slate-700/50">
                    <dt className="text-sm text-slate-400">{label}</dt>
                    <dd className="text-sm text-white font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Últimos Casos</h3>
              <div className="space-y-3">
                {mockCases.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{c.patient}</p>
                      <p className="text-xs text-slate-400">{c.id} · {c.type}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[c.status] || 'bg-slate-700 text-slate-300'}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Pacientes' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <h3 className="font-semibold text-white">Pacientes de la Clínica</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Nombre', 'Edad', 'Teléfono', 'Casos Activos', 'Última Visita'].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mockPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-5 py-4 text-sm font-medium text-white">{p.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{p.age} años</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{p.phone}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.activeCases > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                          {p.activeCases} activos
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">{new Date(p.lastVisit).toLocaleDateString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Casos' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <h3 className="font-semibold text-white">Casos de la Clínica</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['ID', 'Paciente', 'Tipo', 'Estado', 'Fecha'].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mockCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-5 py-4 text-sm font-mono text-sky-400">{c.id}</td>
                      <td className="px-5 py-4 text-sm font-medium text-white">{c.patient}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{c.type}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[c.status] || 'bg-slate-700 text-slate-300'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">{new Date(c.date).toLocaleDateString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Estadísticas' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-6">Estadísticas de la Clínica</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-5 bg-slate-900 rounded-xl">
                <p className="text-3xl font-bold text-sky-400">{clinic.patientsCount}</p>
                <p className="text-sm text-slate-400 mt-1">Pacientes totales</p>
              </div>
              <div className="text-center p-5 bg-slate-900 rounded-xl">
                <p className="text-3xl font-bold text-emerald-400">{clinic.completedCases}</p>
                <p className="text-sm text-slate-400 mt-1">Casos completados</p>
              </div>
              <div className="text-center p-5 bg-slate-900 rounded-xl">
                <p className="text-3xl font-bold text-amber-400">${(clinic.monthlyRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-slate-400 mt-1">Ingreso mensual (CLP)</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'Configuración' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Configuración de la Clínica</h3>
            <a
              href={`/clinics/${id}/settings`}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-medium px-5 py-2.5 rounded-lg transition"
            >
              <Settings className="w-4 h-4" /> Ir a Configuración
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
