import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Clinic, TenantContext } from '@/src/types/clinic'

interface ClinicState {
  clinic: Clinic | null
  clinicId: string | null
  clinicName: string | null
  tenantContext: TenantContext | null
  setClinic: (clinic: Clinic) => void
  setTenantContext: (ctx: TenantContext) => void
  clearClinic: () => void
}

export const useClinicStore = create<ClinicState>()(
  persist(
    (set) => ({
      clinic: null,
      clinicId: null,
      clinicName: null,
      tenantContext: null,
      setClinic: (clinic) =>
        set({ clinic, clinicId: clinic.id, clinicName: clinic.name }),
      setTenantContext: (ctx) =>
        set({ tenantContext: ctx, clinicId: ctx.clinicId, clinicName: ctx.clinicName }),
      clearClinic: () =>
        set({ clinic: null, clinicId: null, clinicName: null, tenantContext: null }),
    }),
    { name: 'orthonoba-clinic' }
  )
)
