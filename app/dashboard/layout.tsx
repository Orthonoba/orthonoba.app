import { verifySession, getCurrentUser } from '@/src/lib/dal'
import { StoreHydrator } from '@/src/components/ui/store-hydrator'
import { LogoutButton } from '@/src/components/ui/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifySession()
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHydrator user={user} />

      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-slate-900 text-sm">Orthonoba</span>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-500">
              {user.name}{' '}
              <span className="text-slate-300">·</span>{' '}
              <span className="capitalize">{user.role}</span>
            </span>
          )}
          <LogoutButton />
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  )
}
