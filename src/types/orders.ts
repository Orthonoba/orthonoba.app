// ─── Dental Work Types ────────────────────────────────────────────────────────
// Professional nomenclature used by dental laboratories worldwide.

export type OrderType =
  // ── Clear Aligners & Retainers ─────────────────────────────────────────────
  | 'clear-aligner'           // Invisalign-style transparent aligner
  | 'essix-retainer'          // Thermoformed Essix retainer (post-ortho)
  | 'hawley-retainer'         // Wire + acrylic retainer
  | 'fixed-retainer'          // Bonded lingual wire retainer
  | 'aligner'                 // Generic aligner (legacy)
  | 'retainer'                // Generic retainer (legacy)

  // ── Sleep Medicine & Bruxism ───────────────────────────────────────────────
  | 'sleep-appliance-mad'     // Mandibular Advancement Device (OSA treatment)
  | 'sleep-appliance-trd'     // Tongue Retaining Device
  | 'night-guard-hard'        // Hard acrylic occlusal splint (Michigan/NTI)
  | 'night-guard-soft'        // Soft thermoplastic night guard
  | 'sport-mouthguard'        // Athletic mouthguard
  | 'mouthguard'              // Generic mouthguard (legacy)
  | 'sleep-apnea'             // Legacy sleep apnea

  // ── Fixed Prosthetics ──────────────────────────────────────────────────────
  | 'crown-zirconia'          // Full-contour monolithic zirconia crown
  | 'crown-emax'              // Lithium disilicate (IPS e.max)
  | 'crown-pfm'               // Porcelain-Fused-to-Metal
  | 'crown-all-ceramic'       // All-ceramic (general)
  | 'crown-temporary'         // PMMA / bis-acrylic provisional
  | 'crown'                   // Generic crown (legacy)
  | 'bridge-zirconia'         // Zirconia fixed bridge
  | 'bridge-pfm'              // PFM fixed bridge
  | 'bridge'                  // Generic bridge (legacy)
  | 'veneer-ceramic'          // Feldspathic / pressed ceramic veneer
  | 'veneer-composite'        // Composite veneer
  | 'veneer'                  // Generic veneer (legacy)
  | 'inlay-ceramic'           // Ceramic inlay/onlay
  | 'inlay-composite'         // Composite inlay/onlay
  | 'inlay-onlay'             // Generic inlay/onlay (legacy)

  // ── Implant Prosthetics ────────────────────────────────────────────────────
  | 'implant-crown-screw-retained'   // Screw-retained implant crown
  | 'implant-crown-cement-retained'  // Cement-retained implant crown
  | 'implant-bridge'                 // Multi-unit implant bridge
  | 'implant-bar'                    // Implant bar overdenture
  | 'implant-abutment-custom'        // Custom Ti or zirconia abutment
  | 'implant-crown'                  // Generic implant crown (legacy)

  // ── Removable Prosthetics ──────────────────────────────────────────────────
  | 'denture-full'            // Complete full denture
  | 'denture-partial'         // Partial removable denture (acrylic/metal)
  | 'overdenture'             // Implant or tooth-supported overdenture
  | 'denture-immediate'       // Immediate post-extraction denture

  // ── Surgical & Digital ────────────────────────────────────────────────────
  | 'surgical-guide-static'   // Static pilot/fully-guided implant guide
  | 'surgical-guide-dynamic'  // Dynamic navigation guide
  | 'surgical-guide'          // Generic surgical guide (legacy)
  | 'bone-reduction-guide'    // Alveoloplasty guide

  // ── Diagnostic & Study ────────────────────────────────────────────────────
  | 'study-model-plaster'     // Conventional stone/plaster model
  | 'study-model-3d'          // 3D-printed diagnostic model
  | 'wax-up'                  // Diagnostic wax-up
  | 'model'                   // Generic model (legacy)
  | 'splint'                  // Occlusal splint / deprogrammer

  // ── Other ─────────────────────────────────────────────────────────────────
  | 'other'

// ─── Workflow Status (full Uber Dental Logistics lifecycle) ───────────────────
//
//  CLINIC SIDE          TRANSIT              LAB SIDE            RETURN
//  draft → pending → pickup_requested → pickup_confirmed → pickup_in_transit
//  → in_lab → design → production → quality_check → approved
//  → dispatch_ready → shipped → out_for_delivery → delivered
//  (optionally: revision_requested → in_lab → ... → delivered)

export type OrderStatus =
  | 'draft'               // being assembled by clinic
  | 'pending'             // submitted, awaiting lab acknowledgement
  | 'pickup_requested'    // clinic requested physical pickup
  | 'pickup_confirmed'    // driver or lab confirmed pickup
  | 'pickup_in_transit'   // en route to lab
  | 'in_lab'              // received at lab, intake inspection
  | 'design'              // digital design / CAD phase
  | 'production'          // physical manufacturing
  | 'quality_check'       // QC inspection
  | 'approved'            // passed QC, ready to ship
  | 'dispatch_ready'      // packaged, driver assigned for return
  | 'shipped'             // dispatched via carrier
  | 'out_for_delivery'    // last-mile delivery to clinic
  | 'delivered'           // received by clinic
  | 'installed'           // fitted in patient (closes the loop)
  | 'revision_requested'  // clinic requested rework
  | 'on_hold'             // paused (missing info / patient no-show)
  | 'cancelled'

export type OrderPriority = 'normal' | 'urgent' | 'same-day'

