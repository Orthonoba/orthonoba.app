import type { UserRole } from '@/src/types/user'

// ─── Lab Capabilities ─────────────────────────────────────────────────────────

export type LabCapabilityType =
  | 'orthodontics'           // aligners, retainers
  | 'ceramics'               // crowns, veneers, ceramic bridges
  | 'implants'               // implant-supported prosthetics
  | 'cad-cam'                // digital design + milling
  | 'removable-prosthetics'  // full/partial dentures
  | 'surgical-guides'        // guided implant surgery
  | 'models'                 // study models, gypsum, resin
  | 'night-guards'           // bruxism splints
  | 'photography'            // digital photography + smile design

export interface LabCapability {
  type: LabCapabilityType
  /** Average calendar days from order to shipment */
  turnaroundDays: number
  acceptsRush: boolean
  /** Extra % cost for rush orders */
  rushSurchargePercent?: number
  notes?: string
}

// ─── Lab Profile ──────────────────────────────────────────────────────────────
// Extends the Clinic entity (type='lab') with production-specific data.

export interface LabProfile {
  id: string
  /** References Clinic.id where Clinic.type === 'lab' */
  clinicId: string
  capabilities: LabCapability[]
  certifications?: string[]
  /** ISO 3166-1 alpha-2 country codes for delivery coverage */
  deliveryCountries: string[]
  acceptsNewClients: boolean
  maxActiveOrders?: number
  averageRating?: number
  totalOrdersCompleted: number
  createdAt: string
  updatedAt?: string
}

// ─── Lab Pricing Catalog ──────────────────────────────────────────────────────

export interface LabPriceEntry {
  id: string
  labId: string
  /** References OrderType from orders.ts */
  orderType: string
  description: string
  basePrice: number
  currency: string
  rushMultiplier: number
  isActive: boolean
  updatedAt: string
}

// ─── Lab Technicians ──────────────────────────────────────────────────────────

export interface LabTechnician {
  id: string
  labId: string
  userId: string
  name: string
  email: string
  role: UserRole
  specialties: LabCapabilityType[]
  isActive: boolean
  joinedAt: string
}

// ─── Materials Inventory ──────────────────────────────────────────────────────

export type LabMaterialCategory =
  | 'resin'
  | 'ceramic'
  | 'zirconia'
  | 'metal-alloy'
  | 'composite'
  | 'silicone'
  | 'plaster'
  | 'wax'
  | 'polymer'
  | 'other'

export interface LabMaterial {
  id: string
  labId: string
  name: string
  category: LabMaterialCategory
  brand?: string
  /** Unit of measure: 'g' | 'ml' | 'unit' | 'sheet' */
  unit: string
  stockQuantity: number
  /** Triggers low-stock alert when stockQuantity falls below this */
  minStockQuantity: number
  costPerUnit: number
  currency: string
  supplier?: string
  lastRestockedAt?: string
  createdAt: string
  updatedAt?: string
}

export interface LabMaterialUsage {
  id: string
  labId: string
  materialId: string
  orderId: string
  quantityUsed: number
  recordedBy: string
  recordedAt: string
}

// ─── Workstations ─────────────────────────────────────────────────────────────

export type LabWorkstationType =
  | 'printer-3d-resin'
  | 'printer-3d-fdm'
  | 'mill-5axis'
  | 'mill-3axis'
  | 'scanner-intraoral'
  | 'scanner-desktop'
  | 'oven-ceramic'
  | 'oven-pressure'
  | 'sandblaster'
  | 'polisher'
  | 'other'

export interface LabWorkstation {
  id: string
  labId: string
  name: string
  type: LabWorkstationType
  manufacturer?: string
  model?: string
  serialNumber?: string
  /** CAD/CAM software: 'exocad' | '3shape' | 'cerec' | etc. */
  software?: string
  isActive: boolean
  purchasedAt?: string
  warrantyUntil?: string
  maintenanceDueAt?: string
  notes?: string
}

// ─── Production Scheduling ────────────────────────────────────────────────────

export type ProductionSlotStatus = 'scheduled' | 'in-progress' | 'completed' | 'paused' | 'cancelled'

export interface LabProductionSlot {
  id: string
  labId: string
  workstationId: string
  orderId: string
  technicianId?: string
  status: ProductionSlotStatus
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  notes?: string
}
