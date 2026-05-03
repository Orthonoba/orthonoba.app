import Link from 'next/link'
import { CreditCard, FileText, History, Zap, Calendar, Tag, ArrowRight } from 'lucide-react'

const PLAN = { name: 'Growth', price: '€149', nextBilling: '2026-06-04', status: 'active', cycle: 'monthly', discount: null }

const STATS = [
  { label: 'Facturas totales',  value: '12',     icon: FileText },
  { label: 'Próximo pago',      value: '€149',   icon: CreditCard },
  { label: 'Descuento activo',  value: '—',      icon: Tag },
]

const RECENT_INVOICES = [
  { id: 'INV-2026-004', date: '2026-05-04', amount: '€149,00', status: 'paid' },
  { id: 'INV-2026-003', date: '2026-04-04', amount: '€149,00', status: 'paid' },
  { id: 'INV-2026-002', date: '2026-03-04', amount: '€149,00', status: 'paid' },
]

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-0.5">Gestión de suscripción y facturación</p>
      </div>

      {/* Current plan */}
      <div className="bg-gradient-to-r from-sky-900/40 to-sky-800/20 border border-sky-500/30 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <span className="text-sky-400 text-sm font-medium uppercase tracking-wider">Plan actual</span>
            </div>
            <h2 className="text-3xl font-bold text-white">{PLAN.name}</h2>
            <p className="text-slate-300 mt-1">{PLAN.price}/mes · Facturación {PLAN.cycle === 'monthly' ? 'mensual' : 'anual'}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              Próximo cobro: <span className="text-white font-medium">{PLAN.nextBilling}</span>
            </div>
          </div>
          <Link href="/billing/plans" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shrink-0">
            Gestionar plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <s.icon className="w-5 h-5 text-sky-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs content */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
        {['Suscripción', 'Facturas', 'Historial'].map((t, i) => (
          <div key={t} className={['px-4 py-2 rounded-lg text-sm font-medium', i === 0 ? 'bg-sky-500 text-white' : 'text-slate-400'].join(' ')}>
            {t}
          </div>
        ))}
      </div>

      {/* Subscription details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Detalles de suscripción</h3>
          {[
            { label: 'Plan',           value: PLAN.name },
            { label: 'Estado',         value: 'Activa', color: 'text-emerald-400' },
            { label: 'Ciclo',          value: 'Mensual' },
            { label: 'Precio',         value: PLAN.price + '/mes' },
            { label: 'Próximo cobro',  value: PLAN.nextBilling },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className={row.color ?? 'text-white font-medium'}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" /> Últimas facturas
          </h3>
          <div className="space-y-2">
            {RECENT_INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg text-sm">
                <div>
                  <p className="font-mono text-sky-400 text-xs">{inv.id}</p>
                  <p className="text-slate-400 text-xs">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{inv.amount}</span>
                  <span className="bg-emerald-500/15 text-emerald-400 text-xs px-2 py-0.5 rounded-full">Pagada</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/billing/invoices" className="block text-center text-xs text-sky-400 hover:text-sky-300 mt-3 transition">
            Ver todas las facturas →
          </Link>
        </div>
      </div>
    </div>
  )
}
