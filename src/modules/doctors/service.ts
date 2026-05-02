import type { DoctorProfile, DentistSpecialty, DoctorClinicAffiliation, DoctorAvailabilitySlot } from '@/src/types/doctor'
import type { User } from '@/src/types/user'

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateDoctorProfileInput {
  userId: string
  clinicId: string
  specialties: DentistSpecialty[]
  licenseNumber: string
  licenseCountry: string
  medicalCollegeName?: string
  graduationYear?: number
  consultationDays?: DoctorProfile['consultationDays']
  consultationStartTime?: string
  consultationEndTime?: string
  avgAppointmentMinutes?: number
  maxDailyAppointments?: number
  languages?: string[]
  bio?: string
}

export type UpdateDoctorProfileInput = Partial<
  Omit<CreateDoctorProfileInput, 'userId' | 'clinicId'>
>

export interface DoctorFilters {
  specialty?: DentistSpecialty
  isAcceptingNewPatients?: boolean
  search?: string
  page?: number
  limit?: number
}

// ─── Service interface ────────────────────────────────────────────────────────

export interface IDoctorService {
  // Profile
  getProfile(clinicId: string, userId: string): Promise<DoctorProfile | null>
  getProfileById(clinicId: string, profileId: string): Promise<DoctorProfile | null>
  listByClinic(clinicId: string, filters?: DoctorFilters): Promise<{ data: DoctorProfile[]; total: number }>
  createProfile(data: CreateDoctorProfileInput): Promise<DoctorProfile>
  updateProfile(clinicId: string, profileId: string, data: UpdateDoctorProfileInput): Promise<DoctorProfile>
  deactivate(clinicId: string, profileId: string): Promise<void>

  // User account + profile (atomic)
  createDoctorAccount(clinicId: string, userData: Pick<User, 'name' | 'email' | 'phone'>, profileData: Omit<CreateDoctorProfileInput, 'userId' | 'clinicId'>): Promise<{ user: User; profile: DoctorProfile }>

  // Multi-clinic affiliations
  addAffiliation(data: Omit<DoctorClinicAffiliation, 'id'>): Promise<DoctorClinicAffiliation>
  listAffiliations(doctorUserId: string): Promise<DoctorClinicAffiliation[]>

  // Availability
  getAvailability(clinicId: string, doctorUserId: string, date: string): Promise<DoctorAvailabilitySlot[]>
  blockSlot(clinicId: string, doctorUserId: string, startsAt: string, endsAt: string): Promise<DoctorAvailabilitySlot>
  getNextAvailableSlot(clinicId: string, doctorUserId: string, afterDate?: string): Promise<DoctorAvailabilitySlot | null>

  // KPIs (for dashboards)
  refreshKPIs(clinicId: string, doctorUserId: string): Promise<DoctorProfile>
}
