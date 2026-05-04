const ORDERS = [
  { id: 'ORD-1042', patient: 'María García',  type: 'Corona zirconia',   status: 'En producción' },
  { id: 'ORD-1041', patient: 'Carlos Ruiz',   type: 'Implante total',     status: 'Revisión'      },
  { id: 'ORD-1040', patient: 'Ana Martínez',  type: 'Carilla cerámica',   status: 'Completado'    },
  { id: 'ORD-1039', patient: 'Luis Torres',   type: 'Prótesis parcial',   status: 'Pendiente'     },
  { id: 'ORD-1038', patient: 'Sofía Blanco',  type: 'Blanqueamiento',     status: 'Completado'    },
]

const STATUS_STYLE: Record<string, string> = {
  'En producción': 'bg-blue-50 text-blue-700',
  'Revisión':      'bg-amber-50 text-amber-700',
  'Completado':    'bg-green-50 text-green-700',
  'Pendiente':     'bg-slate-100 text-slate-600',
}

export function RecentOrders() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">Órdenes recientes</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">ID</th>
              <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Paciente</th>
              <th className="text-left text-xs text-slate-400 font-medium pb-3 pr-4">Tipo de trabajo</th>
              <th className="text-left text-xs text-slate-400 font-medium pb-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ORDERS.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4 font-mono text-xs text-slate-500">{o.id}</td>
                <td className="py-3 pr-4 text-slate-700 font-medium">{o.patient}</td>
                <td className="py-3 pr-4 text-slate-500">{o.type}</td>
                <td className="py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status] ?? 'bg-slate-100 text-slate-600'}`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
