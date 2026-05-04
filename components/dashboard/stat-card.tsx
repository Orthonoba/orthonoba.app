interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down'
  color?: 'blue' | 'teal' | 'green' | 'amber'
}

const dotColor: Record<string, string> = {
  blue:  'bg-blue-500',
  teal:  'bg-teal-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
}

export function StatCard({ label, value, sub, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[color]}`} />
        <p className="text-sm text-slate-500 leading-tight">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      {sub && (
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className={trend === 'up' ? 'text-green-600 text-xs font-semibold' : 'text-red-600 text-xs font-semibold'}>
              {trend === 'up' ? '▲' : '▼'}
            </span>
          )}
          <p className="text-xs text-slate-400">{sub}</p>
        </div>
      )}
    </div>
  )
}
