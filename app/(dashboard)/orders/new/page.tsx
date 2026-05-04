import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva Orden — Orthonoba' }

export default function NewOrderPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Nueva Orden</h1>
        <p className="text-slate-400 text-sm mt-0.5">Placeholder — Orthonoba</p>
      </div>
    </div>
  )
}
