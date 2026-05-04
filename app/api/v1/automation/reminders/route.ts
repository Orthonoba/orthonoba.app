import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { createReminderSchema } from '@/src/modules/automation/validators'
import { listReminders, saveReminder } from '@/src/modules/automation/automation-store'
import { dispatchDueReminders } from '@/src/services/automation/reminder-service'
import { ok, fail, paginated, HTTP_STATUS } from '@/src/types/api'
import type { SmartReminder } from '@/src/types/automation'

// GET /api/v1/automation/reminders
export const GET = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const { searchParams } = new URL(req.url)

  // ?dispatch=true — trigger dispatch of all due reminders (cron endpoint)
  if (searchParams.get('dispatch') === 'true' && session.role === 'super_admin') {
    const result = await dispatchDueReminders()
    return NextResponse.json(ok(result))
  }

  const data = await listReminders(tenant.clinicId)
  return NextResponse.json(paginated<SmartReminder>(data, data.length, 1, 100))
})

// POST /api/v1/automation/reminders — create ad-hoc reminder
export const POST = withTenant(async (req, { tenant, session }) => {
  if (!['super_admin', 'clinic_admin', 'doctor', 'staff'].includes(session.role)) {
    return NextResponse.json(fail('FORBIDDEN', 'Sin permiso.'), { status: HTTP_STATUS.FORBIDDEN })
  }
  const body = await req.json().catch(() => null)
  const parsed = createReminderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(fail('VALIDATION_ERROR', 'Datos inválidos.', parsed.error.flatten()), { status: HTTP_STATUS.VALIDATION_ERROR })
  }
  const reminder = await saveReminder({ ...parsed.data, clinicId: tenant.clinicId, status: 'scheduled', aiGenerated: false, createdAt: new Date().toISOString() })
  return NextResponse.json(ok(reminder), { status: 201 })
})
