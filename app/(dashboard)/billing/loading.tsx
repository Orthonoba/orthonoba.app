export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-24 bg-slate-700 rounded-lg" />
      <div className="h-36 bg-slate-800 border border-slate-700 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-slate-800 border border-slate-700 rounded-xl" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="h-64 bg-slate-800 border border-slate-700 rounded-xl" /><div className="h-64 bg-slate-800 border border-slate-700 rounded-xl" /></div>
    </div>
  )
}
