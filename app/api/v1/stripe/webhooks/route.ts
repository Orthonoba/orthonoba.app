import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { verifyWebhookSignature, dispatchWebhookEvent } from '@/src/services/stripe/webhooks'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'

// Must be raw body — disable automatic body parsing
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(fail('UNAUTHORIZED', 'Missing Stripe signature.'), {
      status: HTTP_STATUS.UNAUTHORIZED,
    })
  }

  const payload = await req.text()

  let event
  try {
    event = verifyWebhookSignature(payload, signature)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature.'
    return NextResponse.json(fail('UNAUTHORIZED', `Webhook verification failed: ${message}`), {
      status: HTTP_STATUS.UNAUTHORIZED,
    })
  }

  try {
    await dispatchWebhookEvent(event)
    return NextResponse.json(ok({ received: true }))
  } catch (err) {
    console.error('[stripe:webhook] Handler error:', err)
    return NextResponse.json(fail('INTERNAL_ERROR', 'Webhook handler failed.'), {
      status: HTTP_STATUS.INTERNAL_ERROR,
    })
  }
}
