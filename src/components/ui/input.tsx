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
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

/* ============================================================
   INPUT COMPONENT
   ============================================================ */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      leftElement,
      rightElement,
      id,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium',
              disabled ? 'text-slate-400' : 'text-slate-700'
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left element */}
          {leftElement && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400 pointer-events-none z-10">
              {leftElement}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            className={cn(
              /* base */
              'w-full h-9.5 bg-white text-sm text-slate-900',
              'border rounded-[10px]',
              'transition-colors duration-150 ease-[ease]',
              'placeholder:text-slate-400',
              /* padding — adjust for left/right elements */
              leftElement ? 'pl-9' : 'pl-3',
              rightElement ? 'pr-9' : 'pr-3',
              /* border color */
              hasError
                ? 'border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:border-red-400'
                : 'border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500',
              /* disabled */
              disabled
                ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
                : 'hover:border-slate-300',
              className
            )}
            {...props}
          />

          {/* Right element */}
          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-400 z-10">
              {rightElement}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-600 mt-0.5"
          >
            {error}
          </p>
        )}

        {/* Hint message — only shown when no error */}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="text-xs text-slate-500 mt-0.5"
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
