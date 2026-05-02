// ─── Email service interface ──────────────────────────────────────────────────
// Implementation: Resend (https://resend.com)
// Swap for SendGrid / SES by replacing send() only.

export interface EmailPayload {
  to: string | string[]
  subject: string
  /** HTML body */
  html: string
  /** Plain text fallback */
  text?: string
  from?: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export interface EmailResult {
  id: string
  success: boolean
  error?: string
}

export interface IEmailService {
  send(payload: EmailPayload): Promise<EmailResult>
}

// ─── Transactional email templates ───────────────────────────────────────────

export type EmailTemplate =
  | 'welcome'
  | 'invite-staff'
  | 'reset-password'
  | 'appointment-reminder'
  | 'order-status-update'
  | 'invoice-ready'
  | 'review-request'
  | 'subscription-trial-ending'
  | 'subscription-payment-failed'

export interface TemplateData extends Record<string, unknown> {
  clinicName?: string
  patientName?: string
  dentistName?: string
  appointmentDate?: string
  orderNumber?: string
  invoiceNumber?: string
  ctaUrl?: string
}

// ─── Mock email service (replace with Resend in production) ──────────────────

class MockEmailService implements IEmailService {
  async send(payload: EmailPayload): Promise<EmailResult> {
    console.warn('[email:mock] Would send email:', {
      to: payload.to,
      subject: payload.subject,
    })
    return { id: `mock-${Date.now()}`, success: true }
  }
}

export const emailService: IEmailService = new MockEmailService()
