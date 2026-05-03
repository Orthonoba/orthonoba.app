import { Download, FileText } from 'lucide-react'

const INVOICES = [
  { id: 'INV-2026-004', date: '2026-05-04', period: 'Mayo 2026',     amount: 14900, status: 'paid' },
  { id: 'INV-2026-003', date: '2026-04-04', period: 'Abril 2026',    amount: 14900, status: 'paid' },
  { id: 'INV-2026-002', date: '2026-03-04', period: 'Marzo 2026',    amount: 14900, status: 'paid' },
  { id: 'INV-2026-001', date: '2026-02-04', period: 'Febrero 2026',  amount: 14900, status: 'paid' },
  { id: 'INV-2025-012', date: '2026-01-04', period: 'Enero 2026',    amount: 14900, status: 'paid' },
  { id: 'INV-2025-011', date: '2025-12-04', period: 'Diciembre 2025', amount: 14900, status: 'paid' },
  { id: 'INV-2025-010', date: '2025-11-04', period: 'Noviembre 2025', amount: 14900, status: 'paid' },
  { id: 'INV-2025-009', date: '2025-10-04', period: 'Octubre 2025',  amount: 4900,  status: 'paid' },
  { id: 'INV-2025-008', date: '2025-09-04', period: 'Septiembre 2025',amount: 4900,  status: 'paid' },
  { id: 'INV-2025-007', date: '2025-08-04', period: 'Agosto 2025',   amount: 4900,  status: 'paid' },
]

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-400',
  overdue: 'bg-red-500/15 text-red-400',
}
const STATUS_LABELS: Record<string, string> = { paid: 'Pagada', pending: 'Pendiente', overdue: 'Vencida' }

const total = INVOICES.reduce((s, i) => s + i.amount, 0)

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Facturas</h1>
          <p className="text-slate-400 text-sm mt-0.5">{INVOICES.length} facturas emitidas</p>
        </div>
        <div className="flex gap-3">
          <input type="date" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500" />
          <input type="date" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500" />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Nº Factura</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Período</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Fecha</th>
                <th className="text-right px-5 py-3">Importe</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-right px-5 py-3">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="font-mono text-sky-400 text-sm">{inv.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 hidden sm:table-cell">{inv.period}</td>
                  <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell">{inv.date}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-white">
                    {(inv.amount / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[inv.status]}`}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-slate-400 hover:text-sky-400 transition p-1">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-600 bg-slate-700/20">
                <td colSpan={3} className="px-5 py-3.5 text-sm font-semibold text-slate-300">Total acumulado</td>
                <td className="px-5 py-3.5 text-right font-bold text-sky-400 text-base">
                  {(total / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
