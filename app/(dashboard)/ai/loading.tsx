export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-700 rounded-2xl" /><div className="space-y-2"><div className="h-7 w-64 bg-slate-700 rounded-lg" /><div className="h-4 w-48 bg-slate-700/60 rounded" /></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 bg-slate-800 border border-slate-700 rounded-xl" />)}</div>
    </div>
  )
}
