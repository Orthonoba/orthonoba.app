'use client'
import type { ReactNode } from 'react'
import { Sidebar } from '@/src/components/sidebar/sidebar'

interface DashboardShellProps {
  children: ReactNode
  header?: ReactNode
}

export function DashboardShell({ children, header }: DashboardShellProps) {

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      {/* Main area */}
      <div
        className={[
          'flex-1 flex flex-col min-w-0 transition-all duration-200',
          // On large screens push content right when sidebar is open
          'lg:ml-0',
        ].join(' ')}
      >
        {/* Top header bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0 sticky top-0 z-20">
          {header ?? (
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Orthonoba</p>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
