import { Award, Download, Users } from 'lucide-react'

const STUDENTS = [
  { id: '1', name: 'María González', email: 'mgonzalez@clinicadental.es', progress: 100, lastActivity: 'hace 2 días', certified: true, avatar: 'MG', enrolled: '12 ene 2026' },
  { id: '2', name: 'Pedro Martínez', email: 'pmartinez@dentalplus.es', progress: 78, lastActivity: 'hace 1 día', certified: false, avatar: 'PM', enrolled: '15 ene 2026' },
  { id: '3', name: 'Laura Sánchez', email: 'lsanchez@odontomed.es', progress: 100, lastActivity: 'hace 5 días', certified: true, avatar: 'LS', enrolled: '10 ene 2026' },
  { id: '4', name: 'Carlos López', email: 'clopez@dentalcentro.es', progress: 45, lastActivity: 'hace 3 días', certified: false, avatar: 'CL', enrolled: '20 ene 2026' },
  { id: '5', name: 'Ana Fernández', email: 'afernandez@clinicabcn.es', progress: 92, lastActivity: 'hoy', certified: false, avatar: 'AF', enrolled: '8 ene 2026' },
  { id: '6', name: 'Roberto García', email: 'rgarcia@orthoexpert.es', progress: 100, lastActivity: 'hace 1 semana', certified: true, avatar: 'RG', enrolled: '5 ene 2026' },
  { id: '7', name: 'Isabel Moreno', email: 'imoreno@dentalstudio.es', progress: 60, lastActivity: 'hace 4 días', certified: false, avatar: 'IM', enrolled: '22 ene 2026' },
  { id: '8', name: 'Miguel Torres', email: 'mtorres@clinicamadrid.es', progress: 33, lastActivity: 'hace 6 días', certified: false, avatar: 'MT', enrolled: '18 ene 2026' },
  { id: '9', name: 'Carmen Ruiz', email: 'cruiz@smileclinic.es', progress: 100, lastActivity: 'hace 3 días', certified: true, avatar: 'CR', enrolled: '3 ene 2026' },
  { id: '10', name: 'Javier Díaz', email: 'jdiaz@dentalvip.es', progress: 18, lastActivity: 'hace 2 semanas', certified: false, avatar: 'JD', enrolled: '25 ene 2026' },
]

const COLORS = [
  'from-sky-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
  'from-indigo-500 to-violet-600',
  'from-lime-500 to-green-600',
  'from-red-500 to-rose-600',
  'from-fuchsia-500 to-pink-600',
]

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${value === 100 ? 'bg-emerald-500' : value >= 50 ? 'bg-sky-500' : 'bg-amber-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{value}%</span>
    </div>
  )
}

export default function CourseStudentsPage({ params }: { params: { id: string } }) {
  const certified = STUDENTS.filter((s) => s.certified).length
  const avgProgress = Math.round(STUDENTS.reduce((acc, s) => acc + s.progress, 0) / STUDENTS.length)
  const completed = STUDENTS.filter((s) => s.progress === 100).length

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Estudiantes</h1>
          <p className="text-slate-400 text-sm mt-0.5">Ortodoncia Digital Avanzada</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total estudiantes', value: STUDENTS.length, icon: Users, color: 'text-sky-400' },
          { label: 'Completados', value: completed, icon: Award, color: 'text-emerald-400' },
          { label: 'Certificados', value: certified, icon: Award, color: 'text-amber-400' },
          { label: 'Progreso medio', value: `${avgProgress}%`, icon: Users, color: 'text-violet-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-white">Lista de estudiantes</h2>
          <span className="text-xs text-slate-400">{STUDENTS.length} estudiantes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Estudiante</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Progreso</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Inscripción</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Última actividad</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Certificado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {STUDENTS.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                        {student.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{student.name}</div>
                        <div className="text-xs text-slate-400">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 min-w-[160px]">
                    <ProgressBar value={student.progress} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{student.enrolled}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{student.lastActivity}</td>
                  <td className="px-5 py-3.5">
                    {student.certified ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <Award className="w-3 h-3" /> Certificado
                      </span>
                    ) : student.progress === 100 ? (
                      <span className="text-xs text-amber-400">Pendiente</span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
