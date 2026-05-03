'use client'

import React from 'react'

/* ============================================================
   cn() — minimal classname helper
   ============================================================ */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/* ============================================================
   TYPES
   ============================================================ */
export interface KPICardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  changePercent?: number
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'primary' | 'clinical' | 'success' | 'warning' | 'danger'
  loading?: boolean
  className?: string
}

/* ============================================================
   VARIANT — icon background + color
   ============================================================ */
const variantIconClasses: Record<NonNullable<KPICardProps['variant']>, string> = {
  default:  'bg-slate-100 text-slate-500',
  primary:  'bg-blue-50 text-blue-600',
  clinical: 'bg-teal-50 text-teal-600',
  success:  'bg-green-50 text-green-600',
  warning:  'bg-amber-50 text-amber-600',
  danger:   'bg-red-50 text-red-600',
}

/* ============================================================
   TREND ICONS (inline SVG)
   ============================================================ */
function TrendUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 9L5.5 5.5L7.5 7.5L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 4h2v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrendDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 4L5.5 7.5L7.5 5.5L10 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9H10V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrendStableIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ============================================================
   TREND BADGE
   ============================================================ */
function TrendBadge({
  trend,
  changePercent,
}: {
  trend: NonNullable<KPICardProps['trend']>
  changePercent?: number
}) {
  const colorClasses = {
    up:     'bg-green-50 text-green-700',
    down:   'bg-red-50 text-red-600',
    stable: 'bg-slate-100 text-slate-500',
  }

  const icons = {
    up:     <TrendUpIcon />,
    down:   <TrendDownIcon />,
    stable: <TrendStableIcon />,
  }

  const label =
    changePercent !== undefined
      ? `${trend === 'up' ? '+' : trend === 'down' ? '-' : ''}${Math.abs(changePercent).toFixed(1)}%`
      : trend === 'up'
      ? '↑'
      : trend === 'down'
      ? '↓'
      : '—'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
        colorClasses[trend]
      )}
    >
      {icons[trend]}
      {label}
    </span>
  )
}

/* ============================================================
   SKELETON SHIMMER
   ============================================================ */
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block rounded-md bg-slate-100 animate-pulse',
        className
      )}
    />
  )
}

/* ============================================================
   KPI CARD COMPONENT
   ============================================================ */
export function KPICard({
  label,
  value,
  trend,
  changePercent,
  subtitle,
  icon,
  variant = 'default',
  loading = false,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-[14px] p-5',
        'flex items-start gap-4',
        'transition-shadow duration-150 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/_0.07)]',
        className
      )}
    >
      {/* Icon circle */}
      {icon && (
        <div
          className={cn(
            'shrink-0 flex items-center justify-center',
            'w-10 h-10 rounded-full',
            variantIconClasses[variant]
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Label */}
        {loading ? (
          <Skeleton className="h-3.5 w-24 mb-2" />
        ) : (
          <p className="text-sm text-slate-500 truncate">{label}</p>
        )}

        {/* Value + Trend row */}
        <div className="flex items-end gap-2 flex-wrap mt-1">
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <span className="text-2xl font-bold text-slate-900 leading-none tabular-nums">
              {value}
            </span>
          )}

          {!loading && trend && (
            <TrendBadge trend={trend} changePercent={changePercent} />
          )}

          {loading && <Skeleton className="h-5 w-12" />}
        </div>

        {/* Subtitle */}
        {!loading && subtitle && (
          <p className="mt-1.5 text-xs text-slate-400 truncate">{subtitle}</p>
        )}

        {loading && (
          <Skeleton className="h-3 w-32 mt-2" />
        )}
      </div>
    </div>
  )
}

export default KPICard
