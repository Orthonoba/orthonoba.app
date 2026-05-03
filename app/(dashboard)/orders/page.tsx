'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Package, Search, Filter, Truck } from 'lucide-react'

const ORDERS = [
  { id: 'ORD-001', clinic: 'Clínica Dental Norte',  type: 'Prótesis Fija',    lab: 'ProDent Lab',        status: 'delivered',   delivery: '2026-04-20', tracking: 'ES12345678' },
  { id: 'ORD-002', clinic: 'OrthoSmile Barcelona',  type: 'Retenedor Essix',  lab: 'OrthoLab BCN',       status: 'shipped',     delivery: '2026-05-03', tracking: 'ES23456789' },
  { id: 'ORD-003', clinic: 'Dental Vanguard',        type: 'Férula Oclusal',   lab: 'TechDental Madrid',  status: 'processing',  delivery: '2026-05-07', tracking: null },
  { id: 'ORD-004', clinic: 'Sonrisa Perfecta',       type: 'Corona Zirconio',  lab: 'ProDent Lab',        status: 'pending',     delivery: '2026-05-12', tracking: null },
  { id: 'ORD-005', clinic: 'OralTech Bilbao',        type: 'Implante Completo',lab: 'ImplantLab Norte',   status: 'processing',  delivery: '2026-05-15', tracking: null },
  { id: 'ORD-006', clinic: 'Dental Excellence',      type: 'Prótesis Parcial', lab: 'OrthoLab BCN',       status: 'shipped',     delivery: '2026-05-04', tracking: 'ES34567890' },
  { id: 'ORD-007', clinic: 'Clínica Dental Norte',  type: 'Retenedor Essix',  lab: 'TechDental Madrid',  status: 'delivered',   delivery: '2026-04-18', tracking: 'ES45678901' },
  { id: 'ORD-008', clinic: 'OrthoSmile Barcelona',  type: 'Ortodoncia CAD',   lab: 'ProDent Lab',        status: 'pending',     delivery: '2026-05-20', tracking: null },
]

const STATUS_MAP = {
  pending:    { label: 'Pendiente',   color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  processing: { label: 'En proceso',  color: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
  shipped:    { label: 'Enviado',     color: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  delivered:  { label: 'Entregado',   color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
}

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = ORDERS.filter((o) => {
    const matchSearch = !search || o.id.includes(search) || o.clinic.toLowerCase().includes(search.toLowerCase()) || o.type.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Órdenes de Laboratorio</h1>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} órdenes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 w-60">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar orden..." className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none flex-1" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(STATUS_MAP).map(([k, v]) => {
          const count = ORDERS.filter((o) => o.status === k).length
          return (
            <button key={k} onClick={() => setStatusFilter(statusFilter === k ? '' : k)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${statusFilter === k ? v.color : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {v.label} <span className="font-bold">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Nº Orden</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Clínica</th>
                <th className="text-left px-5 py-3 font-medium">Tipo</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Laboratorio</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Entrega</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Tracking</th>
                <th className="text-right px-5 py-3 font-medium">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((o) => {
                const s = STATUS_MAP[o.status as keyof typeof STATUS_MAP]
                return (
                  <tr key={o.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="font-mono text-sky-400 font-medium">{o.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 hidden md:table-cell">{o.clinic}</td>
                    <td className="px-5 py-3.5 text-slate-200 font-medium">{o.type}</td>
                    <td className="px-5 py-3.5 text-slate-400 hidden lg:table-cell">{o.lab}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs hidden sm:table-cell">{o.delivery}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {o.tracking ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <Truck className="w-3.5 h-3.5" /> {o.tracking}
                        </div>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/orders/${o.id}`} className="text-xs text-sky-400 hover:text-sky-300 font-medium transition">Ver →</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
