import type { ReactNode } from 'react'
import { verifySession, getCurrentUser } from '@/src/lib/dal'
import { StoreHydrator } from '@/src/components/ui/store-hydrator'
import { DashboardShell } from '@/src/components/layouts/dashboard-shell'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await verifySession()
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen">
      <StoreHydrator user={user} />
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
