'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Download, FileText, ChevronLeft, ChevronRight, StickyNote, BookOpen } from 'lucide-react'

const LESSONS = [
  { id: 'l1', title: 'Bienvenida y presentación del curso', duration: '5:20', completed: true, section: 'Módulo 1: Fundamentos digitales', videoId: 'dQw4w9WgXcQ' },
  { id: 'l2', title: 'El flujo de trabajo digital en ortodoncia', duration: '18:45', completed: true, section: 'Módulo 1: Fundamentos digitales', videoId: 'dQw4w9WgXcQ' },
  { id: 'l3', title: 'Equipamiento necesario', duration: '12:10', completed: true, section: 'Módulo 1: Fundamentos digitales', videoId: 'dQw4w9WgXcQ' },
  { id: 'l4', title: 'Introducción al escáner intraoral', duration: '20:30', completed: true, section: 'Módulo 2: Escáner intraoral', videoId: 'dQw4w9WgXcQ' },
  { id: 'l5', title: 'Técnica de escaneo mandibular', duration: '25:15', completed: false, section: 'Módulo 2: Escáner intraoral', videoId: 'dQw4w9WgXcQ' },
  { id: 'l6', title: 'Exportación y manejo de archivos STL', duration: '14:00', completed: false, section: 'Módulo 2: Escáner intraoral', videoId: 'dQw4w9WgXcQ' },
  { id: 'l7', title: 'Importación de modelos al software', duration: '16:40', completed: false, section: 'Módulo 3: Planificación con software', videoId: 'dQw4w9WgXcQ' },
  { id: 'l8', title: 'Análisis cefalométrico digital', duration: '30:00', completed: false, section: 'Módulo 3: Planificación con software', videoId: 'dQw4w9WgXcQ' },
  { id: 'l9', title: 'Diseño del plan de tratamiento', duration: '45:20', completed: false, section: 'Módulo 3: Planificación con software', videoId: 'dQw4w9WgXcQ' },
]

const RESOURCES = [
  { name: 'Guía de protocolos de escaneo.pdf', size: '2.4 MB', type: 'pdf' },
  { name: 'Checklist equipamiento digital.xlsx', size: '0.8 MB', type: 'xlsx' },
  { name: 'Plantillas de informe diagnóstico.docx', size: '1.1 MB', type: 'docx' },
]

export default function LessonViewerPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const currentIdx = LESSONS.findIndex((l) => l.id === params.lessonId) ?? 4
  const safeIdx = currentIdx < 0 ? 4 : currentIdx
  const lesson = LESSONS[safeIdx]
  const prevLesson = safeIdx > 0 ? LESSONS[safeIdx - 1] : null
  const nextLesson = safeIdx < LESSONS.length - 1 ? LESSONS[safeIdx + 1] : null

  const [completedState, setCompletedState] = useState<Record<string, boolean>>(
    Object.fromEntries(LESSONS.map((l) => [l.id, l.completed]))
  )
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  function toggleComplete(id: string) {
    setCompletedState((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function saveNotes() {
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
  }

  const completedCount = Object.values(completedState).filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-700 flex-shrink-0 overflow-y-auto max-h-screen">
        <div className="p-4 border-b border-slate-700">
          <a href={`/courses/${params.id}`} className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1 mb-2">
            <ChevronLeft className="w-4 h-4" /> Volver al curso
          </a>
          <h2 className="font-semibold text-white text-sm">Ortodoncia Digital Avanzada</h2>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Progreso</span>
              <span className="text-sky-400">{completedCount}/{LESSONS.length}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${Math.round((completedCount / LESSONS.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-700/50">
          {LESSONS.map((l, idx) => (
            <a
              key={l.id}
              href={`/courses/${params.id}/lessons/${l.id}`}
              className={`flex items-start gap-3 p-3.5 hover:bg-slate-700/50 transition ${l.id === lesson?.id ? 'bg-sky-500/10 border-l-2 border-sky-500' : ''}`}
            >
              <button
                onClick={(e) => { e.preventDefault(); toggleComplete(l.id) }}
                className="mt-0.5 flex-shrink-0"
              >
                {completedState[l.id] ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium leading-relaxed ${l.id === lesson?.id ? 'text-sky-300' : 'text-slate-300'}`}>
                  {idx + 1}. {l.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{l.duration}</div>
              </div>
            </a>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Video */}
          <div>
            <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-t-transparent border-b-transparent border-l-white ml-1" />
                </div>
                <div className="text-sm text-white/50">Reproductor de video — {lesson?.title}</div>
              </div>
            </div>
          </div>

          {/* Lesson info */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 mb-1">{lesson?.section}</div>
              <h1 className="text-xl font-bold text-white">{lesson?.title}</h1>
            </div>
            <button
              onClick={() => lesson && toggleComplete(lesson.id)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition flex-shrink-0 ${
                completedState[lesson?.id ?? '']
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-sky-500 hover:text-sky-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {completedState[lesson?.id ?? ''] ? 'Completada' : 'Marcar completada'}
            </button>
          </div>

          {/* Resources */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" /> Recursos descargables
            </h3>
            <div className="space-y-2">
              {RESOURCES.map((r) => (
                <div key={r.name} className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{r.name}</div>
                    <div className="text-xs text-slate-500">{r.size}</div>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition px-2 py-1 rounded-lg hover:bg-sky-500/10">
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-400" /> Mis notas
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Escribe tus apuntes sobre esta lección..."
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={saveNotes}
                className="text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium px-4 py-1.5 rounded-lg transition"
              >
                {notesSaved ? '✓ Guardado' : 'Guardar notas'}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-3">
            {prevLesson ? (
              <a
                href={`/courses/${params.id}/lessons/${prevLesson.id}`}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-white px-4 py-2.5 rounded-xl text-sm transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs text-slate-400">Anterior</div>
                  <div className="font-medium truncate max-w-[180px]">{prevLesson.title}</div>
                </div>
              </a>
            ) : <div />}
            {nextLesson ? (
              <a
                href={`/courses/${params.id}/lessons/${nextLesson.id}`}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2.5 rounded-xl text-sm transition ml-auto"
              >
                <div className="text-right">
                  <div className="text-xs text-sky-200">Siguiente</div>
                  <div className="font-medium truncate max-w-[180px]">{nextLesson.title}</div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </a>
            ) : (
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition ml-auto">
                <CheckCircle2 className="w-4 h-4" /> Finalizar curso
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
