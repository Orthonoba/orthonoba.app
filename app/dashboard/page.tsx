import type { Metadata } from 'next'
import { StatCard } from '@/components/dashboard/stat-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { RecentOrders } from '@/components/dashboard/recent-orders'

export const metadata: Metadata = { title: 'Dashboard — Orthonoba' }

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bienvenido</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen general de la plataforma · Mayo 2026</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value="124"
          sub="+8 este mes"
          trend="up"
          color="blue"
        />
        <StatCard
          label="Active Cases"
          value="32"
          sub="4 urgentes"
          color="teal"
        />
        <StatCard
          label="Monthly Revenue"
          value="€12,400"
          sub="+12.4% vs mes anterior"
          trend="up"
          color="green"
        />
        <StatCard
          label="New Leads"
          value="18"
          sub="6 desde Meta Ads"
          color="amber"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <ActivityFeed />
      </div>
    </div>
  )
}
