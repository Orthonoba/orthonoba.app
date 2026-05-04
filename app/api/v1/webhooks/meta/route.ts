import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createLead, listLeads } from '@/src/modules/marketing/lead-store'
import { dispatchTrigger } from '@/src/services/automation/rule-engine'
import type { LeadSource } from '@/src/types/marketing'

// ─── Meta Lead Ads — field name aliases ──────────────────────────────────────
// Meta sends field_data as [{name, values[]}]. Names vary by form config.
const NAME_FIELDS  = ['full_name', 'name', 'nombre', 'first_name', 'nombre_completo']
const EMAIL_FIELDS = ['email', 'correo', 'email_address']
const PHONE_FIELDS = ['phone_number', 'phone', 'telefono', 'mobile', 'celular']

interface MetaFieldData {
  name: string
  values: string[]
}

interface MetaLeadChange {
  value: {
    leadgen_id?: string
    form_id?: string
    page_id?: string
    ad_id?: string
    ad_group_id?: string
    created_time?: number
    field_data?: MetaFieldData[]
  }
  field: string
}

interface MetaWebhookPayload {
  object: string
  entry: Array<{
    id: string
    time: number
    changes: MetaLeadChange[]
  }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractField(fieldData: MetaFieldData[], keys: string[]): string | undefined {
  for (const key of keys) {
    const found = fieldData.find((f) => f.name.toLowerCase() === key)
    if (found?.values[0]) return found.values[0].trim()
  }
  return undefined
}

/** Rough HMAC-SHA256 signature check against META_APP_SECRET. Skipped if secret not configured. */
async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) return true // dev mode — skip

  const signature = req.headers.get('x-hub-signature-256')
  if (!signature) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('')
  const expected = `sha256=${hex}`

  // Constant-time compare not strictly needed here (no timing oracle in webhook path), but safe
  return signature === expected
}

/** Determine LeadSource from Meta ad platform hint. */
function resolveSource(change: MetaLeadChange): LeadSource {
  const pageId = change.value.page_id ?? ''
  // Meta sends the same payload for FB and IG; without Graph API lookup we default to 'facebook'.
  // Future: fetch /leadgen_id?fields=ad_id,adset,campaign to get placement.
  return pageId ? 'facebook' : 'facebook'
}

// ─── TASK placeholder: post-lead automation ───────────────────────────────────

async function handleNewLead(
  clinicId: string,
  leadId: string,
  leadData: { name: string; email?: string; phone?: string; source: LeadSource }
): Promise<void> {
  try {
    // 1. Dispatch automation rules (lead.created trigger)
    await dispatchTrigger(clinicId, 'lead.created', leadId, 'lead', {
      name:   leadData.name,
      email:  leadData.email,
      phone:  leadData.phone,
      source: leadData.source,
    })

    // 2. Placeholder: AI lead scoring (already triggered inside createLead → refreshLeadScore)
    // 3. Placeholder: CRM stage assignment → updateLead(clinicId, leadId, { assignedTo: defaultAgent })
    // 4. Placeholder: WhatsApp welcome message → getWhatsAppService().sendTemplate(...)
    // 5. Placeholder: Email notification to clinic staff
    console.warn(`[meta-webhook] handleNewLead dispatched for lead ${leadId}`)
  } catch (err) {
    console.error('[meta-webhook] handleNewLead error:', err)
  }
}

// ─── GET — Meta webhook verification ─────────────────────────────────────────
// Meta sends: GET ?hub.mode=subscribe&hub.verify_token=XXX&hub.challenge=YYY

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.META_VERIFY_TOKEN
  if (!verifyToken) {
    console.error('[meta-webhook] META_VERIFY_TOKEN not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    console.warn(`[meta-webhook] Verification successful`)
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('[meta-webhook] Verification failed', { mode, tokenMatch: token === verifyToken })
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// ─── POST — Receive Meta Lead Ads events ─────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body (needed for signature verification)
  const rawBody = await req.text().catch(() => '')

  // 2. Verify request authenticity
  const valid = await verifySignature(req, rawBody)
  if (!valid) {
    console.error('[meta-webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse payload
  let payload: MetaWebhookPayload
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload
  } catch {
    console.error('[meta-webhook] Invalid JSON body')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Meta expects 200 quickly — process async, respond immediately
  if (payload.object !== 'page' && payload.object !== 'instagram') {
    // Not a lead ads event — acknowledge and ignore
    return NextResponse.json({ status: 'ignored' }, { status: 200 })
  }

  // 4. Derive clinic from env (multi-tenant mapping → future: lookup by page_id in DB)
  const clinicId = process.env.META_DEFAULT_CLINIC_ID ?? 'default'

  const results: { leadId: string; duplicate: boolean }[] = []

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'leadgen') continue

      const fieldData = change.value.field_data ?? []
      const name  = extractField(fieldData, NAME_FIELDS)
      const email = extractField(fieldData, EMAIL_FIELDS)
      const phone = extractField(fieldData, PHONE_FIELDS)

      if (!name) {
        console.error('[meta-webhook] Lead missing name, skipping', change.value.leadgen_id)
        continue
      }

      const source = resolveSource(change)

      // 5. Deduplication: skip if email already exists in this clinic
      if (email) {
        const existing = await listLeads(clinicId, { search: email, limit: 1 })
        if (existing.data.length > 0) {
          console.warn(`[meta-webhook] Duplicate lead (email: ${email}) — skipping`)
          results.push({ leadId: existing.data[0].id, duplicate: true })
          continue
        }
      }

      // 6. Create lead in store
      try {
        const lead = await createLead({
          clinicId,
          name,
          email,
          phone,
          source,
          status: 'new',
          notes: `Lead ID Meta: ${change.value.leadgen_id ?? 'unknown'} · Form: ${change.value.form_id ?? 'unknown'}`,
        })

        console.warn(`[meta-webhook] Lead created: ${lead.id} — ${name} (${email ?? phone ?? 'sin contacto'})`)
        results.push({ leadId: lead.id, duplicate: false })

        // 7. Fire automation (non-blocking)
        void handleNewLead(clinicId, lead.id, { name, email, phone, source })
      } catch (err) {
        console.error('[meta-webhook] Error creating lead:', err)
      }
    }
  }

  return NextResponse.json({ received: true, processed: results.length, results }, { status: 200 })
}
