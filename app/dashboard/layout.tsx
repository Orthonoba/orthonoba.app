import { verifySession, getCurrentUser } from '@/src/lib/dal'
import { StoreHydrator } from '@/src/components/ui/store-hydrator'
import { DashboardShell } from '@/src/components/layouts/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifySession()
  const user = await getCurrentUser()

  return (
    <>
      <StoreHydrator user={user} />
      <DashboardShell>{children}</DashboardShell>
    </>
  )
}
