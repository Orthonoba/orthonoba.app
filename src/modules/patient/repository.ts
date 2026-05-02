import type { Patient, MedicalHistory, Appointment, TreatmentPlan, ClinicalNote, Odontogram } from '@/src/types/patient'
import type { PatientFilters } from './service'

export interface IPatientRepository {
  findById(clinicId: string, id: string): Promise<Patient | null>
  findAll(clinicId: string, filters?: PatientFilters): Promise<{ data: Patient[]; total: number }>
  findByPhone(clinicId: string, phone: string): Promise<Patient | null>
  findByNationalId(clinicId: string, nationalId: string): Promise<Patient | null>
  create(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>
  update(clinicId: string, id: string, data: Partial<Patient>): Promise<Patient>
  delete(clinicId: string, id: string): Promise<void>
}

export interface IMedicalHistoryRepository {
  findByPatient(clinicId: string, patientId: string): Promise<MedicalHistory | null>
  upsert(data: Omit<MedicalHistory, 'id'>): Promise<MedicalHistory>
}

export interface IAppointmentRepository {
  findById(clinicId: string, id: string): Promise<Appointment | null>
  findByPatient(clinicId: string, patientId: string): Promise<Appointment[]>
  findByDentist(clinicId: string, dentistId: string, date?: string): Promise<Appointment[]>
  create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>
  update(clinicId: string, id: string, data: Partial<Appointment>): Promise<Appointment>
  delete(clinicId: string, id: string): Promise<void>
}

export interface ITreatmentPlanRepository {
  findById(clinicId: string, id: string): Promise<TreatmentPlan | null>
  findByPatient(clinicId: string, patientId: string): Promise<TreatmentPlan[]>
  create(data: Omit<TreatmentPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentPlan>
  update(clinicId: string, id: string, data: Partial<TreatmentPlan>): Promise<TreatmentPlan>
}

export interface IClinicalNoteRepository {
  findByPatient(clinicId: string, patientId: string): Promise<ClinicalNote[]>
  create(data: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalNote>
  update(clinicId: string, id: string, data: Partial<ClinicalNote>): Promise<ClinicalNote>
}

export interface IOdontogramRepository {
  findByPatient(clinicId: string, patientId: string): Promise<Odontogram | null>
  upsert(data: Omit<Odontogram, 'id'>): Promise<Odontogram>
}
