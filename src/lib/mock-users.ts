import type { User } from '@/src/types/user'

export interface MockUser extends User {
  password: string
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Admin Orthonoba',
    email: 'admin@orthonoba.app',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    clinicId: null,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Dr. García',
    email: 'dentist@orthonoba.app',
    password: 'dentist123',
    role: 'dentist',
    status: 'active',
    clinicId: 'clinic-1',
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Asistente Demo',
    email: 'asistente@orthonoba.app',
    password: 'asistente123',
    role: 'assistant',
    status: 'active',
    clinicId: 'clinic-1',
    createdAt: '2024-02-01',
  },
]
