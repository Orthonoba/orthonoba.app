import type { WhatsAppMessage } from '@/src/types/automation'

// ─── WhatsApp Business API adapter ───────────────────────────────────────────
// Production: set WHATSAPP_TOKEN + WHATSAPP_PHONE_ID (Meta Cloud API)
// Fallback: MockWhatsAppService logs to console

export interface WhatsAppSendResult {
  messageId?: string
  success: boolean
  error?: string
}

export interface IWhatsAppService {
  sendText(to: string, body: string, metadata?: Record<string, string>): Promise<WhatsAppSendResult>
  sendTemplate(to: string, templateName: string, params: string[], languageCode?: string): Promise<WhatsAppSendResult>
  sendMedia(to: string, mediaUrl: string, caption?: string): Promise<WhatsAppSendResult>
}

// ─── Meta Cloud API implementation ───────────────────────────────────────────

class MetaWhatsAppService implements IWhatsAppService {
  private readonly token: string
  private readonly phoneId: string
  private readonly baseUrl: string

  constructor(token: string, phoneId: string) {
    this.token = token
    this.phoneId = phoneId
    this.baseUrl = `https://graph.facebook.com/v19.0/${phoneId}/messages`
  }

  private async post(payload: unknown): Promise<WhatsAppSendResult> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json() as { messages?: { id: string }[]; error?: { message: string } }

    if (!res.ok || data.error) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  }

  async sendText(to: string, body: string): Promise<WhatsAppSendResult> {
    return this.post({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body, preview_url: false },
    })
  }

  async sendTemplate(
    to: string,
    templateName: string,
    params: string[],
    languageCode = 'es'
  ): Promise<WhatsAppSendResult> {
    return this.post({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: params.length > 0
          ? [{
              type: 'body',
              parameters: params.map((text) => ({ type: 'text', text })),
            }]
          : [],
      },
    })
  }

  async sendMedia(to: string, mediaUrl: string, caption?: string): Promise<WhatsAppSendResult> {
    return this.post({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: mediaUrl, ...(caption ? { caption } : {}) },
    })
  }
}

// ─── Mock service (dev/staging) ───────────────────────────────────────────────

class MockWhatsAppService implements IWhatsAppService {
  async sendText(to: string, body: string): Promise<WhatsAppSendResult> {
    console.warn('[whatsapp:mock] sendText', { to, body: body.slice(0, 80) })
    return { success: true, messageId: `mock-${Date.now()}` }
  }

  async sendTemplate(to: string, templateName: string, params: string[]): Promise<WhatsAppSendResult> {
    console.warn('[whatsapp:mock] sendTemplate', { to, templateName, params })
    return { success: true, messageId: `mock-${Date.now()}` }
  }

  async sendMedia(to: string, mediaUrl: string): Promise<WhatsAppSendResult> {
    console.warn('[whatsapp:mock] sendMedia', { to, mediaUrl })
    return { success: true, messageId: `mock-${Date.now()}` }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _service: IWhatsAppService | null = null

export function getWhatsAppService(): IWhatsAppService {
  if (_service) return _service
  const token   = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  _service = token && phoneId
    ? new MetaWhatsAppService(token, phoneId)
    : new MockWhatsAppService()
  return _service
}

// ─── Dental message templates ─────────────────────────────────────────────────

export const WA_TEMPLATES = {
  appointmentReminder: (params: { patientName: string; date: string; time: string; clinicName: string }) =>
    `Hola ${params.patientName} 👋, te recordamos tu cita en *${params.clinicName}* el *${params.date}* a las *${params.time}*.\n\nSi necesitas cambiarla, responde a este mensaje o llámanos. ¡Te esperamos! 🦷`,

  appointmentFollowUp: (params: { patientName: string; clinicName: string }) =>
    `Hola ${params.patientName}, esperamos que te encuentres bien tras tu visita en *${params.clinicName}* 😊\n\nSi tienes alguna duda o molestia, no dudes en escribirnos. ¡Gracias por confiar en nosotros!`,

  treatmentRecall: (params: { patientName: string; months: number; clinicName: string }) =>
    `Hola ${params.patientName} 👋, ¡han pasado *${params.months} meses* desde tu última visita!\n\nEn *${params.clinicName}* te recomendamos una revisión preventiva. Pide tu cita respondiendo a este mensaje. 🦷✨`,

  leadFollowUp: (params: { name: string; treatment: string; clinicName: string }) =>
    `Hola ${params.name} 👋, soy del equipo de *${params.clinicName}*.\n\nVi que te interesó información sobre *${params.treatment}*. ¿Tienes alguna pregunta? Estaré encantado/a de ayudarte 😊`,

  reviewRequest: (params: { patientName: string; reviewUrl: string; clinicName: string }) =>
    `Hola ${params.patientName} 😊, en *${params.clinicName}* tu opinión es muy importante para nosotros.\n\n¿Podrías dejarnos una reseña de 30 segundos? 🌟\n\n${params.reviewUrl}\n\n¡Gracias de antemano!`,

  orderReady: (params: { clinicName: string; orderNumber: string }) =>
    `✅ Tu pedido *${params.orderNumber}* de *${params.clinicName}* está listo para su instalación.\n\nContacta con nosotros para coordinar tu próxima cita.`,

  birthdayGreeting: (params: { patientName: string; clinicName: string; offerUrl?: string }) =>
    `🎂 ¡Feliz cumpleaños, ${params.patientName}! 🎉\n\nEl equipo de *${params.clinicName}* te desea un día increíble.\n\nComo regalo, tienes un 15% de descuento en tu próxima visita este mes.${params.offerUrl ? `\n\n${params.offerUrl}` : ''}`,
}
