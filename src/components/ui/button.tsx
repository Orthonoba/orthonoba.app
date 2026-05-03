'use client'

import React from 'react'

/* ============================================================
   cn() — minimal classname helper (no external dep)
   ============================================================ */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/* ============================================================
   TYPES
   ============================================================ */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'clinical' | 'danger' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

/* ============================================================
   VARIANT CLASSES
   ============================================================ */
const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 ' +
    'border border-transparent shadow-[var(--cn-shadow-xs)]',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 ' +
    'border border-transparent',
  clinical:
    'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 ' +
    'border border-transparent shadow-[var(--cn-shadow-xs)]',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 ' +
    'border border-transparent shadow-[var(--cn-shadow-xs)]',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 ' +
    'border border-transparent',
  outline:
    'bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 ' +
    'border border-slate-300',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'py-1 px-2 text-xs gap-1',
  sm: 'py-1.5 px-3 text-sm gap-1.5',
  md: 'py-2 px-4 text-sm gap-2',
  lg: 'py-2.5 px-5 text-base gap-2',
}

/* ============================================================
   SPINNER SVG
   ============================================================ */
function Spinner({ size }: { size: NonNullable<ButtonProps['size']> }) {
  const dim = size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 16
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ============================================================
   BUTTON COMPONENT
   ============================================================ */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          /* base */
          'inline-flex items-center justify-center font-medium',
          'rounded-[10px]',
          'transition-colors duration-[150ms] ease-[ease]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
          'select-none whitespace-nowrap',
          /* variant */
          variantClasses[variant],
          /* size */
          sizeClasses[size],
          /* width */
          fullWidth ? 'w-full' : '',
          /* disabled */
          isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size} />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}

        {children && (
          <span className={cn(loading ? 'opacity-0 absolute' : '')}>{children}</span>
        )}

        {!loading && rightIcon ? (
          <span className="shrink-0">{rightIcon}</span>
        ) : null}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
