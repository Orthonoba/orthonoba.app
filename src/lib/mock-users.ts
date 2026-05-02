import type { User } from '@/src/types/user'

export interface MockUser extends User {
  password: string
}

export const mockUsers: MockUser[] = [
  // ── SuperAdmin (platform) ──
  {
    id: 'usr-sa-1',
    name: 'Admin Orthonoba',
    email: 'admin@orthonoba.app',
    password: 'Admin@2024!',
    role: 'super_admin',
    status: 'active',
    clinicId: null,
    createdAt: '2024-01-01',
  },

  // ── Clinic Admin ──
  {
    id: 'usr-ca-1',
    name: 'Dra. Carmen García',
    email: 'carmen@garcia.orthonoba.app',
    password: 'ClinicAdmin@2024!',
    role: 'clinic_admin',
    status: 'active',
    clinicId: 'clinic-1',
    phone: '+34 91 123 4567',
    createdAt: '2024-01-15',
  },
  {
    id: 'usr-ca-2',
    name: 'Dr. Pedro Ortega',
    email: 'pedro@ortosur.orthonoba.app',
    password: 'ClinicAdmin@2024!',
    role: 'clinic_admin',
    status: 'active',
    clinicId: 'clinic-2',
    phone: '+34 95 456 7890',
    createdAt: '2024-03-10',
  },

  // ── Lab Admin ──
  {
    id: 'usr-la-1',
    name: 'Roberto Sánchez',
    email: 'roberto@labnorte.orthonoba.app',
    password: 'LabAdmin@2024!',
    role: 'lab_admin',
    status: 'active',
    clinicId: 'lab-1',
    phone: '+34 93 987 6543',
    createdAt: '2024-02-05',
  },

  // ── Doctors ──
  {
    id: 'usr-dr-1',
    name: 'Dr. Miguel Torres',
    email: 'miguel.torres@garcia.orthonoba.app',
    password: 'Doctor@2024!',
    role: 'doctor',
    status: 'active',
    clinicId: 'clinic-1',
    phone: '+34 91 234 5678',
    createdAt: '2024-01-20',
  },
  {
    id: 'usr-dr-2',
    name: 'Dra. Laura Vidal',
    email: 'laura.vidal@garcia.orthonoba.app',
    password: 'Doctor@2024!',
    role: 'doctor',
    status: 'active',
    clinicId: 'clinic-1',
    phone: '+34 91 345 6789',
    createdAt: '2024-02-01',
  },

  // ── Staff ──
  {
    id: 'usr-st-1',
    name: 'Ana Martínez',
    email: 'ana.martinez@garcia.orthonoba.app',
    password: 'Staff@2024!',
    role: 'staff',
    status: 'active',
    clinicId: 'clinic-1',
    phone: '+34 91 456 7890',
    createdAt: '2024-02-10',
  },
]
