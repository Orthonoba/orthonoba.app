import type { DentalOrder, OrderFile, PickupRequest, ProductionStage } from '@/src/types/orders'
import type { OrderFilters } from './service'

export interface IOrderRepository {
  findById(clinicId: string, id: string): Promise<DentalOrder | null>
  findAll(clinicId: string, filters?: OrderFilters): Promise<{ data: DentalOrder[]; total: number }>
  findByLab(labId: string, filters?: OrderFilters): Promise<{ data: DentalOrder[]; total: number }>
  create(data: Omit<DentalOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<DentalOrder>
  update(clinicId: string, id: string, data: Partial<DentalOrder>): Promise<DentalOrder>
  delete(clinicId: string, id: string): Promise<void>
}

export interface IOrderFileRepository {
  findByOrder(orderId: string): Promise<OrderFile[]>
  create(data: Omit<OrderFile, 'id'>): Promise<OrderFile>
  delete(orderId: string, fileId: string): Promise<void>
}

export interface IPickupRepository {
  findByClinic(clinicId: string): Promise<PickupRequest[]>
  findById(id: string): Promise<PickupRequest | null>
  create(data: Omit<PickupRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PickupRequest>
  update(id: string, data: Partial<PickupRequest>): Promise<PickupRequest>
}

export interface IProductionStageRepository {
  findByOrder(orderId: string): Promise<ProductionStage[]>
  update(id: string, data: Partial<ProductionStage>): Promise<ProductionStage>
}
