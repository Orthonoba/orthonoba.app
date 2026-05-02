// ─── Pickup Job (Uber-style dental logistics) ─────────────────────────────────
// A PickupJob orchestrates the physical collection of dental work
// from a clinic and its delivery to a lab (or vice versa).

export type PickupJobDirection = 'clinic_to_lab' | 'lab_to_clinic'

export type PickupJobStatus =
  | 'waiting'               // created, no driver yet
  | 'searching'             // broadcasting to available drivers
  | 'driver_assigned'       // driver accepted the job
  | 'driver_en_route'       // driver heading to pickup location
  | 'driver_arrived'        // driver at pickup address
  | 'picked_up'             // package collected, heading to destination
  | 'arrived_destination'   // arrived at drop-off
  | 'delivered'             // successfully delivered
  | 'failed'                // failed attempt (no one home, wrong address)
  | 'reassigned'            // driver cancelled, searching again
  | 'cancelled'

// ─── Job Address (structured for routing) ────────────────────────────────────

export interface JobAddress {
  name: string              // "Clínica García" or "Lab Norte"
  street: string
  city: string
  postalCode: string
  countryCode: string
  lat?: number
  lng?: number
  accessNotes?: string      // "3rd floor, ring buzzer 2B"
}

// ─── Core Pickup Job ─────────────────────────────────────────────────────────

export interface PickupJob {
  id: string
  /** Formatted: 'JOB-2024-0001' */
  jobNumber: string
  clinicId: string
  labId?: string
  /** Order(s) included in this physical package */
  orderIds: string[]
  direction: PickupJobDirection
  status: PickupJobStatus

  // ── Origin (pickup from) ───────────────────────────────────────────────────
  pickupAddress: JobAddress
  pickupContactName: string
  pickupContactPhone: string
  pickupWindowStart: string       // ISO 8601
  pickupWindowEnd: string
  pickupInstructions?: string

  // ── Destination (deliver to) ───────────────────────────────────────────────
  deliveryAddress: JobAddress
  deliveryContactName: string
  deliveryContactPhone: string
  deliveryInstructions?: string

  // ── Driver ────────────────────────────────────────────────────────────────
  driverId?: string
  driverName?: string
  driverPhone?: string
  driverVehicleType?: DeliveryVehicleType
  driverLicensePlate?: string

  // ── Live tracking ─────────────────────────────────────────────────────────
  driverCurrentLat?: number
  driverCurrentLng?: number
  driverLastLocationAt?: string

  // ── Timing ────────────────────────────────────────────────────────────────
  requestedAt: string
  acceptedAt?: string
  estimatedPickupAt?: string
  actualPickupAt?: string
  estimatedDeliveryAt?: string
  actualDeliveryAt?: string

  // ── Proof of delivery ─────────────────────────────────────────────────────
  pickupPhotoUrl?: string
  deliveryPhotoUrl?: string
  recipientName?: string
  recipientSignatureUrl?: string

  // ── Package details ───────────────────────────────────────────────────────
  packageDescription?: string
  packageCount: number
  requiresRefrigeration: boolean
  fragileContents: boolean
  declaredValue?: number
  currency?: string

  // ── Notifications ─────────────────────────────────────────────────────────
  clinicNotifiedAt?: string
  labNotifiedAt?: string
  lastNotificationSentAt?: string

  notes?: string
  createdAt: string
  updatedAt?: string
}

// ─── Delivery Driver ──────────────────────────────────────────────────────────

export type DeliveryVehicleType = 'motorbike' | 'car' | 'van' | 'bicycle' | 'on-foot'
export type DeliveryDriverStatus = 'available' | 'on-job' | 'break' | 'offline' | 'suspended'

export interface DeliveryDriver {
  id: string
  /** References User.id */
  userId: string
  name: string
  phone: string
  email: string
  vehicleType: DeliveryVehicleType
  licensePlate?: string
  /** ISO 3166-1 alpha-2 codes of covered countries */
  coverageCountries: string[]
  /** Postal codes or area identifiers */
  coverageZones: string[]
  status: DeliveryDriverStatus
  rating: number              // 0–5
  totalDeliveries: number
  onTimeDeliveryRate: number  // 0–1
  isActive: boolean
  hiredAt: string
  lastActiveAt?: string
}

// ─── Driver Location Update (real-time) ──────────────────────────────────────

export interface DriverLocationUpdate {
  driverId: string
  jobId: string
  lat: number
  lng: number
  speed?: number              // km/h
  bearing?: number            // degrees 0–360
  accuracy?: number           // metres
  recordedAt: string
}

// ─── Delivery Route (multi-stop) ─────────────────────────────────────────────

export interface DeliveryRouteStop {
  sequence: number
  jobId: string
  type: 'pickup' | 'delivery'
  address: JobAddress
  eta?: string
  completedAt?: string
  status: 'pending' | 'completed' | 'skipped'
}

export interface DeliveryRoute {
  id: string
  driverId: string
  date: string                // ISO date 'YYYY-MM-DD'
  stops: DeliveryRouteStop[]
  totalDistanceKm?: number
  estimatedDurationMinutes?: number
  startedAt?: string
  completedAt?: string
  createdAt: string
}
