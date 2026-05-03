import type { SmartReminder, ReminderType, ReminderChannel } from '@/src/types/automation'
import { emailService } from '@/src/services/email/index'
import { getWhatsAppService, WA_TEMPLATES } from '@/src/services/whatsapp/index'
import { saveReminder, listPendingReminders, markReminderSent } from '@/src/modules/automation/automation-store'

// ─── Reminder builder ─────────────────────────────────────────────────────────

interface ReminderContext {
  clinicId: string
  entityType: SmartReminder['entityType']
  entityId: string
  channels: ReminderChannel[]
  metadata?: Record<string, unknown>
}

export async function scheduleReminder(
  type: ReminderType,
  ctx: ReminderContext,
  scheduledAt: Date,
  message: string,
  subject?: string
): Promise<SmartReminder> {
  const reminder: Omit<SmartReminder, 'id'> = {
    clinicId: ctx.clinicId,
    type,
    entityType: ctx.entityType,
    entityId: ctx.entityId,
    channels: ctx.channels,
    status: 'scheduled',
    scheduledAt: scheduledAt.toISOString(),
    subject,
    message,
    metadata: ctx.metadata,
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  }

  return saveReminder(reminder)
}

// ─── Appointment reminders ────────────────────────────────────────────────────

export async function scheduleAppointmentReminders(params: {
  clinicId: string
  appointmentId: string
  patientId: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  appointmentDate: Date
  clinicName: string
}) {
  const reminders: SmartReminder[] = []

  // 24h before
  const h24 = new Date(params.appointmentDate.getTime() - 24 * 3600_000)
  if (h24 > new Date()) {
    const channels: ReminderChannel[] = []
    if (params.patientPhone) channels.push('whatsapp')
    if (params.patientEmail) channels.push('email')

    const msg = WA_TEMPLATES.appointmentReminder({
      patientName: params.patientName,
      date: params.appointmentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: params.appointmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      clinicName: params.clinicName,
    })

    reminders.push(await scheduleReminder(
      'appointment_reminder',
      { clinicId: params.clinicId, entityType: 'appointment', entityId: params.appointmentId, channels,
        metadata: { patientPhone: params.patientPhone, patientEmail: params.patientEmail, patientName: params.patientName } },
      h24, msg,
      `Recordatorio de cita — ${params.clinicName}`
    ))
  }

  // 1h before
  const h1 = new Date(params.appointmentDate.getTime() - 1 * 3600_000)
  if (h1 > new Date() && params.patientPhone) {
    reminders.push(await scheduleReminder(
      'appointment_reminder',
      { clinicId: params.clinicId, entityType: 'appointment', entityId: params.appointmentId,
        channels: ['whatsapp'],
        metadata: { patientPhone: params.patientPhone, patientName: params.patientName } },
      h1,
      `Hola ${params.patientName} 👋, tu cita en *${params.clinicName}* es en 1 hora. ¡Te esperamos! 🦷`
    ))
  }

  // 24h after — follow-up
  const followUp = new Date(params.appointmentDate.getTime() + 24 * 3600_000)
  if (params.patientPhone) {
    reminders.push(await scheduleReminder(
      'appointment_follow_up',
      { clinicId: params.clinicId, entityType: 'appointment', entityId: params.appointmentId,
        channels: ['whatsapp'],
        metadata: { patientPhone: params.patientPhone, patientName: params.patientName } },
      followUp,
      WA_TEMPLATES.appointmentFollowUp({ patientName: params.patientName, clinicName: params.clinicName })
    ))
  }

  return reminders
}

// ─── Patient recall scheduler ─────────────────────────────────────────────────

export async function schedulePatientRecall(params: {
  clinicId: string
  patientId: string
  patientName: string
  patientPhone?: string
  patientEmail?: string
  clinicName: string
  monthsRecall: 6 | 12
}) {
  const recallDate = new Date()
  recallDate.setMonth(recallDate.getMonth() + params.monthsRecall)

  const channels: ReminderChannel[] = []
  if (params.patientPhone) channels.push('whatsapp')
  if (params.patientEmail) channels.push('email')

  return scheduleReminder(
    'treatment_recall',
    { clinicId: params.clinicId, entityType: 'patient', entityId: params.patientId, channels,
      metadata: { patientPhone: params.patientPhone, patientEmail: params.patientEmail, patientName: params.patientName } },
    recallDate,
    WA_TEMPLATES.treatmentRecall({ patientName: params.patientName, months: params.monthsRecall, clinicName: params.clinicName }),
    `Revisión ${params.monthsRecall === 6 ? 'semestral' : 'anual'} recomendada — ${params.clinicName}`
  )
}

// ─── Reminder dispatcher (called by cron / scheduler) ────────────────────────

export async function dispatchDueReminders(): Promise<{ sent: number; failed: number }> {
  const due = await listPendingReminders()
  let sent = 0, failed = 0

  for (const reminder of due) {
    const meta = (reminder.metadata ?? {}) as Record<string, string>

    try {
      for (const channel of reminder.channels) {
        if (channel === 'whatsapp' && meta.patientPhone) {
          const wa = getWhatsAppService()
          await wa.sendText(meta.patientPhone, reminder.message)
        } else if (channel === 'email' && meta.patientEmail) {
          await emailService.send({
            to: meta.patientEmail,
            subject: reminder.subject ?? 'Recordatorio de Orthonoba',
            html: `<p>${reminder.message.replace(/\n/g, '<br/>')}</p>`,
            text: reminder.message,
          })
        } else if (channel === 'sms' && meta.patientPhone) {
          // TODO: Twilio SMS
          console.warn('[reminder:sms] SMS not wired', { to: meta.patientPhone })
        }
      }

      await markReminderSent(reminder.id)
      sent++
    } catch (err) {
      console.error('[reminder:dispatch] Failed for', reminder.id, err)
      failed++
    }
  }

  return { sent, failed }
}
