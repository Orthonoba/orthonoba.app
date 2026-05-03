export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><div className="h-7 w-32 bg-slate-700 rounded-lg" /><div className="h-4 w-48 bg-slate-700/60 rounded" /></div>
        <div className="h-9 w-36 bg-slate-700 rounded-lg" />
      </div>
      <div className="flex gap-3"><div className="h-9 w-56 bg-slate-700 rounded-lg" /><div className="h-9 w-36 bg-slate-700 rounded-lg" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex gap-3"><div className="w-10 h-10 bg-slate-700 rounded-xl" /><div className="space-y-1.5 flex-1"><div className="h-4 bg-slate-700 rounded w-3/4" /><div className="h-3 bg-slate-700/60 rounded w-1/2" /></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="h-16 bg-slate-700 rounded-lg" /><div className="h-16 bg-slate-700 rounded-lg" /></div>
            <div className="h-9 bg-slate-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
