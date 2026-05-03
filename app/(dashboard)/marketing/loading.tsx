export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 bg-slate-700 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-slate-800 border border-slate-700 rounded-xl" />)}</div>
      <div className="h-64 bg-slate-800 border border-slate-700 rounded-xl" />
    </div>
  )
}
