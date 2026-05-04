import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { verifyWebhookSignature, dispatchWebhookEvent } from '@/src/services/stripe/webhooks'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// Raw body required — disable automatic body parsing
export const runtime = 'nodejs'

// POST /api/v1/webhooks/stripe — Stripe webhook endpoint
// Register this URL in the Stripe Dashboard: https://dashboard.stripe.com/webhooks
// Events to enable:
//   customer.subscription.{created,updated,deleted,paused,resumed,trial_will_end}
//   invoice.{payment_succeeded,payment_failed,upcoming,finalized}
//   checkout.session.{completed,expired}
//   payment_intent.payment_failed
//   customer.{updated,deleted}
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(fail('UNAUTHORIZED', 'Missing Stripe-Signature header.'), {
      status: HTTP_STATUS.UNAUTHORIZED,
    })
  }

  // Must read as raw text — Stripe signature validates against original bytes
  const payload = await req.text()

  let event
  try {
    event = verifyWebhookSignature(payload, signature)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature.'
    return NextResponse.json(fail('UNAUTHORIZED', `Webhook signature verification failed: ${message}`), {
      status: HTTP_STATUS.UNAUTHORIZED,
    })
  }

  try {
    await dispatchWebhookEvent(event)
    return NextResponse.json(ok({ received: true, eventId: event.id, type: event.type }))
  } catch (err) {
    // Return 200 to Stripe anyway — prevents retries for handler errors
    console.error('[stripe:webhook] Handler threw for event', event.type, err)
    return NextResponse.json(fail('INTERNAL_ERROR', 'Webhook handler failed.'), {
      status: HTTP_STATUS.INTERNAL_ERROR,
    })
  }
}
