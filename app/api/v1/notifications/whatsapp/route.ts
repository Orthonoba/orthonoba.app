import { NextRequest, NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { sendWhatsAppSchema } from '@/src/modules/automation/validators'
import { getWhatsAppService } from '@/src/services/whatsapp/index'
import { saveWhatsAppMessage, updateWhatsAppStatus } from '@/src/modules/automation/automation-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import { z } from 'zod'

// POST /api/v1/notifications/whatsapp — send WhatsApp message
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = sendWhatsAppSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  const msg = await saveWhatsAppMessage({
    clinicId: tenant.clinicId,
    to: parsed.data.to,
    type: parsed.data.type,
    body: parsed.data.body,
    templateName: parsed.data.templateName,
    mediaUrl: parsed.data.mediaUrl,
    status: 'queued',
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
  })

  const wa = getWhatsAppService()
  let result

  if (parsed.data.type === 'template' && parsed.data.templateName) {
    result = await wa.sendTemplate(parsed.data.to, parsed.data.templateName, parsed.data.templateParams ?? [])
  } else if (parsed.data.type === 'media' && parsed.data.mediaUrl) {
    result = await wa.sendMedia(parsed.data.to, parsed.data.mediaUrl, parsed.data.caption)
  } else if (parsed.data.body) {
    result = await wa.sendText(parsed.data.to, parsed.data.body)
  } else {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Se requiere body o mediaUrl.'), { status: HTTP_STATUS.VALIDATION_ERROR })
  }

  await updateWhatsAppStatus(msg.id, result.success ? 'sent' : 'failed', result.messageId)

  if (!result.success) {
    return NextResponse.json(fail('SERVICE_UNAVAILABLE', result.error ?? 'WhatsApp no disponible.'), { status: HTTP_STATUS.SERVICE_UNAVAILABLE })
  }

  return NextResponse.json(ok({ messageId: msg.id, whatsappId: result.messageId }), { status: 201 })
})

// POST /api/v1/notifications/whatsapp/webhook — Meta webhook verification + event handling
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}
