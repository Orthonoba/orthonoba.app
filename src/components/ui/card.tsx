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
export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

export interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export interface CardBodyProps {
  className?: string
  children: React.ReactNode
}

export interface CardFooterProps {
  className?: string
  children: React.ReactNode
}

/* ============================================================
   VARIANT CLASSES
   ============================================================ */
const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default:
    'bg-white border border-slate-200 rounded-[14px]',
  elevated:
    'bg-white rounded-[14px] shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.07),0_2px_4px_-2px_rgb(0_0_0_/_0.07)]',
  outlined:
    'bg-transparent border-2 border-slate-200 rounded-[14px]',
  glass:
    'backdrop-blur-sm bg-white/70 border border-white/40 rounded-[14px]',
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-6',
}

/* ============================================================
   CARD
   ============================================================ */
export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

/* ============================================================
   CARD HEADER
   ============================================================ */
export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 pb-4',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 truncate">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  )
}

/* ============================================================
   CARD BODY
   ============================================================ */
export function CardBody({ className, children }: CardBodyProps) {
  return (
    <div className={cn('flex-1', className)}>
      {children}
    </div>
  )
}

/* ============================================================
   CARD FOOTER
   ============================================================ */
export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 pt-4 mt-4 border-t border-slate-100',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card
