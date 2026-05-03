import { BookOpen, Clock, Users, Star, Filter, Search, GraduationCap } from 'lucide-react'

const COURSES = [
  {
    id: '1',
    title: 'Ortodoncia Digital Avanzada',
    instructor: 'Dr. Carlos Mendoza',
    category: 'Ortodoncia',
    level: 'Avanzado',
    duration: '24h 30min',
    students: 312,
    rating: 4.9,
    price: 299,
    enrolled: true,
    progress: 65,
    thumbnail: 'OD',
    color: 'from-sky-600 to-blue-800',
  },
  {
    id: '2',
    title: 'Diseño CAD Dental con Exocad',
    instructor: 'Dra. Laura Fernández',
    category: 'CAD/CAM',
    level: 'Intermedio',
    duration: '18h 15min',
    students: 489,
    rating: 4.8,
    price: 249,
    enrolled: true,
    progress: 30,
    thumbnail: 'DC',
    color: 'from-violet-600 to-purple-800',
  },
  {
    id: '3',
    title: 'Marketing Dental Digital',
    instructor: 'Ana García Ruiz',
    category: 'Marketing',
    level: 'Básico',
    duration: '12h 00min',
    students: 756,
    rating: 4.7,
    price: 149,
    enrolled: false,
    progress: 0,
    thumbnail: 'MD',
    color: 'from-emerald-600 to-teal-800',
  },
  {
    id: '4',
    title: 'Implantología 3D Guiada',
    instructor: 'Dr. Roberto Silva',
    category: 'Implantología',
    level: 'Avanzado',
    duration: '30h 45min',
    students: 198,
    rating: 5.0,
    price: 399,
    enrolled: false,
    progress: 0,
    thumbnail: 'I3',
    color: 'from-amber-600 to-orange-800',
  },
  {
    id: '5',
    title: 'Cirugía Guiada por Ordenador',
    instructor: 'Dr. Miguel Torres',
    category: 'Cirugía',
    level: 'Avanzado',
    duration: '22h 00min',
    students: 143,
    rating: 4.8,
    price: 349,
    enrolled: true,
    progress: 100,
    thumbnail: 'CG',
    color: 'from-red-600 to-rose-800',
  },
  {
    id: '6',
    title: 'Prótesis Digital Completa',
    instructor: 'Dra. Isabel Moreno',
    category: 'Prótesis',
    level: 'Intermedio',
    duration: '16h 30min',
    students: 267,
    rating: 4.6,
    price: 199,
    enrolled: false,
    progress: 0,
    thumbnail: 'PD',
    color: 'from-cyan-600 to-sky-800',
  },
]

const CATEGORIES = ['Todos', 'Ortodoncia', 'CAD/CAM', 'Marketing', 'Implantología', 'Cirugía', 'Prótesis']
const LEVELS = ['Todos', 'Básico', 'Intermedio', 'Avanzado']

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Básico: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Intermedio: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Avanzado: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors[level] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}>
      {level}
    </span>
  )
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600/20 via-slate-800 to-violet-600/20 border border-slate-700 p-8">
        <div className="absolute inset-0 bg-grid-slate-700/20" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white">Academia Orthonoba</h1>
                <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">Beta</span>
              </div>
              <p className="text-slate-400 mt-1">Formación profesional en odontología digital y gestión clínica</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">6</div>
              <div className="text-xs text-slate-400">Cursos</div>
            </div>
            <div className="w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2.165</div>
              <div className="text-xs text-slate-400">Estudiantes</div>
            </div>
            <div className="w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">8</div>
              <div className="text-xs text-slate-400">Categorías</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
            <option>Precio: Todos</option>
            <option>Gratis</option>
            <option>De pago</option>
          </select>
        </div>
      </div>

      {/* Section: My courses */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Mis cursos en progreso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.filter((c) => c.enrolled && c.progress < 100).map((course) => (
            <a key={course.id} href={`/courses/${course.id}`} className="block group">
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-sky-500/50 transition-all">
                <div className={`h-40 bg-gradient-to-br ${course.color} flex items-center justify-center`}>
                  <span className="text-5xl font-black text-white/30">{course.thumbnail}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors line-clamp-2">{course.title}</h3>
                    <LevelBadge level={course.level} />
                  </div>
                  <p className="text-sm text-slate-400">{course.instructor}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{course.rating}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Progreso</span>
                      <span className="text-sky-400 font-medium">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* All courses */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Todos los cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((course) => (
            <a key={course.id} href={`/courses/${course.id}`} className="block group">
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-sky-500/50 transition-all">
                <div className={`h-40 bg-gradient-to-br ${course.color} flex items-center justify-center relative`}>
                  <span className="text-5xl font-black text-white/30">{course.thumbnail}</span>
                  {course.progress === 100 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Completado
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors line-clamp-2">{course.title}</h3>
                    <LevelBadge level={course.level} />
                  </div>
                  <p className="text-sm text-slate-400">{course.instructor}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{course.rating}</span>
                  </div>
                  {course.enrolled && course.progress > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Progreso</span>
                        <span className="text-sky-400 font-medium">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-white">
                      {course.price === 0 ? 'Gratis' : `€${course.price}`}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${course.enrolled ? 'bg-sky-500/15 text-sky-400' : 'bg-slate-700 text-slate-300'}`}>
                      {course.enrolled ? (course.progress === 100 ? 'Ver certificado' : 'Continuar') : 'Ver curso'}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
