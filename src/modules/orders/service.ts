import type {
  DentalOrder,
  OrderFile,
  CadDesign,
  PickupRequest,
  ProductionStage,
  QualityCheckResult,
  ShipmentTracking,
  OrderStatusHistory,
} from '@/src/types/orders'

export interface OrderFilters {
  status?: DentalOrder['status']
  type?: DentalOrder['type']
  labId?: string
  patientId?: string
  priority?: DentalOrder['priority']
  page?: number
  limit?: number
}

export interface IOrderService {
  findById(clinicId: string, orderId: string): Promise<DentalOrder | null>
  findAll(clinicId: string, filters?: OrderFilters): Promise<{ data: DentalOrder[]; total: number }>
  create(clinicId: string, data: Omit<DentalOrder, 'id' | 'createdAt' | 'updatedAt' | 'files' | 'items'>): Promise<DentalOrder>
  update(clinicId: string, orderId: string, data: Partial<DentalOrder>): Promise<DentalOrder>
  updateStatus(clinicId: string, orderId: string, status: DentalOrder['status'], reason?: string): Promise<DentalOrder>
  cancel(clinicId: string, orderId: string, reason: string): Promise<DentalOrder>

  // Files
  addFile(clinicId: string, orderId: string, file: Omit<OrderFile, 'id' | 'clinicId' | 'orderId'>): Promise<OrderFile>
  deleteFile(clinicId: string, orderId: string, fileId: string): Promise<void>

  // CAD
  saveCadDesign(clinicId: string, orderId: string, data: Omit<CadDesign, 'id' | 'clinicId' | 'orderId' | 'createdAt' | 'updatedAt'>): Promise<CadDesign>

  // Pickup
  requestPickup(clinicId: string, data: Omit<PickupRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<PickupRequest>
  updatePickupStatus(clinicId: string, pickupId: string, status: PickupRequest['status']): Promise<PickupRequest>

  // Production (lab-side)
  getProductionStages(orderId: string): Promise<ProductionStage[]>
  updateProductionStage(stageId: string, data: Partial<ProductionStage>): Promise<ProductionStage>

  // Quality check
  submitQualityCheck(orderId: string, data: Omit<QualityCheckResult, 'id' | 'checkedAt'>): Promise<QualityCheckResult>

  // Shipment
  addShipment(clinicId: string, orderId: string, data: Omit<ShipmentTracking, 'id' | 'clinicId' | 'orderId' | 'createdAt' | 'updatedAt'>): Promise<ShipmentTracking>

  // History
  getStatusHistory(orderId: string): Promise<OrderStatusHistory[]>
}
