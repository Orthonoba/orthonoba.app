import type {
  Patient,
  MedicalHistory,
  Appointment,
  TreatmentPlan,
  ClinicalNote,
  Odontogram,
} from '@/src/types/patient'

export interface PatientFilters {
  status?: Patient['status']
  dentistId?: string
  search?: string
  source?: Patient['source']
  page?: number
  limit?: number
}

export interface IPatientService {
  findById(clinicId: string, patientId: string): Promise<Patient | null>
  findAll(
    clinicId: string,
    filters?: PatientFilters
  ): Promise<{ data: Patient[]; total: number }>
  create(clinicId: string, data: Omit<Patient, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>): Promise<Patient>
  update(clinicId: string, patientId: string, data: Partial<Patient>): Promise<Patient>
  archive(clinicId: string, patientId: string): Promise<void>
  searchByPhone(clinicId: string, phone: string): Promise<Patient | null>

  // Medical
  getMedicalHistory(clinicId: string, patientId: string): Promise<MedicalHistory | null>
  upsertMedicalHistory(clinicId: string, patientId: string, data: Partial<MedicalHistory>): Promise<MedicalHistory>

  // Odontogram
  getOdontogram(clinicId: string, patientId: string): Promise<Odontogram | null>
  updateOdontogram(clinicId: string, patientId: string, data: Omit<Odontogram, 'id' | 'clinicId' | 'patientId'>): Promise<Odontogram>

  // Appointments
  listAppointments(clinicId: string, patientId: string): Promise<Appointment[]>
  scheduleAppointment(clinicId: string, data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>
  updateAppointmentStatus(clinicId: string, appointmentId: string, status: Appointment['status']): Promise<Appointment>

  // Treatment plans
  listTreatmentPlans(clinicId: string, patientId: string): Promise<TreatmentPlan[]>
  createTreatmentPlan(clinicId: string, data: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentPlan>

  // Clinical notes
  listNotes(clinicId: string, patientId: string): Promise<ClinicalNote[]>
  addNote(clinicId: string, data: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalNote>
}