// ─── Allowed status transitions ───────────────────────────────────────────────
// Key: current status → allowed next statuses

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft:               ['pending', 'cancelled'],
  pending:             ['pickup_requested', 'in_lab', 'on_hold', 'cancelled'],
  pickup_requested:    ['pickup_confirmed', 'on_hold', 'cancelled'],
  pickup_confirmed:    ['pickup_in_transit', 'pickup_requested', 'cancelled'],
  pickup_in_transit:   ['in_lab', 'on_hold'],
  in_lab:              ['design', 'production', 'revision_requested', 'on_hold', 'cancelled'],
  design:              ['production', 'revision_requested', 'on_hold'],
  production:          ['quality_check', 'revision_requested', 'on_hold'],
  quality_check:       ['approved', 'revision_requested'],
  approved:            ['dispatch_ready', 'shipped'],
  dispatch_ready:      ['shipped'],
  shipped:             ['out_for_delivery', 'delivered'],
  out_for_delivery:    ['delivered'],
  delivered:           ['installed', 'revision_requested'],
  installed:           [],
  revision_requested:  ['in_lab', 'on_hold', 'cancelled'],
  on_hold:             ['pending', 'in_lab', 'design', 'cancelled'],
  cancelled:           [],
}

// ─── File & CAD ───────────────────────────────────────────────────────────────

export type FileType = 'stl' | 'dicom' | 'jpg' | 'png' | 'obj' | 'ply' | 'pdf' | 'dcm' | 'zip' | 'niri'

export type CadSoftware =
  | 'exocad'
  | '3shape'
  | 'cerec'
  | 'dental-wings'
  | 'zirkonzahn'
  | 'blue-sky-plan'
  | 'materialise'
  | 'nemo-cad'
  | 'other'

export interface OrderFile {
  id: string
  orderId: string
  clinicId: string
  name: string
  type: FileType
  /** Storage URL (S3 / Supabase Storage / GCS) */
  url: string
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
  fileId: string
  workstationId?: string
  designNotes?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Order Line Items ─────────────────────────────────────────────────────────

export interface OrderItem {
  id: string
  orderId: string
  clinicId: string
  priceEntryId?: string
  description: string
  orderType: OrderType
  /** FDI tooth notation */
  tooth?: number
  shade?: string              // e.g. 'A1', 'A2', 'B1' (Vita shade guide)
  quantity: number
  unitPrice: number
  currency: string
  total: number
  notes?: string
}

// ─── Production Workflow ──────────────────────────────────────────────────────

export type ProductionStageType =
  | 'intake-inspection'   // initial model/scan check
  | 'scan'                // intraoral or desktop scanning
  | 'design-cad'          // CAD/CAM digital design
  | 'nesting'             // 3D print nesting / mill nesting
  | 'mill-print'          // milling or 3D printing
  | 'sintering'           // zirconia sintering oven
  | 'ceramics'            // porcelain layering / glazing
  | 'finishing'           // polishing, staining, final esthetics
  | 'try-in-check'        // fit check on articulator
  | 'quality-check'       // final QC inspection
  | 'packaging'           // sterilisation + packaging
  | 'dispatch'            // ready for collection

export type ProductionStageStatus = 'pending' | 'in-progress' | 'completed' | 'skipped' | 'blocked'

export interface ProductionStage {
  id: string
  orderId: string
  labId: string
  type: ProductionStageType
  status: ProductionStageStatus
  /** Sequence position in the workflow */
  sequence: number
  technicianId?: string
  workstationId?: string
  estimatedMinutes?: number
  startedAt?: string
  completedAt?: string
  notes?: string
  blockedReason?: string
}

// ─── Quality Control ──────────────────────────────────────────────────────────

export type QualityCheckOutcome = 'passed' | 'failed' | 'revision-needed'

export interface QualityCheckResult {
  id: string
  orderId: string
  labId: string
  checkedBy: string
  outcome: QualityCheckOutcome
  dimensions: boolean
  occlusion: boolean
  aesthetics: boolean
  materialIntegrity: boolean
  shade?: boolean
  margin?: boolean
  observations?: string
  photoUrls?: string[]
  checkedAt: string
}

// ─── Core Order Entity ────────────────────────────────────────────────────────

export interface DentalOrder {
  id: string
  /** Human-readable: 'ORD-2024-0001' */
  orderNumber: string
  clinicId: string
  labId?: string
  patientId: string
  caseId?: string             // links to DentalCase

  type: OrderType
  status: OrderStatus
  priority: OrderPriority

  items: OrderItem[]
  files: OrderFile[]
  cadDesign?: CadDesign
  productionStages: ProductionStage[]
  qualityCheck?: QualityCheckResult

  // Logistics
  pickupJobId?: string        // references PickupJob
  shipmentId?: string         // references ShipmentTracking

  // Dates
  dueDate?: string
  labReceivedAt?: string
  labCompletedAt?: string

  notes?: string
  labNotes?: string           // internal lab notes (not shown to clinic)
  createdAt: string
  updatedAt?: string
}

// ─── Shipment (Carrier-based return delivery) ─────────────────────────────────

export type ShipmentCarrier = 'correos' | 'dhl' | 'fedex' | 'ups' | 'seur' | 'mrw' | 'glovo' | 'stuart' | 'other'

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

// ─── Pickup Request (clinic-initiated collection request linked to an order) ──

export type PickupRequestStatus = 'pending' | 'scheduled' | 'picked_up' | 'cancelled'

export interface PickupRequest {
  id: string
  clinicId: string
  orderId: string
  status: PickupRequestStatus
  requestedAt: string
  scheduledAt?: string
  notes?: string
  /** References a PickupJob once a driver is assigned */
  pickupJobId?: string
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
  changedByRole: string
  reason?: string
  metadata?: Record<string, unknown>
  changedAt: string
}
