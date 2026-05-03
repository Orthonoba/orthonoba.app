import { Clock, Users, Star, Award, Play, FileText, BarChart2, Settings, CheckCircle2, Lock } from 'lucide-react'

const COURSE = {
  id: '1',
  title: 'Ortodoncia Digital Avanzada',
  description:
    'Domina las técnicas más avanzadas de ortodoncia digital, desde el diagnóstico con CBCT hasta el diseño de alineadores con software de vanguardia. Este curso integral te preparará para implementar flujos de trabajo completamente digitales en tu clínica.',
  instructor: { name: 'Dr. Carlos Mendoza', title: 'Ortodoncista · 18 años de experiencia', avatar: 'CM' },
  category: 'Ortodoncia',
  level: 'Avanzado',
  duration: '24h 30min',
  students: 312,
  rating: 4.9,
  reviews: 87,
  price: 299,
  enrolled: true,
  progress: 65,
  color: 'from-sky-600 to-blue-800',
  thumbnail: 'OD',
  lastUpdated: 'Marzo 2026',
  language: 'Español',
  objectives: [
    'Dominar el flujo de trabajo digital en ortodoncia',
    'Diseñar y planificar tratamientos con alineadores invisibles',
    'Utilizar software CBCT para diagnóstico avanzado',
    'Implementar protocolos de escaneo intraoral',
  ],
}

const SECTIONS = [
  {
    id: 's1',
    title: 'Módulo 1: Fundamentos digitales',
    lessons: [
      { id: 'l1', title: 'Bienvenida y presentación del curso', duration: '5:20', completed: true, free: true },
      { id: 'l2', title: 'El flujo de trabajo digital en ortodoncia', duration: '18:45', completed: true, free: false },
      { id: 'l3', title: 'Equipamiento necesario', duration: '12:10', completed: true, free: false },
    ],
  },
  {
    id: 's2',
    title: 'Módulo 2: Escáner intraoral',
    lessons: [
      { id: 'l4', title: 'Introducción al escáner intraoral', duration: '20:30', completed: true, free: false },
      { id: 'l5', title: 'Técnica de escaneo mandibular', duration: '25:15', completed: false, free: false },
      { id: 'l6', title: 'Exportación y manejo de archivos STL', duration: '14:00', completed: false, free: false },
    ],
  },
  {
    id: 's3',
    title: 'Módulo 3: Planificación con software',
    lessons: [
      { id: 'l7', title: 'Importación de modelos al software', duration: '16:40', completed: false, free: false },
      { id: 'l8', title: 'Análisis cefalométrico digital', duration: '30:00', completed: false, free: false },
      { id: 'l9', title: 'Diseño del plan de tratamiento', duration: '45:20', completed: false, free: false },
    ],
  },
]

const TABS = ['Contenido', 'Estudiantes', 'Analytics', 'Configuración']

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const totalLessons = SECTIONS.reduce((acc, s) => acc + s.lessons.length, 0)
  const completedLessons = SECTIONS.reduce((acc, s) => acc + s.lessons.filter((l) => l.completed).length, 0)

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${COURSE.color} aspect-[21/7] flex items-end`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[12rem] font-black text-white/10 select-none">{COURSE.thumbnail}</span>
          </div>
          <div className="relative p-8 bg-gradient-to-t from-black/70 to-transparent w-full">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-sky-500/30 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">{COURSE.category}</span>
              <span className="text-xs bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">{COURSE.level}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">{COURSE.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {COURSE.rating} ({COURSE.reviews} reseñas)</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {COURSE.students} estudiantes</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {COURSE.duration}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="flex border-b border-slate-700">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-5 py-3 text-sm font-medium transition ${i === 0 ? 'text-sky-400 border-b-2 border-sky-500 -mb-px' : 'text-slate-400 hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-5 space-y-5">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-white mb-2">Descripción</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{COURSE.description}</p>
                </div>
                {/* Objectives */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Lo que aprenderás</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COURSE.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {obj}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Progress */}
                {COURSE.enrolled && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Tu progreso</span>
                      <span className="text-sky-400 font-medium">{completedLessons}/{totalLessons} lecciones completadas</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${COURSE.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Instructor</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {COURSE.instructor.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{COURSE.instructor.name}</div>
                  <div className="text-sm text-slate-400">{COURSE.instructor.title}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> 4.9 rating</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 312 estudiantes</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> 3 cursos</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Especialista en ortodoncia digital con más de 18 años de experiencia clínica. Pioneer en la implementación de flujos de trabajo completamente digitales en España. Miembro de la Sociedad Española de Ortodoncia.
              </p>
            </div>

            {/* Course details */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Detalles del curso</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Nivel', COURSE.level],
                  ['Idioma', COURSE.language],
                  ['Duración total', COURSE.duration],
                  ['Última actualización', COURSE.lastUpdated],
                  ['Total de lecciones', String(totalLessons)],
                  ['Certificado', 'Al completar'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Enroll card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sticky top-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white">€{COURSE.price}</div>
                <div className="text-xs text-slate-400 mt-0.5">Acceso de por vida</div>
              </div>
              {COURSE.enrolled ? (
                <a
                  href={`/courses/${params.id}/lessons/l5`}
                  className="block w-full text-center bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition"
                >
                  Continuar curso
                </a>
              ) : (
                <button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition">
                  Inscribirse ahora
                </button>
              )}
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Acceso de por vida</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Certificado al completar</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Recursos descargables</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Soporte del instructor</div>
              </div>
            </div>

            {/* Syllabus */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">Contenido del curso</h3>
                <p className="text-xs text-slate-400 mt-0.5">{SECTIONS.length} módulos · {totalLessons} lecciones · {COURSE.duration}</p>
              </div>
              <div className="divide-y divide-slate-700">
                {SECTIONS.map((section) => (
                  <div key={section.id} className="p-4">
                    <div className="font-medium text-sm text-slate-200 mb-2">{section.title}</div>
                    <div className="space-y-2">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-2 text-xs">
                          {lesson.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : lesson.free ? (
                            <Play className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          )}
                          <a
                            href={lesson.free || COURSE.enrolled ? `/courses/${params.id}/lessons/${lesson.id}` : '#'}
                            className={`flex-1 ${lesson.completed ? 'text-emerald-400' : lesson.free || COURSE.enrolled ? 'text-slate-300 hover:text-sky-400' : 'text-slate-500'} transition`}
                          >
                            {lesson.title}
                          </a>
                          <span className="text-slate-600">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
