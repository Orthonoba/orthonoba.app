import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'N8N — Orthonoba' }

export default function N8nPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">N8N</h1>
        <p className="text-slate-400 text-sm mt-0.5">Placeholder — Orthonoba</p>
      </div>
    </div>
  )
}
