import type { DentalCase } from '@/src/types/case'

export const mockCases: DentalCase[] = [
  {
    id: 'case-001',
    caseNumber: 'CASE-2024-0001',
    clinicId: 'clinic-1',
    patientId: 'pat-001',
    assignedDoctorId: 'usr-dr-1',
    labId: 'lab-1',
    treatmentType: 'implantology',
    status: 'treatment',
    priority: 'routine',
    origin: 'referral-external',
    title: 'Implante unitario sector posterior superior',
    chiefComplaint: 'Falta molar superior derecho desde hace 2 años, dificultad para masticar',
    diagnosis: 'Edentulismo unitario 16. Suficiente hueso para implante convencional.',
    affectedTeeth: [16],
    estimatedValue: 2800,
    acceptedValue: 2800,
    currency: 'EUR',
    treatmentPlanId: 'tp-001',
    orderIds: ['ord-001'],
    appointmentIds: ['apt-001', 'apt-002'],
    invoiceIds: [],
    openedAt: '2024-03-15T09:00:00Z',
    expectedCompletionDate: '2024-09-15T00:00:00Z',
    quotedAt: '2024-03-15T09:30:00Z',
    acceptedAt: '2024-03-17T11:00:00Z',
    tags: ['implante', 'sector-posterior'],
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-04-20T14:30:00Z',
  },
  {
    id: 'case-002',
    caseNumber: 'CASE-2024-0002',
    clinicId: 'clinic-1',
    patientId: 'pat-002',
    assignedDoctorId: 'usr-dr-2',
    treatmentType: 'orthodontics',
    status: 'intake',
    priority: 'routine',
    origin: 'walk-in',
    title: 'Ortodoncia invisible adulto',
    chiefComplaint: 'Apiñamiento dental anterior. Quiere alineadores transparentes.',
    estimatedValue: 3500,
    currency: 'EUR',
    orderIds: [],
    appointmentIds: ['apt-003'],
    invoiceIds: [],
    openedAt: '2024-05-01T10:00:00Z',
    tags: ['ortodoncia', 'alineadores'],
    createdAt: '2024-05-01T10:00:00Z',
  },
]

export function getCaseById(id: string): DentalCase | undefined {
  return mockCases.find((c) => c.id === id)
}

export function getCasesByClinic(clinicId: string): DentalCase[] {
  return mockCases.filter((c) => c.clinicId === clinicId)
}

export function getCasesByPatient(clinicId: string, patientId: string): DentalCase[] {
  return mockCases.filter((c) => c.clinicId === clinicId && c.patientId === patientId)
}

export function getCasesByDoctor(clinicId: string, doctorId: string): DentalCase[] {
  return mockCases.filter((c) => c.clinicId === clinicId && c.assignedDoctorId === doctorId)
}
