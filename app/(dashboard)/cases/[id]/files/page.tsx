'use client'
import { useState } from 'react'
import { Upload, Download, Trash2, Share2, FileImage, Box, File } from 'lucide-react'
import { toast } from 'sonner'

const MOCK_FILES = [
  { id: '1', name: 'escaneo_maxilar.stl',   type: 'stl',   size: '4.2 MB', date: '2026-04-28', url: '#' },
  { id: '2', name: 'escaneo_mandibular.stl', type: 'stl',   size: '3.8 MB', date: '2026-04-28', url: '#' },
  { id: '3', name: 'radiografia_panoramica.jpg', type: 'img', size: '1.1 MB', date: '2026-04-27', url: '#' },
  { id: '4', name: 'fotografia_frontal.jpg', type: 'img',  size: '0.9 MB', date: '2026-04-27', url: '#' },
  { id: '5', name: 'ficha_tecnica.pdf',      type: 'pdf',   size: '0.3 MB', date: '2026-04-26', url: '#' },
]

function FileIcon({ type }: { type: string }) {
  if (type === 'stl') return <Box className="w-5 h-5 text-violet-400" />
  if (type === 'img') return <FileImage className="w-5 h-5 text-sky-400" />
  return <File className="w-5 h-5 text-slate-400" />
}

export default function CaseFilesPage() {
  const [files, setFiles] = useState(MOCK_FILES)
  const [dragging, setDragging] = useState(false)

  function handleDelete(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    toast.success('Archivo eliminado')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    toast.success(`${e.dataTransfer.files.length} archivo(s) subidos`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Archivos del Caso</h1>
        <p className="text-slate-400 text-sm mt-0.5">{files.length} archivos · STL, imágenes, PDFs</p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
          dragging ? 'border-sky-500 bg-sky-500/10' : 'border-slate-600 hover:border-sky-500/50 hover:bg-slate-800/50',
        ].join(' ')}
      >
        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">Arrastra archivos aquí</p>
        <p className="text-slate-500 text-sm mt-1">STL, JPG, PNG, PDF — máx. 50 MB por archivo</p>
        <label className="mt-4 inline-block">
          <input type="file" multiple className="sr-only" onChange={() => toast.success('Archivo(s) subidos')} />
          <span className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition">
            Seleccionar archivos
          </span>
        </label>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div key={file.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition group">
            {/* Preview */}
            <div className="h-28 bg-slate-700/50 rounded-lg flex items-center justify-center mb-3 relative">
              {file.type === 'img' ? (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <FileImage className="w-10 h-10 text-slate-400" />
                </div>
              ) : (
                <FileIcon type={file.type} />
              )}
              {file.type === 'stl' && (
                <span className="absolute top-2 right-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  3D
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{file.size} · {file.date}</p>
              </div>
              <FileIcon type={file.type} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
              <button onClick={() => toast.info('Descargando...')} className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-sky-400 transition py-1.5 rounded hover:bg-sky-500/10">
                <Download className="w-3.5 h-3.5" /> Descargar
              </button>
              <button onClick={() => toast.info('Enlace copiado')} className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition py-1.5 rounded hover:bg-emerald-500/10">
                <Share2 className="w-3.5 h-3.5" /> Compartir
              </button>
              <button onClick={() => handleDelete(file.id)} className="flex items-center justify-center text-slate-500 hover:text-red-400 transition p-1.5 rounded hover:bg-red-500/10">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
