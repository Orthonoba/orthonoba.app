export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 bg-slate-700 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-slate-800 border border-slate-700 rounded-xl" />)}</div>
        <div className="lg:col-span-2 h-64 bg-slate-800 border border-slate-700 rounded-xl" />
      </div>
    </div>
  )
}
