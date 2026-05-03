import { Package, Truck, CheckCircle2, Clock, Circle } from 'lucide-react'

const ORDER = {
  id: 'ORD-002', clinic: 'OrthoSmile Barcelona', type: 'Retenedor Essix', lab: 'OrthoLab BCN',
  patient: 'Carlos Martínez López', doctor: 'Dra. Ana Rodríguez Alba',
  status: 'shipped', delivery: '2026-05-03', tracking: 'ES23456789',
  carrier: 'SEUR Express', shippedDate: '2026-04-30',
}

const TIMELINE = [
  { label: 'Orden recibida',          date: '2026-04-22 09:15', done: true },
  { label: 'En diseño CAD/CAM',       date: '2026-04-24 14:30', done: true },
  { label: 'Fresado / fabricación',   date: '2026-04-27 11:00', done: true },
  { label: 'Control de calidad',      date: '2026-04-29 16:45', done: true },
  { label: 'Enviado al cliente',      date: '2026-04-30 08:00', done: true },
  { label: 'Entregado en clínica',    date: '2026-05-03',        done: false },
]

const MATERIALS = [
  { name: 'Resina Essix Premium A',   qty: '2 láminas', lot: 'ESX-2024-087' },
  { name: 'Polímero termoplástico',   qty: '1 kg',      lot: 'PTH-2024-043' },
  { name: 'Adhesivo de sellado',      qty: '5 ml',      lot: 'ADH-2024-012' },
]

export default function OrderDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 text-sky-400" />
              <h1 className="text-2xl font-bold text-white">{ORDER.id}</h1>
              <span className="bg-violet-500/15 text-violet-400 border border-violet-500/20 text-xs font-medium px-2.5 py-1 rounded-full">Enviado</span>
            </div>
            <p className="text-slate-400 text-sm">{ORDER.type} · {ORDER.clinic}</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-3 text-sm">
              <span className="text-slate-500">Paciente: <span className="text-slate-300">{ORDER.patient}</span></span>
              <span className="text-slate-500">Doctor: <span className="text-slate-300">{ORDER.doctor}</span></span>
              <span className="text-slate-500">Lab: <span className="text-slate-300">{ORDER.lab}</span></span>
              <span className="text-slate-500">Entrega estimada: <span className="text-slate-300">{ORDER.delivery}</span></span>
            </div>
          </div>
          {ORDER.tracking && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-5 py-4 text-center">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Truck className="w-4 h-4" />
                <span className="text-xs font-medium">{ORDER.carrier}</span>
              </div>
              <p className="font-mono text-white font-bold text-sm">{ORDER.tracking}</p>
              <p className="text-xs text-slate-500 mt-1">Enviado {ORDER.shippedDate}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Timeline */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-5">Timeline de Producción</h2>
          <div className="space-y-1">
            {TIMELINE.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                  )}
                  {i < TIMELINE.length - 1 && (
                    <div className={`w-px h-8 mt-1 ${TIMELINE[i + 1]?.done ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <p className={`text-sm font-medium ${step.done ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                  <div className={`flex items-center gap-1 text-xs mt-0.5 ${step.done ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Clock className="w-3 h-3" /> {step.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Materiales utilizados</h2>
          <div className="space-y-3">
            {MATERIALS.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/40 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Cantidad: {m.qty} · Lote: <span className="font-mono">{m.lot}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
