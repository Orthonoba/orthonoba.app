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
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'clinical' | 'outline'
type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: React.ReactNode
  className?: string
}

/* ============================================================
   VARIANT CLASSES
   ============================================================ */
const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-slate-100 text-slate-600',
  primary:  'bg-blue-50 text-blue-700',
  success:  'bg-green-50 text-green-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
  clinical: 'bg-teal-50 text-teal-700',
  outline:  'bg-white text-slate-600 border border-slate-300',
}

const dotColorClasses: Record<BadgeVariant, string> = {
  default:  'bg-slate-400',
  primary:  'bg-blue-500',
  success:  'bg-green-500',
  warning:  'bg-amber-500',
  danger:   'bg-red-500',
  clinical: 'bg-teal-500',
  outline:  'bg-slate-400',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs py-0.5 px-2',
  md: 'text-sm py-1 px-2.5',
}

const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
}

/* ============================================================
   BADGE COMPONENT
   ============================================================ */
export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            'rounded-full shrink-0',
            dotColorClasses[variant],
            dotSizeClasses[size]
          )}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
