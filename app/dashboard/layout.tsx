import type { ReactNode } from 'react'
import { verifySession, getCurrentUser } from '@/src/lib/dal'
import { StoreHydrator } from '@/src/components/ui/store-hydrator'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await verifySession()
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <StoreHydrator user={user} />
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
