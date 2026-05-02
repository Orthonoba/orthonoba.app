import type { DoctorProfile } from '@/src/types/doctor'

export const mockDoctors: DoctorProfile[] = [
  {
    id: 'doc-profile-1',
    userId: 'usr-dr-1',
    clinicId: 'clinic-1',
    specialties: ['implantologist', 'oral-surgeon'],
    licenseNumber: '28-12345',
    licenseCountry: 'ES',
    medicalCollegeName: 'Colegio Oficial de Odontólogos de Madrid',
    graduationYear: 2010,
    consultationDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    consultationStartTime: '09:00',
    consultationEndTime: '18:00',
    lunchBreakStart: '14:00',
    lunchBreakEnd: '15:00',
    avgAppointmentMinutes: 45,
    maxDailyAppointments: 12,
    isAcceptingNewPatients: true,
    totalPatients: 87,
    activePatients: 34,
    totalCases: 112,
    activeCases: 8,
    completedCasesThisYear: 23,
    avgCaseValue: 2650,
    avgPatientRating: 4.8,
    languages: ['es', 'en'],
    bio: 'Especialista en implantología y cirugía oral con más de 14 años de experiencia.',
    createdAt: '2024-01-20',
    updatedAt: '2024-04-01',
  },
  {
    id: 'doc-profile-2',
    userId: 'usr-dr-2',
    clinicId: 'clinic-1',
    specialties: ['orthodontist', 'aesthetic-dentist'],
    licenseNumber: '28-67890',
    licenseCountry: 'ES',
    medicalCollegeName: 'Colegio Oficial de Odontólogos de Madrid',
    graduationYear: 2014,
    consultationDays: ['monday', 'wednesday', 'friday'],
    consultationStartTime: '10:00',
    consultationEndTime: '19:00',
    avgAppointmentMinutes: 30,
    maxDailyAppointments: 14,
    isAcceptingNewPatients: true,
    totalPatients: 65,
    activePatients: 28,
    totalCases: 78,
    activeCases: 12,
    completedCasesThisYear: 18,
    avgCaseValue: 3100,
    avgPatientRating: 4.9,
    languages: ['es', 'en', 'fr'],
    bio: 'Ortodoncista con especialización en ortodoncia invisible y diseño de sonrisa.',
    createdAt: '2024-02-01',
  },
]

export function getDoctorProfileById(id: string): DoctorProfile | undefined {
  return mockDoctors.find((d) => d.id === id)
}

export function getDoctorProfileByUserId(clinicId: string, userId: string): DoctorProfile | undefined {
  return mockDoctors.find((d) => d.clinicId === clinicId && d.userId === userId)
}

export function getDoctorsByClinic(clinicId: string): DoctorProfile[] {
  return mockDoctors.filter((d) => d.clinicId === clinicId)
}
