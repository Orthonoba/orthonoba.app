import type { Clinic } from '@/src/types/clinic'
import type { LabProfile, LabTechnician, LabMaterial, LabWorkstation, LabPriceEntry, LabProductionSlot } from '@/src/types/lab'
import type { DentalOrder } from '@/src/types/orders'

// ─── Laboratory overview (clinic + profile combined) ─────────────────────────

export interface LaboratoryDetail {
  clinic: Clinic          // base entity (Clinic.type === 'lab')
  profile: LabProfile     // production-specific data
  technicians: LabTechnician[]
  workstations: LabWorkstation[]
  activePriceEntries: LabPriceEntry[]
}

export interface LabFilters {
  status?: Clinic['status']
  capability?: string
  country?: string
  acceptsNewClients?: boolean
  search?: string
  page?: number
  limit?: number
}

// ─── Service interface ────────────────────────────────────────────────────────

export interface ILaboratoryService {
  // Discovery
  findById(labId: string): Promise<LaboratoryDetail | null>
  findAll(filters?: LabFilters): Promise<{ data: LaboratoryDetail[]; total: number }>
  /** Find labs that can handle a specific order type */
  findCompatible(orderType: string, countryCode?: string): Promise<LaboratoryDetail[]>

  // Lab profile management (lab_admin scope)
  updateProfile(labId: string, data: Partial<LabProfile>): Promise<LabProfile>

  // Pricing catalog
  listPrices(labId: string): Promise<LabPriceEntry[]>
  setPrice(labId: string, data: Omit<LabPriceEntry, 'id' | 'updatedAt'>): Promise<LabPriceEntry>
  updatePrice(labId: string, priceId: string, data: Partial<LabPriceEntry>): Promise<LabPriceEntry>
  deactivatePrice(labId: string, priceId: string): Promise<void>

  // Technicians
  listTechnicians(labId: string): Promise<LabTechnician[]>
  addTechnician(labId: string, data: Omit<LabTechnician, 'id' | 'joinedAt'>): Promise<LabTechnician>
  removeTechnician(labId: string, technicianId: string): Promise<void>

  // Materials inventory
  listMaterials(labId: string): Promise<LabMaterial[]>
  addMaterial(labId: string, data: Omit<LabMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabMaterial>
  updateStock(labId: string, materialId: string, delta: number, reason?: string): Promise<LabMaterial>
  getLowStockAlerts(labId: string): Promise<LabMaterial[]>

  // Workstations
  listWorkstations(labId: string): Promise<LabWorkstation[]>
  addWorkstation(labId: string, data: Omit<LabWorkstation, 'id'>): Promise<LabWorkstation>
  updateWorkstation(labId: string, id: string, data: Partial<LabWorkstation>): Promise<LabWorkstation>

  // Production queue
  getProductionQueue(labId: string, date?: string): Promise<LabProductionSlot[]>
  scheduleOrder(labId: string, orderId: string, workstationId: string, startsAt: string): Promise<LabProductionSlot>
  updateSlotStatus(labId: string, slotId: string, status: LabProductionSlot['status']): Promise<LabProductionSlot>

  // Active orders view (for lab dashboard)
  getActiveOrders(labId: string): Promise<DentalOrder[]>
  getOrderKPIs(labId: string): Promise<{
    pending: number
    inProduction: number
    qualityCheck: number
    shipped: number
    avgTurnaroundDays: number
  }>
}
