export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><div className="h-7 w-32 bg-slate-700 rounded-lg" /><div className="h-4 w-24 bg-slate-700/60 rounded" /></div>
        <div className="h-9 w-36 bg-slate-700 rounded-lg" />
      </div>
      <div className="h-10 bg-slate-800 border border-slate-700 rounded-xl" />
      <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-slate-800 border border-slate-700 rounded-lg" />)}</div>
    </div>
  )
}
