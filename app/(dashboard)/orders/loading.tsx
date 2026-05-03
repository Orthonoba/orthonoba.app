export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 bg-slate-700 rounded-lg" />
      <div className="flex gap-3"><div className="h-9 w-60 bg-slate-700 rounded-lg" /><div className="h-9 w-40 bg-slate-700 rounded-lg" /></div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="h-10 bg-slate-700/50 border-b border-slate-700" />
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 border-b border-slate-700/50 bg-slate-800" />)}
      </div>
    </div>
  )
}
