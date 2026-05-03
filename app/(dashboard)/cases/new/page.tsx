'use client'

import { useState } from 'react'
import { Search, ChevronRight, ChevronLeft, Check, Upload, X, User, Shield, Layers, Cpu, FileText } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Paciente', icon: User },
  { id: 2, label: 'Tipo de Caso', icon: Layers },
  { id: 3, label: 'Especificaciones', icon: Cpu },
  { id: 4, label: 'Archivos', icon: Upload },
  { id: 5, label: 'Detalles Finales', icon: FileText },
]

const CASE_TYPES = [
  { id: 'protector', label: 'Protector Bucal', icon: Shield, desc: 'Protectores nocturnos y deportivos' },
  { id: 'essix', label: 'Retenedor Essix', icon: Layers, desc: 'Retenedores transparentes termoformados' },
  { id: 'ortodoncia', label: 'Ortodoncia', icon: Cpu, desc: 'Alineadores y aparatología ortodóncica' },
  { id: 'protesis', label: 'Prótesis', icon: User, desc: 'Prótesis fija, removible y total' },
  { id: 'otro', label: 'Otro', icon: FileText, desc: 'Otros casos y tratamientos especiales' },
]

const SPECS_BY_TYPE: Record<string, { label: string; type: string; options?: string[] }[]> = {
  protector: [
    { label: 'Material', type: 'select', options: ['EVA 3mm', 'EVA 4mm', 'Dual Layer', 'Acrílico'] },
    { label: 'Arcada', type: 'select', options: ['Superior', 'Inferior', 'Ambas'] },
    { label: 'Color', type: 'select', options: ['Transparente', 'Azul', 'Rojo', 'Verde'] },
    { label: 'Notas adicionales', type: 'textarea' },
  ],
  essix: [
    { label: 'Grosor', type: 'select', options: ['0.75mm', '1.0mm', '1.5mm', '2.0mm'] },
    { label: 'Arcada', type: 'select', options: ['Superior', 'Inferior', 'Ambas'] },
    { label: 'Recorte', type: 'select', options: ['Recto', 'Scalloped', 'Short'] },
    { label: 'Notas adicionales', type: 'textarea' },
  ],
  ortodoncia: [
    { label: 'Tipo', type: 'select', options: ['Alineadores Clear', 'Hawley', 'Fija Metálica', 'Estética'] },
    { label: 'Arcada', type: 'select', options: ['Superior', 'Inferior', 'Ambas'] },
    { label: 'Número de pasos', type: 'text' },
    { label: 'IPR requerido', type: 'select', options: ['No', 'Sí — indicar en plan'] },
    { label: 'Instrucciones especiales', type: 'textarea' },
  ],
  protesis: [
    { label: 'Tipo de prótesis', type: 'select', options: ['Total', 'Parcial Removible', 'Fija Unitaria', 'Puente', 'Implantosoportada'] },
    { label: 'Material', type: 'select', options: ['Acrílico', 'Zirconio', 'E-max', 'Metal-porcelana'] },
    { label: 'Arcada', type: 'select', options: ['Superior', 'Inferior', 'Ambas'] },
    { label: 'Tono dental (Vita)', type: 'text' },
    { label: 'Observaciones', type: 'textarea' },
  ],
  otro: [
    { label: 'Descripción del caso', type: 'textarea' },
    { label: 'Materiales requeridos', type: 'text' },
    { label: 'Instrucciones', type: 'textarea' },
  ],
}

const MOCK_PATIENTS = [
  { id: 'P-001', name: 'María González', age: 34, clinic: 'Clínica Providencia' },
  { id: 'P-002', name: 'Carlos Fuentes', age: 52, clinic: 'Dental Santiago Centro' },
  { id: 'P-003', name: 'Ana Martínez', age: 27, clinic: 'Dental Las Condes' },
  { id: 'P-004', name: 'Roberto Silva', age: 45, clinic: 'Clínica Providencia' },
  { id: 'P-005', name: 'Isabel Torres', age: 38, clinic: 'Dental Santiago Centro' },
]

