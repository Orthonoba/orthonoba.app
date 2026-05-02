import type { LabProfile, LabTechnician, LabMaterial, LabWorkstation, LabProductionSlot } from '@/src/types/lab'

export interface ILabService {
  // Profile
  getProfile(labId: string): Promise<LabProfile | null>
  upsertProfile(labId: string, data: Partial<LabProfile>): Promise<LabProfile>

  // Technicians
  listTechnicians(labId: string): Promise<LabTechnician[]>
  addTechnician(labId: string, data: Omit<LabTechnician, 'id' | 'joinedAt'>): Promise<LabTechnician>
  removeTechnician(labId: string, technicianId: string): Promise<void>

  // Materials
  listMaterials(labId: string): Promise<LabMaterial[]>
  addMaterial(labId: string, data: Omit<LabMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabMaterial>
  updateMaterialStock(labId: string, materialId: string, quantity: number): Promise<LabMaterial>
  getLowStockAlerts(labId: string): Promise<LabMaterial[]>

  // Workstations
  listWorkstations(labId: string): Promise<LabWorkstation[]>
  addWorkstation(labId: string, data: Omit<LabWorkstation, 'id'>): Promise<LabWorkstation>
  updateWorkstation(labId: string, workstationId: string, data: Partial<LabWorkstation>): Promise<LabWorkstation>

  // Production scheduling
  getProductionSchedule(labId: string, date: string): Promise<LabProductionSlot[]>
  scheduleProduction(data: Omit<LabProductionSlot, 'id'>): Promise<LabProductionSlot>
  updateSlotStatus(slotId: string, status: LabProductionSlot['status']): Promise<LabProductionSlot>
}
