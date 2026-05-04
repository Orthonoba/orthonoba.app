const ACTIVITIES = [
  {
    id: 1,
    text: 'Nuevo paciente registrado',
    sub: 'María García · hace 5 min',
    dot: 'bg-blue-500',
  },
  {
    id: 2,
    text: 'Orden creada',
    sub: 'Corona zirconia #ORD-1042 · hace 18 min',
    dot: 'bg-teal-500',
  },
  {
    id: 3,
    text: 'Archivo STL subido',
    sub: 'implante_inferior.stl · hace 1 h',
    dot: 'bg-violet-500',
  },
  {
    id: 4,
    text: 'Lead desde Meta Ads',
    sub: 'Juan López · Instagram · hace 2 h',
    dot: 'bg-amber-500',
  },
  {
    id: 5,
    text: 'Factura emitida',
    sub: '#INV-0298 · €480 · hace 3 h',
    dot: 'bg-green-500',
  },
]

export function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">Actividad reciente</h2>
      <ul className="space-y-4">
        {ACTIVITIES.map((a) => (
          <li key={a.id} className="flex items-start gap-3">
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${a.dot}`} />
            <div className="min-w-0">
              <p className="text-sm text-slate-700">{a.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.sub}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
