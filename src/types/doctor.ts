// ─── Dental Specialties (international nomenclature) ─────────────────────────

export type DentistSpecialty =
  | 'general-dentist'
  | 'orthodontist'
  | 'periodontist'
  | 'endodontist'
  | 'prosthodontist'
  | 'oral-surgeon'
  | 'oral-maxillofacial'
  | 'pediatric-dentist'
  | 'implantologist'
  | 'aesthetic-dentist'
  | 'sleep-medicine'
  | 'forensic-odontology'
  | 'public-health-dentist'

// ─── Doctor Professional Profile ─────────────────────────────────────────────
// Extends User (role='doctor') with dental professional data.
// One doctor can have profiles in multiple clinics (multi-clinic support).

export interface DoctorProfile {
  id: string
  /** References User.id with role='doctor' */
  userId: string
  /** Primary clinic this profile belongs to */
  clinicId: string

  // ── Professional credentials ───────────────────────────────────────────────
  specialties: DentistSpecialty[]
  /** National dental license / colegiado number */
  licenseNumber: string
  /** ISO 3166-1 alpha-2, e.g. 'ES' */
  licenseCountry: string
  medicalCollegeName?: string       // 'Colegio Oficial de Dentistas de Madrid'
  graduationYear?: number
  postGradYear?: number
  postGradInstitution?: string

  // ── Availability ───────────────────────────────────────────────────────────
  consultationDays: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>
  consultationStartTime?: string    // 'HH:MM' 24h
  consultationEndTime?: string
  lunchBreakStart?: string
  lunchBreakEnd?: string
  avgAppointmentMinutes: number
  maxDailyAppointments: number
  isAcceptingNewPatients: boolean

  // ── Performance KPIs (denormalized, updated by background jobs) ────────────
  totalPatients: number
  activePatients: number
  totalCases: number
  activeCases: number
  completedCasesThisYear: number
  avgCaseValue: number
  avgPatientRating?: number         // 0-5, from patient surveys

  // ── Localization ───────────────────────────────────────────────────────────
  /** ISO 639-1 language codes */
  languages?: string[]

  bio?: string

  createdAt: string
  updatedAt?: string
}

// ─── Clinic–Doctor relationship (many-to-many support) ───────────────────────

export interface DoctorClinicAffiliation {
  id: string
  doctorUserId: string
  clinicId: string
  isPrimary: boolean
  role: 'attending' | 'specialist' | 'visiting' | 'resident'
  startDate: string
  endDate?: string
  contractType?: 'employed' | 'independent' | 'partner'
}

// ─── Doctor Availability Slot ─────────────────────────────────────────────────

export interface DoctorAvailabilitySlot {
  id: string
  doctorUserId: string
  clinicId: string
  /** ISO 8601 datetime */
  startsAt: string
  endsAt: string
  isBooked: boolean
  appointmentId?: string
}
