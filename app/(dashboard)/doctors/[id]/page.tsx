import { Star, Briefcase, Users, Building2, Clock } from 'lucide-react'

const DOCTOR = {
  id: '1', name: 'Dr. Carlos García López', specialty: 'Ortodoncia',
  clinic: 'Clínica Dental Norte', phone: '+34 612 345 678', email: 'garcia@clinica.com',
  bio: 'Especialista en ortodoncia invisible y ortodoncia lingual. Más de 15 años de experiencia clínica. Formación en la Universidad Complutense de Madrid y máster en ortodoncia en la NYU.',
  rating: 4.9, totalCases: 234, totalPatients: 89, yearsExperience: 15,
}

const CASES = [
  { id: '1', patient: 'María González',   type: 'Ortodoncia',   status: 'En Producción', date: '2026-04-22' },
  { id: '2', patient: 'Carlos Martínez',  type: 'Retenedor',    status: 'Completado',    date: '2026-04-18' },
  { id: '3', patient: 'Ana Fernández',    type: 'Ortodoncia',   status: 'En Diseño',     date: '2026-04-25' },
  { id: '4', patient: 'José Ramírez',     type: 'Prótesis',     status: 'Nuevo',         date: '2026-04-29' },
  { id: '5', patient: 'Laura Sánchez',    type: 'Ortodoncia',   status: 'En Producción', date: '2026-04-20' },
]

const STATUS_COLORS: Record<string, string> = {
  'En Producción': 'bg-sky-500/15 text-sky-400',
  'Completado':    'bg-emerald-500/15 text-emerald-400',
  'En Diseño':     'bg-violet-500/15 text-violet-400',
  'Nuevo':         'bg-amber-500/15 text-amber-400',
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00']
const AVAILABILITY: Record<string, Record<string, boolean>> = {
  'Lun': { '09:00': true, '10:00': true, '11:00': false, '12:00': true, '13:00': false, '16:00': true, '17:00': true, '18:00': false },
  'Mar': { '09:00': false, '10:00': true, '11:00': true, '12:00': false, '13:00': true, '16:00': true, '17:00': false, '18:00': true },
  'Mié': { '09:00': true, '10:00': false, '11:00': true, '12:00': true, '13:00': false, '16:00': false, '17:00': true, '18:00': true },
  'Jue': { '09:00': true, '10:00': true, '11:00': false, '12:00': false, '13:00': true, '16:00': true, '17:00': true, '18:00': false },
  'Vie': { '09:00': false, '10:00': true, '11:00': true, '12:00': true, '13:00': false, '16:00': false, '17:00': false, '18:00': true },
  'Sáb': { '09:00': true, '10:00': true, '11:00': false, '12:00': false, '13:00': false, '16:00': false, '17:00': false, '18:00': false },
}

export default function DoctorDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            GL
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{DOCTOR.name}</h1>
            <p className="text-sky-400 font-medium mt-0.5">{DOCTOR.specialty}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {DOCTOR.clinic}</span>
              <span className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(DOCTOR.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />)}
                <span className="ml-1">{DOCTOR.rating}</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-2xl">{DOCTOR.bio}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Casos totales',  value: DOCTOR.totalCases,      icon: Briefcase, color: 'text-sky-400' },
          { label: 'Pacientes',      value: DOCTOR.totalPatients,    icon: Users,     color: 'text-emerald-400' },
          { label: 'Años exp.',      value: DOCTOR.yearsExperience,  icon: Clock,     color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Calendar */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Disponibilidad semanal</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-slate-500 font-medium pb-2 pr-2 text-left">Hora</th>
                  {DAYS.map((d) => <th key={d} className="text-slate-400 font-medium pb-2 px-1 text-center">{d}</th>)}
                </tr>
              </thead>
              <tbody className="space-y-1">
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td className="text-slate-500 pr-2 py-1 text-xs font-mono">{h}</td>
                    {DAYS.map((d) => (
                      <td key={d} className="px-1 py-1 text-center">
                        <div className={`w-full h-6 rounded ${AVAILABILITY[d]?.[h] ? 'bg-emerald-500/30 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/20'}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/30" />Disponible</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/20" />Ocupado</span>
          </div>
        </div>

        {/* Assigned Cases */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Casos asignados</h2>
          <div className="space-y-2">
            {CASES.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.patient}</p>
                  <p className="text-xs text-slate-500">{c.type} · {c.date}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? 'bg-slate-700 text-slate-300'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
