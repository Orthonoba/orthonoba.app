import type { Metadata } from 'next'
import Link from 'next/link'


export const metadata: Metadata = { title: 'Pacientes CRM — Orthonoba' }

const SEGMENTS = [
  { label: 'Alto valor',    count: 89,  desc: 'LTV >€5.000',    color: 'text-emerald-400', border: 'border-emerald-500/30 bg-emerald-500/5' },
  { label: 'En riesgo',     count: 23,  desc: 'Sin visita >6m', color: 'text-red-400',     border: 'border-red-500/30 bg-red-500/5' },
  { label: 'Activos',       count: 487, desc: 'Visita <3 meses', color: 'text-sky-400',    border: 'border-sky-500/30 bg-sky-500/5' },
  { label: 'Reactivar',     count: 156, desc: 'Sin visita 3-6m', color: 'text-amber-400', border: 'border-amber-500/30 bg-amber-500/5' },
]

const PATIENTS = [
  { id: '1', name: 'María González',   clinic: 'Clínica Norte',  ltv: '€8.400', lastVisit: '2026-04-28', risk: 'low',  treatments: 4 },
  { id: '2', name: 'Carlos Martínez',  clinic: 'OrthoSmile',     ltv: '€3.200', lastVisit: '2026-03-15', risk: 'medium', treatments: 2 },
  { id: '3', name: 'Ana Fernández',    clinic: 'Dental Norte',   ltv: '€6.100', lastVisit: '2026-04-22', risk: 'low',  treatments: 3 },
  { id: '4', name: 'José Ramírez',     clinic: 'Sonrisa',        ltv: '€1.800', lastVisit: '2025-11-05', risk: 'high', treatments: 1 },
  { id: '5', name: 'Laura Sánchez',    clinic: 'Clínica Norte',  ltv: '€4.500', lastVisit: '2026-02-18', risk: 'medium', treatments: 2 },
  { id: '6', name: 'Pedro Jiménez',    clinic: 'OrthoSmile',     ltv: '€9.200', lastVisit: '2026-05-01', risk: 'low',  treatments: 5 },
]

const RISK_COLORS = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' }
const RISK_LABELS = { low: 'Activo', medium: 'Atencion', high: 'Riesgo' }

export default function PatientsCRMPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pacientes CRM</h1>
          <p className="text-slate-400 text-sm mt-0.5">Segmentación y análisis de retención de pacientes</p>
        </div>
        <Link href="/patients" className="text-sm text-sky-400 hover:text-sky-300 transition">
          Ver todos los pacientes →
        </Link>
      </div>

      {/* Segments */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SEGMENTS.map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.border}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-sm font-medium text-white mt-1">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Patients with CRM data */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Pacientes prioritarios</h2>
          <span className="text-xs text-slate-400">Ordenados por LTV</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Paciente</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Clínica</th>
                <th className="text-right px-5 py-3">LTV</th>
                <th className="text-center px-5 py-3 hidden sm:table-cell">Tratamientos</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">Última visita</th>
                <th className="text-center px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {PATIENTS.sort((a, b) => parseInt(b.ltv.replace(/\D/g, '')) - parseInt(a.ltv.replace(/\D/g, ''))).map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xs font-bold shrink-0">
                        {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{p.clinic}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-400">{p.ltv}</td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                    <span className="bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full text-xs font-bold">{p.treatments}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{p.lastVisit}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-medium ${RISK_COLORS[p.risk as keyof typeof RISK_COLORS]}`}>
                      {RISK_LABELS[p.risk as keyof typeof RISK_LABELS]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
