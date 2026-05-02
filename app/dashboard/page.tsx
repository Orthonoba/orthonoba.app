import type { Metadata } from 'next'
import { getCurrentUser } from '@/src/lib/dal'

export const metadata: Metadata = {
  title: 'Dashboard — Orthonoba',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">
        Bienvenido, {user?.name}
      </h1>
      <p className="text-slate-500 mb-8">
        Rol:{' '}
        <span className="font-medium capitalize text-slate-700">{user?.role}</span>
        {user?.clinicId && (
          <span className="ml-2 text-slate-400">· {user.clinicId}</span>
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Órdenes activas', value: '0' },
          { label: 'Pacientes', value: '0' },
          { label: 'Facturas pendientes', value: '0' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