export default function NewCasePage() {
  const [step, setStep] = useState(1)
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<(typeof MOCK_PATIENTS)[0] | null>(null)
  const [selectedType, setSelectedType] = useState('')
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<{ name: string; size: string; type: string }[]>([])
  const [details, setDetails] = useState({ priority: 'Media', dueDate: '', doctor: '', notes: '' })

  const filteredPatients = MOCK_PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    Array.from(e.target.files).forEach((f) => {
      setFiles((prev) => [...prev, { name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, type: f.name.split('.').pop()?.toUpperCase() || 'FILE' }])
    })
  }

  const canProceed = () => {
    if (step === 1) return !!selectedPatient
    if (step === 2) return !!selectedType
    return true
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Nuevo Caso</h1>
          <p className="text-slate-400 text-sm mt-1">Completa los pasos para crear un nuevo caso dental</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${step > s.id ? 'bg-emerald-500 border-emerald-500 text-white' : step === s.id ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${step === s.id ? 'text-sky-400' : step > s.id ? 'text-emerald-400' : 'text-slate-600'}`}>{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mt-[-12px] ${step > s.id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          {/* Step 1: Search Patient */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Buscar Paciente</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Buscar por nombre o ID de paciente…"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div className="space-y-2">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition ${selectedPatient?.id === p.id ? 'bg-sky-500/15 border-sky-500/50 text-sky-300' : 'bg-slate-900 border-slate-700 text-white hover:border-slate-500'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-500/20 flex items-center justify-center text-sm font-bold text-sky-400">
                        {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.clinic} · {p.age} años · {p.id}</p>
                      </div>
                    </div>
                    {selectedPatient?.id === p.id && <Check className="w-5 h-5 text-sky-400" />}
                  </button>
                ))}
              </div>
              {selectedPatient && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">
                  Paciente seleccionado: <strong>{selectedPatient.name}</strong>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Case Type Grid */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Tipo de Caso</h2>
              <p className="text-slate-400 text-sm">Selecciona el tipo de trabajo dental para <strong className="text-white">{selectedPatient?.name}</strong></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CASE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`flex flex-col items-start p-4 rounded-xl border transition ${selectedType === t.id ? 'bg-sky-500/15 border-sky-500/50' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${selectedType === t.id ? 'bg-sky-500/20' : 'bg-slate-800'}`}>
                      <t.icon className={`w-5 h-5 ${selectedType === t.id ? 'text-sky-400' : 'text-slate-400'}`} />
                    </div>
                    <p className={`font-semibold text-sm mb-1 ${selectedType === t.id ? 'text-sky-300' : 'text-white'}`}>{t.label}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Technical Specs */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Especificaciones Técnicas</h2>
              <p className="text-slate-400 text-sm">Tipo: <strong className="text-white">{CASE_TYPES.find((t) => t.id === selectedType)?.label}</strong></p>
              <div className="space-y-4">
                {(SPECS_BY_TYPE[selectedType] || []).map((field) => (
                  <div key={field.label}>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={specs[field.label] || ''}
                        onChange={(e) => setSpecs((s) => ({ ...s, [field.label]: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                      >
                        <option value="">Seleccionar…</option>
                        {field.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={specs[field.label] || ''}
                        onChange={(e) => setSpecs((s) => ({ ...s, [field.label]: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={specs[field.label] || ''}
                        onChange={(e) => setSpecs((s) => ({ ...s, [field.label]: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: File Upload */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Archivos del Caso</h2>
              <p className="text-slate-400 text-sm">Sube archivos STL, imágenes y radiografías del caso</p>
              <label className="block border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-sky-500 transition cursor-pointer">
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-white mb-1">Arrastra archivos aquí o haz clic</p>
                <p className="text-xs text-slate-500">STL, OBJ, PNG, JPG, DICOM · Máx. 50 MB por archivo</p>
                <input type="file" multiple accept=".stl,.obj,.png,.jpg,.jpeg,.dcm" onChange={handleFileAdd} className="hidden" />
              </label>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${f.type === 'STL' || f.type === 'OBJ' ? 'bg-violet-500/20 text-violet-400' : 'bg-sky-500/20 text-sky-400'}`}>
                          {f.type}
                        </span>
                        <div>
                          <p className="text-sm text-white font-medium">{f.name}</p>
                          <p className="text-xs text-slate-500">{f.size}</p>
                        </div>
                      </div>
                      <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Details */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Detalles Finales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Prioridad *</label>
                  <select
                    value={details.priority}
                    onChange={(e) => setDetails((d) => ({ ...d, priority: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                  >
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Fecha de Entrega *</label>
                  <input
                    type="date"
                    value={details.dueDate}
                    onChange={(e) => setDetails((d) => ({ ...d, dueDate: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Doctor Responsable</label>
                  <select
                    value={details.doctor}
                    onChange={(e) => setDetails((d) => ({ ...d, doctor: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 transition"
                  >
                    <option value="">Seleccionar doctor…</option>
                    <option>Dr. Paredes</option>
                    <option>Dra. Vargas</option>
                    <option>Dr. Ramos</option>
                    <option>Dra. Montero</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Notas para el Laboratorio</label>
                  <textarea
                    rows={4}
                    value={details.notes}
                    onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Instrucciones especiales, referencias de color, urgencias…"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition resize-none"
                  />
                </div>
              </div>
              {/* Summary */}
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl mt-2 space-y-2 text-sm">
                <p className="font-medium text-white mb-2">Resumen del Caso</p>
                <div className="flex justify-between text-slate-400"><span>Paciente</span><span className="text-white">{selectedPatient?.name}</span></div>
                <div className="flex justify-between text-slate-400"><span>Tipo</span><span className="text-white">{CASE_TYPES.find((t) => t.id === selectedType)?.label}</span></div>
                <div className="flex justify-between text-slate-400"><span>Prioridad</span><span className="text-white">{details.priority}</span></div>
                <div className="flex justify-between text-slate-400"><span>Archivos</span><span className="text-white">{files.length} archivo(s)</span></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            {step < 5 ? (
              <button
                onClick={() => canProceed() && setStep((s) => Math.min(5, s + 1))}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-6 py-2.5 rounded-lg transition">
                <Check className="w-4 h-4" /> Crear Caso
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
