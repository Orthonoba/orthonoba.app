'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4"><span className="text-2xl">⚠️</span></div>
      <h2 className="text-xl font-bold text-white mb-2">Error en módulo IA</h2>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">{error.message}</p>
      <button onClick={reset} className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-5 py-2 rounded-lg transition">Reintentar</button>
    </div>
  )
}
