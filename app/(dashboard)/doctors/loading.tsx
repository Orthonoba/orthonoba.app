export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-32 bg-slate-700 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 bg-slate-800 border border-slate-700 rounded-xl" />)}
      </div>
    </div>
  )
}
