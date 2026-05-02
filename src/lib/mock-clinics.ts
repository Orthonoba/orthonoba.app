import type { Clinic } from '@/src/types/clinic'

export const mockClinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Clínica Dental García',
    subdomain: 'garcia',
    type: 'clinic',
    status: 'active',
    plan: 'growth',
    address: 'Calle Mayor 123, Madrid',
    phone: '+34 91 123 4567',
    email: 'garcia@orthonoba.app',
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'lab-1',
    name: 'Lab Dental Norte',
    subdomain: 'labnorte',
    type: 'lab',
    status: 'active',
    plan: 'enterprise',
    address: 'Av. Tecnología 45, Barcelona',
    phone: '+34 93 987 6543',
    email: 'labnorte@orthonoba.app',
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    isActive: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'clinic-2',
    name: 'Centro Ortodoncia Sur',
    subdomain: 'ortosur',
    type: 'clinic',
    status: 'trial',
    plan: 'starter',
    address: 'Paseo Castellana 200, Sevilla',
    phone: '+34 95 456 7890',
    email: 'ortosur@orthonoba.app',
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    isActive: true,
    createdAt: '2024-03-01',
  },
]

export function getClinicBySubdomain(subdomain: string): Clinic | undefined {
  return mockClinics.find((c) => c.subdomain === subdomain && c.isActive)
}

export function getClinicById(id: string): Clinic | undefined {
  return mockClinics.find((c) => c.id === id && c.isActive)
}
