import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getSubscriptionByTenantId } from '@/src/modules/billing/subscription-store'
import { listStripeInvoices, getUpcomingInvoice } from '@/src/services/stripe/billing'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// GET /api/v1/billing — current subscription + recent invoices
export const GET = withTenant(async (_req, { tenant, session }) => {
  const canView = ['super_admin', 'clinic_admin', 'lab_admin'].includes(session.role)
  if (!canView) {
    return NextResponse.json(fail('FORBIDDEN', 'No tienes permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }

  const subscription = await getSubscriptionByTenantId(tenant.clinicId)

  let stripeInvoices = null
  let upcomingInvoice = null

  if (subscription?.stripeCustomerId && subscription.stripeSubscriptionId) {
    try {
      const [invoicesResult, upcomingResult] = await Promise.allSettled([
        listStripeInvoices(subscription.stripeCustomerId, 6),
        getUpcomingInvoice(subscription.stripeCustomerId, subscription.stripeSubscriptionId),
      ])

      if (invoicesResult.status === 'fulfilled') {
        stripeInvoices = invoicesResult.value.data.map((inv) => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          amountPaid: inv.amount_paid,
          amountDue: inv.amount_due,
          currency: inv.currency,
          periodStart: new Date(inv.period_start * 1000).toISOString(),
          periodEnd: new Date(inv.period_end * 1000).toISOString(),
          paidAt: inv.status_transitions.paid_at
            ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
            : null,
          hostedUrl: inv.hosted_invoice_url,
          pdfUrl: inv.invoice_pdf,
        }))
      }

      if (upcomingResult.status === 'fulfilled') {
        upcomingInvoice = {
          amountDue: upcomingResult.value.amount_due,
          currency: upcomingResult.value.currency,
          nextPaymentAttempt: upcomingResult.value.next_payment_attempt
            ? new Date(upcomingResult.value.next_payment_attempt * 1000).toISOString()
            : null,
        }
      }
    } catch {
      // Stripe unavailable — return subscription data without invoice details
    }
  }

  return NextResponse.json(
    ok({
      subscription,
      recentInvoices: stripeInvoices,
      upcomingInvoice,
    })
  )
})
