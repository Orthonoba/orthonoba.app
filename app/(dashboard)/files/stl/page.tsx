'use client'
import { useState, useRef, useCallback } from 'react'
import {
  Upload, Box, FileCheck, AlertCircle, X, Download,
  Eye, Trash2, Clock, CheckCircle2, Loader2, RefreshCw,
  ChevronDown, Filter, Search,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type ScanType = 'upper_arch' | 'lower_arch' | 'bite' | 'model' | 'full_case' | 'other'
type Jaw = 'upper' | 'lower' | 'both' | 'unknown'
type FileStatus = 'uploading' | 'processing' | 'ready' | 'error'

interface STLFile {
  id: string
  name: string
  size: number
  type: string
  status: FileStatus
  progress?: number
  uploadedAt: string
  jaw: Jaw
  scanType: ScanType
  notes?: string
  orderId?: string
  patientId?: string
  patientName?: string
  url?: string
  error?: string
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_FILES: STLFile[] = [
  {
    id: 'stl-001',
    name: 'paciente_garcia_arcada_superior.stl',
    size: 12_400_000,
    type: 'model/stl',
    status: 'ready',
    uploadedAt: '2026-05-04T10:23:00Z',
    jaw: 'upper',
    scanType: 'upper_arch',
    notes: 'Arcada superior para corona #16',
    orderId: 'ORD-2024-001',
    patientName: 'María García López',
    patientId: 'PAT-001',
    url: '#',
  },
  {
    id: 'stl-002',
    name: 'caso_implante_full.zip',
    size: 87_500_000,
    type: 'application/zip',
    status: 'ready',
    uploadedAt: '2026-05-03T16:45:00Z',
    jaw: 'both',
    scanType: 'full_case',
    notes: 'Caso completo implante All-on-4 mandíbula',
    orderId: 'ORD-2024-003',
    patientName: 'Carlos Ruiz Martínez',
    patientId: 'PAT-003',
    url: '#',
  },
  {
    id: 'stl-003',
    name: 'modelo_lower_rodriguez.stl',
    size: 9_800_000,
    type: 'model/stl',
    status: 'processing',
    uploadedAt: '2026-05-04T11:05:00Z',
    jaw: 'lower',
    scanType: 'lower_arch',
    patientName: 'Ana Rodríguez Sánchez',
    patientId: 'PAT-007',
    orderId: 'ORD-2024-009',
  },
  {
    id: 'stl-004',
    name: 'bite_registro_fernandez.stl',
    size: 3_200_000,
    type: 'model/stl',
    status: 'ready',
    uploadedAt: '2026-05-02T09:15:00Z',
    jaw: 'both',
    scanType: 'bite',
    patientName: 'Pedro Fernández Gil',
    patientId: 'PAT-012',
    url: '#',
  },
  {
    id: 'stl-005',
    name: 'scan_error_corrupted.obj',
    size: 1_200_000,
    type: 'model/obj',
    status: 'error',
    uploadedAt: '2026-05-01T14:30:00Z',
    jaw: 'unknown',
    scanType: 'other',
    error: 'Archivo corrupto o formato no válido',
    patientName: 'Lucía Torres Vega',
    patientId: 'PAT-015',
  },
]

const ALLOWED_TYPES = [
  { ext: '.stl', label: 'STL', color: 'sky' },
  { ext: '.obj', label: 'OBJ', color: 'violet' },
  { ext: '.ply', label: 'PLY', color: 'emerald' },
  { ext: '.dcm', label: 'DICOM', color: 'amber' },
  { ext: '.zip', label: 'ZIP', color: 'slate' },
]

const SCAN_TYPE_LABELS: Record<ScanType, string> = {
  upper_arch: 'Arcada superior',
  lower_arch: 'Arcada inferior',
  bite: 'Registro de mordida',
  model: 'Modelo de estudio',
  full_case: 'Caso completo',
  other: 'Otro',
}

const JAW_LABELS: Record<Jaw, string> = {
  upper: 'Superior',
  lower: 'Inferior',
  both: 'Ambas',
  unknown: 'Sin especificar',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function StatusBadge({ status }: { status: FileStatus }) {
  const map: Record<FileStatus, { label: string; color: string; icon: React.ReactNode }> = {
    ready: { label: 'Listo', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    uploading: { label: 'Subiendo', color: 'bg-sky-500/15 text-sky-400 border-sky-500/20', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    processing: { label: 'Procesando', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
    error: { label: 'Error', color: 'bg-red-500/15 text-red-400 border-red-500/20', icon: <AlertCircle className="w-3 h-3" /> },
  }
  const { label, color, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {icon} {label}
    </span>
  )
}

function FileTypeTag({ name }: { name: string }) {
  const ext = '.' + name.split('.').pop()?.toLowerCase()
  const found = ALLOWED_TYPES.find((t) => t.ext === ext)
  if (!found) return <span className="text-xs text-slate-500">{ext.toUpperCase()}</span>
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-500/10 text-sky-400',
    violet: 'bg-violet-500/10 text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    slate: 'bg-slate-600/30 text-slate-400',
  }
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colorMap[found.color]}`}>
      {found.label}
    </span>
  )
}

// ─── Upload form modal ────────────────────────────────────────────────────────

interface UploadFormProps {
  file: File
  onSubmit: (meta: { jaw: Jaw; scanType: ScanType; notes: string; orderId: string }) => void
  onCancel: () => void
}

function UploadForm({ file, onSubmit, onCancel }: UploadFormProps) {
  const [jaw, setJaw] = useState<Jaw>('upper')
  const [scanType, setScanType] = useState<ScanType>('upper_arch')
  const [notes, setNotes] = useState('')
  const [orderId, setOrderId] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="text-white font-semibold">Configurar archivo 3D</h3>
            <p className="text-slate-400 text-xs mt-0.5 truncate max-w-xs">{file.name}</p>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <Box className="w-8 h-8 text-sky-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>
            <FileTypeTag name={file.name} />
          </div>

          {/* Jaw */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Arcada</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(JAW_LABELS) as [Jaw, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setJaw(val)}
                  className={[
                    'py-1.5 rounded-lg text-xs font-medium border transition-all',
                    jaw === val
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Scan type */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Tipo de escaneo</label>
            <div className="relative">
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value as ScanType)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:border-sky-500 transition-colors"
              >
                {(Object.entries(SCAN_TYPE_LABELS) as [ScanType, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Número de orden <span className="text-slate-600 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ORD-2024-001"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Notas <span className="text-slate-600 font-normal">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Instrucciones especiales para el laboratorio..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSubmit({ jaw, scanType, notes, orderId })}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Subir archivo
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function STLUploadPage() {
  const [files, setFiles] = useState<STLFile[]>(MOCK_FILES)
  const [dragging, setDragging] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FileStatus | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setPendingFile(dropped)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setPendingFile(selected)
  }

  const handleUploadSubmit = (meta: { jaw: Jaw; scanType: ScanType; notes: string; orderId: string }) => {
    if (!pendingFile) return
    const newFile: STLFile = {
      id: `stl-${Date.now()}`,
      name: pendingFile.name,
      size: pendingFile.size,
      type: pendingFile.type || 'model/stl',
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date().toISOString(),
      jaw: meta.jaw,
      scanType: meta.scanType,
      notes: meta.notes || undefined,
      orderId: meta.orderId || undefined,
    }
    setFiles((prev) => [newFile, ...prev])
    setPendingFile(null)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: 'processing', progress: 100 } : f
          )
        )
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, status: 'ready', url: '#' } : f
            )
          )
        }, 2000)
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, progress } : f))
        )
      }
    }, 300)
  }

  const deleteFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const filtered = files.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      f.orderId?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || f.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: files.length,
    ready: files.filter((f) => f.status === 'ready').length,
    processing: files.filter((f) => f.status === 'processing' || f.status === 'uploading').length,
    errors: files.filter((f) => f.status === 'error').length,
    totalSize: files.reduce((a, f) => a + f.size, 0),
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Box className="w-5 h-5 text-emerald-400" />
            </div>
            Archivos 3D / STL
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestión de archivos de escáner dental · STL · OBJ · PLY · DICOM
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-sky-500/20"
        >
          <Upload className="w-4 h-4" />
          Subir archivo 3D
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total archivos', value: stats.total, color: 'text-slate-300' },
          { label: 'Listos', value: stats.ready, color: 'text-emerald-400' },
          { label: 'En proceso', value: stats.processing, color: 'text-amber-400' },
          { label: 'Tamaño total', value: formatBytes(stats.totalSize), color: 'text-sky-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer',
          'flex flex-col items-center justify-center gap-3 py-10 px-6 text-center',
          dragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : 'border-slate-700 bg-slate-800/30 hover:border-sky-500/50 hover:bg-sky-500/5',
        ].join(' ')}
      >
        <div className={['w-14 h-14 rounded-2xl flex items-center justify-center transition-colors', dragging ? 'bg-sky-500/20' : 'bg-slate-800'].join(' ')}>
          <Upload className={['w-7 h-7 transition-colors', dragging ? 'text-sky-400' : 'text-slate-500'].join(' ')} />
        </div>
        <div>
          <p className="text-white font-semibold text-lg">
            {dragging ? 'Suelta el archivo aquí' : 'Arrastra archivos 3D aquí'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            o haz clic para seleccionar desde tu equipo
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {ALLOWED_TYPES.map((t) => (
            <span key={t.ext} className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-400 text-xs font-mono">
              {t.ext}
            </span>
          ))}
        </div>
        <p className="text-slate-600 text-xs">
          Tamaño máximo: 500 MB por STL · 1 GB por ZIP
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.obj,.ply,.dcm,.zip"
          className="sr-only"
          onChange={handleFileSelect}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, paciente u orden..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-4 py-2.5 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FileStatus | 'all')}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="ready">Listos</option>
            <option value="processing">Procesando</option>
            <option value="uploading">Subiendo</option>
            <option value="error">Con error</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* File list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Box className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No se encontraron archivos</p>
            <p className="text-sm mt-1">Sube tu primer archivo 3D para comenzar</p>
          </div>
        )}

        {filtered.map((file) => (
          <div
            key={file.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-all group"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center shrink-0">
              {file.status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : file.status === 'processing' || file.status === 'uploading' ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <FileCheck className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-slate-200 truncate max-w-xs">{file.name}</span>
                <FileTypeTag name={file.name} />
                <StatusBadge status={file.status} />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {file.patientName && <span>👤 {file.patientName}</span>}
                {file.orderId && <span>📋 {file.orderId}</span>}
                <span>📦 {formatBytes(file.size)}</span>
                <span>🦷 {JAW_LABELS[file.jaw]}</span>
                <span>🔬 {SCAN_TYPE_LABELS[file.scanType]}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(file.uploadedAt)}
                </span>
              </div>
              {file.notes && <p className="text-xs text-slate-600 mt-1 italic">{file.notes}</p>}
              {file.error && <p className="text-xs text-red-400 mt-1">{file.error}</p>}

              {/* Upload progress bar */}
              {(file.status === 'uploading') && file.progress !== undefined && (
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(file.progress, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {file.status === 'ready' && file.url && (
                <>
                  <button className="p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all" title="Previsualizar">
                    <Eye className="w-4 h-4" />
                  </button>
                  <a href={file.url} className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" title="Descargar">
                    <Download className="w-4 h-4" />
                  </a>
                </>
              )}
              <button
                onClick={() => deleteFile(file.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload form modal */}
      {pendingFile && (
        <UploadForm
          file={pendingFile}
          onSubmit={handleUploadSubmit}
          onCancel={() => setPendingFile(null)}
        />
      )}
    </div>
  )
}
