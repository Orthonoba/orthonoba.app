import Link from 'next/link'
import { CreditCard, FileText, Zap, Calendar, Tag, ArrowRight, ExternalLink, Shield } from 'lucide-react'
import { verifySession, getCurrentUser } from '@/src/lib/dal'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { PLANS } from '@/src/config/plans'
import type { Subscription } from '@/src/types/billing'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function fmtEur(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function statusLabel(s: Subscription['status']): { text: string; color: string } {
  const map: Record<Subscription['status'], { text: string; color: string }> = {
    active:             { text: 'Activa',          color: 'text-emerald-400' },
    trialing:           { text: 'En prueba',        color: 'text-sky-400' },
    past_due:           { text: 'Pago pendiente',   color: 'text-amber-400' },
    cancelled:          { text: 'Cancelada',        color: 'text-red-400' },
    expired:            { text: 'Expirada',         color: 'text-slate-400' },
    paused:             { text: 'Pausada',          color: 'text-violet-400' },
    incomplete:         { text: 'Incompleta',       color: 'text-amber-400' },
    incomplete_expired: { text: 'Expirada',         color: 'text-slate-400' },
    unpaid:             { text: 'Sin pagar',        color: 'text-red-400' },
  }
  return map[s] ?? { text: s, color: 'text-slate-400' }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BillingPage() {
  await verifySession() // ensures user is authenticated
  const user = await getCurrentUser()

  // Try to read live subscription from DB (falls back gracefully if DB not configured)
  const sub = user?.clinicId
    ? await getSubscriptionByTenantId(user.clinicId).catch(() => null)
    : null

  const planId  = (sub?.plan ?? 'growth') as keyof typeof PLANS
  const plan    = PLANS[planId]
  const cycle   = sub?.billingCycle ?? 'monthly'
  const price   = cycle === 'annual' ? plan.pricing.annualPerMonth : plan.pricing.monthly
  const nextBilling = sub?.currentPeriodEnd ? fmtDate(sub.currentPeriodEnd) : '2026-06-04'
  const status  = sub ? statusLabel(sub.status) : { text: 'Activa', color: 'text-emerald-400' }
  const hasDiscount = sub?.discountPercent && sub.discountPercent > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-0.5">Gestión de suscripción y facturación</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-linear-to-r from-sky-900/40 to-sky-800/20 border border-sky-500/30 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <span className="text-sky-400 text-sm font-medium uppercase tracking-wider">Plan actual</span>
              {sub && (
                <span className="bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs px-2 py-0.5 rounded-full font-mono">
                  Live
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
            <p className="text-slate-300 mt-1">
              {fmtEur(price)}/mes · Facturación {cycle === 'annual' ? 'anual' : 'mensual'}
              {hasDiscount && (
                <span className="ml-2 text-emerald-400 text-sm">−{sub!.discountPercent}%</span>
              )}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Próximo cobro: <span className="text-white font-medium ml-1">{nextBilling}</span>
              </span>
              <span className={status.color + ' font-medium'}>{status.text}</span>
            </div>
            {sub?.couponCode && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
                <Tag className="w-3.5 h-3.5" />
                Cupón aplicado: <span className="font-mono ml-1">{sub.couponCode}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href="/billing/plans"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
            >
              Gestionar plan <ArrowRight className="w-4 h-4" />
            </Link>
            {sub?.stripeSubscriptionId && (
              <form action="/api/v1/billing/portal" method="POST">
                <input type="hidden" name="returnUrl" value="/billing" />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 border border-slate-600 hover:border-sky-500 text-slate-300 hover:text-white font-medium px-5 py-2.5 rounded-xl text-sm transition"
                >
                  <ExternalLink className="w-4 h-4" /> Portal Stripe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Facturas totales',
            value: '—',
            icon: FileText,
          },
          {
            label: 'Próximo pago',
            value: fmtEur(price),
            icon: CreditCard,
          },
          {
            label: 'Descuento activo',
            value: hasDiscount ? `${sub!.discountPercent}%` : '—',
            icon: Tag,
          },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
            <s.icon className="w-5 h-5 text-sky-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs (visual only — real data below) */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
        {['Suscripción', 'Facturas', 'Historial'].map((t, i) => (
          <div
            key={t}
            className={['px-4 py-2 rounded-lg text-sm font-medium', i === 0 ? 'bg-sky-500 text-white' : 'text-slate-400'].join(' ')}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription details */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" /> Detalles de suscripción
          </h3>
          {[
            { label: 'Plan',           value: plan.name },
            { label: 'Estado',         value: status.text,                      color: status.color },
            { label: 'Ciclo',          value: cycle === 'annual' ? 'Anual' : 'Mensual' },
            { label: 'Precio/mes',     value: fmtEur(price) },
            { label: 'Próximo cobro',  value: nextBilling },
            ...(sub?.trialEnd ? [{ label: 'Trial hasta', value: fmtDate(sub.trialEnd), color: 'text-sky-400' }] : []),
            ...(sub?.cancelAtPeriodEnd ? [{ label: 'Cancela en', value: nextBilling, color: 'text-amber-400' }] : []),
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className={(row.color ?? 'text-white') + ' font-medium'}>{row.value}</span>
            </div>
          ))}
          {sub?.stripeSubscriptionId && (
            <p className="text-xs text-slate-600 font-mono pt-1 border-t border-slate-700/50 mt-2">
              {sub.stripeSubscriptionId}
            </p>
          )}
        </div>

        {/* Plan features */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" /> Incluido en {plan.name}
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300">
            {[
              { label: 'Usuarios',    value: plan.limits.maxUsers === -1 ? 'Ilimitados' : `${plan.limits.maxUsers}` },
              { label: 'Órdenes/mes', value: plan.limits.maxOrdersPerMonth === -1 ? 'Ilimitadas' : `${plan.limits.maxOrdersPerMonth}` },
              { label: 'Storage',     value: plan.limits.storageGb === -1 ? 'Ilimitado' : `${plan.limits.storageGb} GB` },
              { label: 'Tokens IA',   value: plan.limits.tokensPerMonth === -1 ? 'Ilimitados' : `${plan.limits.tokensPerMonth.toLocaleString('es')}/mes` },
              { label: 'CAD/Exocad',  value: plan.features.cad ? '✓' : '—' },
              { label: 'Marketing',   value: plan.features.marketingModule ? '✓' : '—' },
              { label: 'API',         value: plan.features.apiAccess ? '✓' : '—' },
              { label: 'SLA uptime',  value: plan.features.uptimeSla ? '99.9%' : '—' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">{f.label}</span>
                <span className={f.value === '—' ? 'text-slate-600' : 'text-white font-medium'}>{f.value}</span>
              </div>
            ))}
          </div>
          <Link
            href="/billing/plans"
            className="block text-center text-xs text-sky-400 hover:text-sky-300 mt-4 transition"
          >
            Ver todos los planes →
          </Link>
        </div>
      </div>

      {/* Invoice link */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm text-white font-medium">Historial de facturas</p>
            <p className="text-xs text-slate-400">Descarga PDFs de todas tus facturas Stripe</p>
          </div>
        </div>
        <Link
          href="/billing/invoices"
          className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 font-medium transition"
        >
          Ver facturas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
