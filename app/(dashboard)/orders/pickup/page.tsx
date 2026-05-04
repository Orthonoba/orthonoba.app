'use client'
import { useState } from 'react'
import {
  Truck, MapPin, Clock, Package, CheckCircle2, AlertCircle,
  Phone, User, Calendar, FileText, ChevronDown, Plus,
  Navigation, Star, RefreshCw,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type PickupStatus = 'scheduled' | 'en_route' | 'collected' | 'delivered' | 'cancelled'

interface PickupRequest {
  id: string
  orderId: string
  status: PickupStatus
  address: string
  city: string
  contactName: string
  contactPhone: string
  scheduledDate: string
  scheduledTime: string
  notes?: string
  driver?: { name: string; phone: string; rating: number }
  createdAt: string
  packages: number
  weight?: string
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_PICKUPS: PickupRequest[] = [
  {
    id: 'PKP-001',
    orderId: 'ORD-2024-012',
    status: 'en_route',
    address: 'Calle Mayor 42, 2º A',
    city: 'Madrid, 28013',
    contactName: 'Dr. Javier Moreno',
    contactPhone: '+34 612 345 678',
    scheduledDate: '2026-05-04',
    scheduledTime: '11:00 - 13:00',
    notes: 'Timbre 2ºA. Preguntar por recepción de clínica.',
    driver: { name: 'Carlos Mensajero', phone: '+34 698 765 432', rating: 4.8 },
    createdAt: '2026-05-03T09:00:00Z',
    packages: 2,
    weight: '1.2 kg',
  },
  {
    id: 'PKP-002',
    orderId: 'ORD-2024-009',
    status: 'scheduled',
    address: 'Av. Diagonal 458, Local B',
    city: 'Barcelona, 08006',
    contactName: 'Dra. Ana Castillo',
    contactPhone: '+34 633 987 654',
    scheduledDate: '2026-05-05',
    scheduledTime: '09:00 - 11:00',
    createdAt: '2026-05-03T14:30:00Z',
    packages: 1,
    weight: '0.5 kg',
  },
  {
    id: 'PKP-003',
    orderId: 'ORD-2024-003',
    status: 'delivered',
    address: 'C/ Sierpes 28, 1º',
    city: 'Sevilla, 41004',
    contactName: 'Dr. Pedro Ruiz',
    contactPhone: '+34 654 321 098',
    scheduledDate: '2026-05-02',
    scheduledTime: '10:00 - 12:00',
    driver: { name: 'María Conductora', phone: '+34 677 111 222', rating: 4.9 },
    createdAt: '2026-05-01T10:00:00Z',
    packages: 3,
    weight: '2.8 kg',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PickupStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  scheduled: {
    label: 'Programada',
    color: 'text-sky-400',
    bg: 'bg-sky-500/15 border-sky-500/20',
    icon: <Calendar className="w-3.5 h-3.5" />,
  },
  en_route: {
    label: 'En camino',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15 border-amber-500/20',
    icon: <Navigation className="w-3.5 h-3.5" />,
  },
  collected: {
    label: 'Recogido',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15 border-violet-500/20',
    icon: <Package className="w-3.5 h-3.5" />,
  },
  delivered: {
    label: 'Entregado',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15 border-emerald-500/20',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-400',
    bg: 'bg-red-500/15 border-red-500/20',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
}

function StatusBadge({ status }: { status: PickupStatus }) {
  const { label, color, bg, icon } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${color}`}>
      {icon} {label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}

// ─── New pickup form ─────────────────────────────────────────────────────────

interface NewPickupFormProps { onClose: () => void; onSubmit: (data: Partial<PickupRequest>) => void }

function NewPickupForm({ onClose, onSubmit }: NewPickupFormProps) {
  const [form, setForm] = useState({
    orderId: '', address: '', city: '', contactName: '',
    contactPhone: '', scheduledDate: '', scheduledTime: '', notes: '', packages: '1',
  })
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const times = ['08:00 - 10:00', '09:00 - 11:00', '10:00 - 12:00', '11:00 - 13:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00']

  const handleSubmit = () => {
    if (!form.address || !form.scheduledDate || !form.scheduledTime) return
    onSubmit({
      id: `PKP-${Date.now()}`,
      orderId: form.orderId || 'SIN-ORDEN',
      status: 'scheduled',
      address: form.address,
      city: form.city,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      notes: form.notes,
      packages: parseInt(form.packages) || 1,
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  const inputClass = 'w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
          <div>
            <h3 className="text-white font-semibold text-lg">Nueva solicitud de recogida</h3>
            <p className="text-slate-400 text-xs mt-0.5">El conductor llegará en el horario seleccionado</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nº de orden <span className="text-slate-600 font-normal">(opcional)</span></label>
              <input value={form.orderId} onChange={(e) => set('orderId', e.target.value)} placeholder="ORD-2024-001" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Paquetes</label>
              <input type="number" min="1" max="20" value={form.packages} onChange={(e) => set('packages', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Dirección de recogida *</label>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle Mayor 42, 2º A" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ciudad y código postal *</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Madrid, 28013" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nombre de contacto</label>
              <input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} placeholder="Dr. Nombre Apellidos" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Teléfono de contacto</label>
              <input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="+34 600 000 000" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fecha de recogida *</label>
              <input type="date" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} min={new Date().toISOString().split('T')[0]} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Horario *</label>
              <div className="relative">
                <select value={form.scheduledTime} onChange={(e) => set('scheduledTime', e.target.value)} className={inputClass + ' appearance-none pr-8'}>
                  <option value="">Selecciona horario</option>
                  {times.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Notas para el conductor <span className="text-slate-600 font-normal">(opcional)</span></label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Instrucciones de acceso, timbre, horario del portero..." className={inputClass + ' resize-none'} />
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-sky-300 flex gap-2">
            <Truck className="w-4 h-4 shrink-0 mt-0.5" />
            <p>El conductor contactará 30 minutos antes de la recogida. Asegúrate de que los materiales estén debidamente embalados y etiquetados.</p>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-700 sticky bottom-0 bg-slate-900">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!form.address || !form.scheduledDate || !form.scheduledTime}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" /> Solicitar recogida
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pickup card ─────────────────────────────────────────────────────────────

function PickupCard({ pickup, onCancel }: { pickup: PickupRequest; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[pickup.status]

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
      <div className="p-5">
        <div className="flex flex-wrap items-start gap-3 justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
              <Truck className={`w-5 h-5 ${cfg.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold text-sm">{pickup.id}</span>
                <StatusBadge status={pickup.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Orden: <span className="text-slate-300">{pickup.orderId}</span> · {pickup.packages} paquete{pickup.packages > 1 ? 's' : ''}
                {pickup.weight && ` · ${pickup.weight}`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-slate-200">{pickup.scheduledDate}</p>
            <p className="text-xs text-slate-400">{pickup.scheduledTime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2 text-slate-400">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
            <div>
              <p className="text-slate-200 text-xs font-medium">{pickup.address}</p>
              <p className="text-slate-500 text-xs">{pickup.city}</p>
            </div>
          </div>
          {pickup.contactName && (
            <div className="flex items-start gap-2 text-slate-400">
              <User className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
              <div>
                <p className="text-slate-200 text-xs font-medium">{pickup.contactName}</p>
                {pickup.contactPhone && (
                  <a href={`tel:${pickup.contactPhone}`} className="text-sky-400 text-xs hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {pickup.contactPhone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {pickup.driver && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200">{pickup.driver.name}</p>
              <div className="flex items-center gap-2">
                <a href={`tel:${pickup.driver.phone}`} className="text-xs text-sky-400 hover:underline">{pickup.driver.phone}</a>
                <span className="flex items-center gap-0.5 text-xs text-amber-400">
                  <Star className="w-3 h-3 fill-current" /> {pickup.driver.rating}
                </span>
              </div>
            </div>
            {pickup.status === 'en_route' && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" /> En camino
              </span>
            )}
          </div>
        )}

        {pickup.notes && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <FileText className="w-3 h-3" />
            {expanded ? 'Ocultar notas' : 'Ver notas del conductor'}
            <ChevronDown className={['w-3 h-3 transition-transform', expanded ? 'rotate-180' : ''].join(' ')} />
          </button>
        )}
        {expanded && pickup.notes && (
          <p className="mt-2 text-xs text-slate-400 bg-slate-700/30 rounded-lg px-3 py-2 italic">{pickup.notes}</p>
        )}
      </div>

      {pickup.status === 'scheduled' && (
        <div className="px-5 py-3 bg-slate-900/40 border-t border-slate-700/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Creada el {formatDate(pickup.createdAt)}
          </span>
          <button
            onClick={() => onCancel(pickup.id)}
            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-500/10"
          >
            Cancelar recogida
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PickupPage() {
  const [pickups, setPickups] = useState<PickupRequest[]>(MOCK_PICKUPS)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<PickupStatus | 'all'>('all')

  const handleSubmit = (data: Partial<PickupRequest>) => {
    setPickups((prev) => [data as PickupRequest, ...prev])
  }

  const handleCancel = (id: string) => {
    setPickups((prev) => prev.map((p) => p.id === id ? { ...p, status: 'cancelled' as PickupStatus } : p))
  }

  const filtered = filterStatus === 'all' ? pickups : pickups.filter((p) => p.status === filterStatus)

  const stats = {
    scheduled: pickups.filter((p) => p.status === 'scheduled').length,
    en_route: pickups.filter((p) => p.status === 'en_route').length,
    delivered: pickups.filter((p) => p.status === 'delivered').length,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            Solicitar recogida
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Programa la recogida de materiales dentales en tu clínica
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          Nueva recogida
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Programadas', value: stats.scheduled, color: 'text-sky-400', icon: <Calendar className="w-5 h-5 text-sky-400" /> },
          { label: 'En camino', value: stats.en_route, color: 'text-amber-400', icon: <Navigation className="w-5 h-5 text-amber-400" /> },
          { label: 'Entregadas', value: stats.delivered, color: 'text-emerald-400', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-700/60 flex items-center justify-center shrink-0">{s.icon}</div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          ['all', 'Todas'],
          ['scheduled', 'Programadas'],
          ['en_route', 'En camino'],
          ['collected', 'Recogidas'],
          ['delivered', 'Entregadas'],
          ['cancelled', 'Canceladas'],
        ] as [PickupStatus | 'all', string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={[
              'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
              filterStatus === val
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No hay recogidas en esta categoría</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-sky-400 hover:text-sky-300 transition-colors">
              + Solicitar primera recogida
            </button>
          </div>
        ) : (
          filtered.map((p) => (
            <PickupCard key={p.id} pickup={p} onCancel={handleCancel} />
          ))
        )}
      </div>

      {showForm && <NewPickupForm onClose={() => setShowForm(false)} onSubmit={handleSubmit} />}
    </div>
  )
}
