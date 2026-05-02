// ─── Order Classification ─────────────────────────────────────────────────────

export type OrderType =
  | 'aligner'
  | 'retainer'
  | 'mouthguard'
  | 'sleep-apnea'
  | 'crown'
  | 'bridge'
  | 'implant-crown'
  | 'implant-bar'
  | 'denture-full'
  | 'denture-partial'
  | 'splint'
  | 'model'
  | 'surgical-guide'
  | 'veneer'
  | 'inlay-onlay'
  | 'other'

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'in-production'
  | 'quality-check'
  | 'shipped'
  | 'delivered'
  | 'revision-requested'
  | 'cancelled'

export type OrderPriority = 'normal' | 'urgent'

// ─── File & CAD ───────────────────────────────────────────────────────────────

export type FileType = 'stl' | 'dicom' | 'jpg' | 'png' | 'obj' | 'ply' | 'pdf' | 'dcm' | 'zip'

export type CadSoftware =
  | 'exocad'
  | '3shape'
  | 'cerec'
  | 'dental-wings'
  | 'zirkonzahn'
  | 'blue-sky-plan'
  | 'materialise'
  | 'other'

export interface OrderFile {
  id: string
  orderId: string
  clinicId: string
  name: string
  type: FileType
  /** Storage URL (S3 / Supabase Storage / GCS) */
  url: string
  /** File size in bytes */
  sizeBytes: number
  uploadedBy: string
  uploadedAt: string
}

export interface CadDesign {
  id: string
  orderId: string
  clinicId: string
  software: CadSoftware
  version?: string
  /** References OrderFile.id containing the CAD source file */
  fileId: string
  /** References LabWorkstation.id used for this design */
  workstationId?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Pickup / Logistics ───────────────────────────────────────────────────────

export type PickupStatus = 'pending' | 'confirmed' | 'in-transit' | 'picked-up' | 'cancelled'

export interface PickupRequest {
  id: string
  clinicId: string
  orderId?: string
  status: PickupStatus
  scheduledAt: string
  address: string
  contactName: string
  contactPhone: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Shipment Tracking ────────────────────────────────────────────────────────

export type ShipmentCarrier = 'correos' | 'dhl' | 'fedex' | 'ups' | 'seur' | 'mrw' | 'other'

export interface ShipmentTracking {
  id: string
  orderId: string
  clinicId: string
  carrier: ShipmentCarrier
  trackingNumber: string
  trackingUrl?: string
  status: 'pending' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'exception'
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Order Line Items ─────────────────────────────────────────────────────────

export interface OrderItem {
  id: string
  orderId: string
  clinicId: string
  /** References LabPriceEntry.id */
  priceEntryId?: string
  description: string
  orderType: OrderType
  tooth?: number
  quantity: number
  unitPrice: number
  currency: string
  total: number
  notes?: string
}

// ─── Production Workflow ──────────────────────────────────────────────────────

export type ProductionStageType =
  | 'scan'
  | 'design-cad'
  | 'mill-print'
  | 'sintering'
  | 'ceramics'
  | 'finishing'
  | 'quality-check'
  | 'packaging'
  | 'dispatch'

export type ProductionStageStatus = 'pending' | 'in-progress' | 'completed' | 'skipped'

export interface ProductionStage {
  id: string
  orderId: string
  labId: string
  type: ProductionStageType
  status: ProductionStageStatus
  /** Lab technician assigned */
  technicianId?: string
  /** Lab workstation used */
  workstationId?: string
  startedAt?: string
  completedAt?: string
  notes?: string
}

// ─── Quality Control ──────────────────────────────────────────────────────────

export type QualityCheckOutcome = 'passed' | 'failed' | 'revision-needed'

export interface QualityCheckResult {
  id: string
  orderId: string
  labId: string
  checkedBy: string
  outcome: QualityCheckOutcome
  dimensions?: boolean
  occlusion?: boolean
  aesthetics?: boolean
  materialIntegrity?: boolean
  observations?: string
  checkedAt: string
}

// ─── Core Order Entity ────────────────────────────────────────────────────────

export interface DentalOrder {
  id: string
  clinicId: string
  /** Lab assigned to manufacture this order */
  labId?: string
  patientId: string
  type: OrderType
  status: OrderStatus
  priority: OrderPriority
  items: OrderItem[]
  files: OrderFile[]
  cadDesign?: CadDesign
  pickup?: PickupRequest
  shipment?: ShipmentTracking
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Order Status History (audit trail) ──────────────────────────────────────

export interface OrderStatusHistory {
  id: string
  orderId: string
  from: OrderStatus
  to: OrderStatus
  changedBy: string
  reason?: string
  changedAt: string
}
