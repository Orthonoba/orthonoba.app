import { FlaskConical, Star, MapPin, Clock, Phone, Mail, Package } from 'lucide-react'

const LAB = {
  id: '1', name: 'ProDent Lab Madrid', city: 'Madrid', phone: '+34 912 345 678',
  email: 'info@prodentlab.es', address: 'Polígono Industrial Norte, Nave 12, Madrid',
  description: 'Laboratorio dental de alta tecnología con más de 20 años de experiencia. Especialistas en prótesis sobre implantes y zirconio mediante fresado CAD/CAM de última generación.',
  specialties: ['Prótesis Fija', 'Prótesis sobre Implante', 'Zirconio Multicapa', 'CAD/CAM', 'Composite Indirecto'],
  rating: 4.9, turnaround: { prosthesis: '5-7 días', retainer: '2-3 días', implant: '8-12 días' },
  stats: { totalOrders: 342, completedOrders: 328, revisionRate: 1.8, onTimeRate: 97.2 },
}

const ORDERS = [
  { id: 'ORD-001', clinic: 'Clínica Dental Norte',  type: 'Prótesis Fija',   status: 'delivered', date: '2026-04-20' },
  { id: 'ORD-004', clinic: 'Sonrisa Perfecta',       type: 'Corona Zirconio', status: 'pending',   date: '2026-05-12' },
  { id: 'ORD-008', clinic: 'OrthoSmile Barcelona',  type: 'Ortodoncia CAD',  status: 'processing', date: '2026-05-20' },
]

const STATUS_COLORS: Record<string, string> = {
  delivered:  'bg-emerald-500/15 text-emerald-400',
  pending:    'bg-amber-500/15 text-amber-400',
  processing: 'bg-sky-500/15 text-sky-400',
  shipped:    'bg-violet-500/15 text-violet-400',
}
const STATUS_LABELS: Record<string, string> = {
  delivered: 'Entregado', pending: 'Pendiente', processing: 'En proceso', shipped: 'Enviado',
}

const QUALITY_BARS = [
  { label: 'Tasa puntualidad', value: LAB.stats.onTimeRate,     color: 'bg-emerald-500' },
  { label: 'Sin revisiones',   value: 100 - LAB.stats.revisionRate, color: 'bg-sky-500' },
  { label: 'Satisfacción',     value: (LAB.rating / 5) * 100,   color: 'bg-violet-500' },
]

export default function LabDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
            <FlaskConical className="w-8 h-8 text-violet-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{LAB.name}</h1>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-0.5 rounded-full">ISO Certificado</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{LAB.city}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{LAB.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{LAB.email}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Math.round(LAB.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />)}
              <span className="text-sm text-slate-400 ml-1">{LAB.rating}/5.0</span>
            </div>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-2xl">{LAB.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specialties + Turnaround */}
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {LAB.specialties.map((s) => (
                <span key={s} className="bg-violet-500/15 text-violet-400 border border-violet-500/20 text-xs px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-sky-400" />Tiempos promedio</h2>
            <div className="space-y-2 text-sm">
              {Object.entries(LAB.turnaround).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 capitalize">{k}</span>
                  <span className="text-white font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Estadísticas de calidad</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Total órdenes',    value: LAB.stats.totalOrders },
              { label: 'Completadas',      value: LAB.stats.completedOrders },
              { label: 'Tasa revisión',    value: `${LAB.stats.revisionRate}%` },
              { label: 'A tiempo',         value: `${LAB.stats.onTimeRate}%` },
            ].map((s) => (
              <div key={s.label} className="bg-slate-700/40 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {QUALITY_BARS.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{b.label}</span><span className="font-medium text-white">{b.value.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order History */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-sky-400" />Historial de órdenes</h2>
          <div className="space-y-2">
            {ORDERS.map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sky-400 font-mono">{o.id}</p>
                  <p className="text-xs text-slate-400 truncate">{o.type} · {o.clinic}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{o.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
