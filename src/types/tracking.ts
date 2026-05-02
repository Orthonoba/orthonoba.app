import type { UserRole } from '@/src/types/user'
import type { OrderStatus } from '@/src/types/orders'

// ─── Tracking Events ──────────────────────────────────────────────────────────
// Each event represents a significant state change or milestone in the order journey.
// The timeline is the ordered list of events for a given order.

export type TrackingEventType =
  // Order lifecycle
  | 'order_created'
  | 'order_submitted'
  | 'order_acknowledged'          // lab confirmed receipt of order
  | 'order_on_hold'
  | 'order_resumed'
  | 'order_cancelled'
  | 'order_completed'             // installed in patient

  // Pickup (clinic → lab)
  | 'pickup_requested'
  | 'pickup_driver_assigned'
  | 'pickup_driver_en_route'
  | 'pickup_driver_arrived'
  | 'pickup_completed'            // physical items collected
  | 'pickup_failed'

  // Lab intake
  | 'lab_received'                // lab logged the package arrival
  | 'lab_intake_ok'               // intake inspection passed
  | 'lab_intake_issue'            // problem found at intake

  // Production
  | 'production_scan'
  | 'production_design_started'
  | 'production_design_completed'
  | 'production_manufacturing_started'
  | 'production_manufacturing_completed'
  | 'production_stage_completed'  // generic stage done

  // Quality
  | 'qc_started'
  | 'qc_passed'
  | 'qc_failed'
  | 'revision_requested'
  | 'revision_completed'

  // Dispatch & delivery (lab → clinic)
  | 'dispatch_ready'
  | 'shipment_created'
  | 'shipment_in_transit'
  | 'shipment_out_for_delivery'
  | 'shipment_delivered'
  | 'delivery_driver_assigned'
  | 'delivery_driver_en_route'
  | 'delivery_completed'
  | 'delivery_failed'

  // Communications
  | 'notification_sent'
  | 'note_added'

// ─── Tracking Event ───────────────────────────────────────────────────────────

export interface TrackingEvent {
  id: string
  orderId: string
  clinicId: string
  labId?: string

  eventType: TrackingEventType
  /** Short human-readable title (for timeline display) */
  title: string
  /** Optional longer description */
  description?: string
  /** Physical location at event time */
  location?: string
  /** Geo coordinates for map display */
  coordinates?: { lat: number; lng: number }
  /** Extra context: driver name, stage name, carrier, etc. */
  metadata?: Record<string, unknown>

  /** The resulting order status after this event */
  resultingStatus: OrderStatus

  actorId: string
  actorRole: UserRole
  actorName?: string

  /** Whether this event should trigger a notification to clinic */
  notifyClinic: boolean
  /** Whether this event should trigger a notification to lab */
  notifyLab: boolean

  occurredAt: string
  createdAt: string
}

// ─── Order Timeline (full assembled view) ────────────────────────────────────

export interface OrderTimeline {
  orderId: string
  orderNumber: string
  clinicId: string
  labId?: string

  currentStatus: OrderStatus
  events: TrackingEvent[]

  /** Earliest possible completion based on lab's turnaround */
  estimatedCompletion?: string
  /** Latest acceptable delivery date */
  dueDate?: string

  /** Overall % progress (0–100), computed from stages */
  progressPercent: number

  lastUpdated: string
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export interface OrderTrackingKPIs {
  clinicId?: string
  labId?: string
  period: string

  totalOrders: number
  inTransit: number
  atLab: number
  inProduction: number
  readyToShip: number
  delivered: number
  withIssues: number

  avgTurnaroundDays: number
  onTimeDeliveryRate: number          // 0–1
  revisionRate: number                 // 0–1

  byStatus: Partial<Record<OrderStatus, number>>
  byType: Partial<Record<string, number>>
}
