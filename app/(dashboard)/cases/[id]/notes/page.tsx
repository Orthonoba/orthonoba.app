'use client'
import { useState } from 'react'
import { Plus, MessageSquare, Filter } from 'lucide-react'
import { toast } from 'sonner'

const MOCK_NOTES = [
  { id: '1', author: 'Dr. García López',     role: 'Dentista',   content: 'Paciente presenta ligera sensibilidad en zona 16-17. Se recomienda ajuste oclusal antes de la colocación final de la prótesis. Confirmar con el laboratorio el ajuste marginal.',  date: '2026-04-28 14:32', avatar: 'GL' },
  { id: '2', author: 'Técnico Martínez',      role: 'Técnico Lab', content: 'Completado el fresado del zirconio. La pieza presenta un ajuste marginal de 0.08mm, dentro de los parámetros aceptables. Pendiente de sinterizado final.',                         date: '2026-04-27 10:15', avatar: 'TM' },
  { id: '3', author: 'Dra. Rodríguez Alba',   role: 'Dentista',   content: 'Primera prueba de metal satisfactoria. El paciente indica buen comfort. Se toman nuevas impresiones para verificar oclusión dinámica en posición de máxima intercuspidación.', date: '2026-04-25 16:45', avatar: 'RA' },
  { id: '4', author: 'Admin Clínica Norte',   role: 'Administración', content: 'Caso enviado al laboratorio con prioridad normal. Fecha comprometida: 12 de mayo. Se notificó al paciente por WhatsApp.',                                                          date: '2026-04-22 09:00', avatar: 'AC' },
]

const AVATAR_COLORS: Record<string, string> = {
  'Dentista': 'bg-sky-500',
  'Técnico Lab': 'bg-violet-500',
  'Administración': 'bg-emerald-500',
}

export default function CaseNotesPage() {
  const [notes, setNotes] = useState(MOCK_NOTES)
  const [newNote, setNewNote] = useState('')
  const [filter, setFilter] = useState('')
  const [adding, setAdding] = useState(false)

  function handleAdd() {
    if (!newNote.trim()) return
    setNotes((prev) => [{
      id: String(Date.now()),
      author: 'Jose Greorio',
      role: 'Administración',
      content: newNote,
      date: new Date().toLocaleString('es-ES'),
      avatar: 'JG',
    }, ...prev])
    setNewNote('')
    setAdding(false)
    toast.success('Nota añadida')
  }

  const filtered = filter ? notes.filter((n) => n.author.toLowerCase().includes(filter.toLowerCase()) || n.role.toLowerCase().includes(filter.toLowerCase())) : notes

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notas del Caso</h1>
          <p className="text-slate-400 text-sm mt-0.5">{notes.length} notas clínicas</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <Plus className="w-4 h-4" /> Añadir nota
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-56">
          <Filter className="w-4 h-4 text-slate-500" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar por autor..." className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
      </div>

      {/* New note form */}
      {adding && (
        <div className="bg-slate-800 border border-sky-500/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-sky-400">
            <MessageSquare className="w-4 h-4" /> Nueva nota
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
            placeholder="Escribe una nota clínica detallada..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 resize-none transition"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setNewNote('') }} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition">
              Cancelar
            </button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg transition">
              Guardar nota
            </button>
          </div>
        </div>
      )}

      {/* Notes Timeline */}
      <div className="space-y-4">
        {filtered.map((note) => (
          <div key={note.id} className="flex gap-4">
            {/* Avatar + line */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[note.role] ?? 'bg-slate-600'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {note.avatar}
              </div>
              <div className="w-px flex-1 bg-slate-700 mt-2 mb-[-1rem]" />
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4 hover:border-slate-600 transition">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-sm font-semibold text-white">{note.author}</span>
                  <span className="ml-2 text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{note.role}</span>
                </div>
                <span className="text-xs text-slate-500 shrink-0">{note.date}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{note.content}</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No hay notas que coincidan con el filtro</p>
          </div>
        )}
      </div>
    </div>
  )
}
