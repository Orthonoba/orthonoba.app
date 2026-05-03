'use client'

import React, { useEffect, useCallback } from 'react'

/* ============================================================
   cn() — minimal classname helper
   ============================================================ */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/* ============================================================
   TYPES
   ============================================================ */
export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  footer?: React.ReactNode
}

/* ============================================================
   SIZE CLASSES
   ============================================================ */
const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm:   'max-w-[384px]',
  md:   'max-w-[512px]',
  lg:   'max-w-[640px]',
  xl:   'max-w-[768px]',
  full: 'max-w-full',
}

/* ============================================================
   CLOSE ICON
   ============================================================ */
function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4L4 12M4 4l8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ============================================================
   MODAL COMPONENT
   ============================================================ */
export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  /* ESC key handler */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    /* Prevent body scroll while modal is open */
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={(e) => {
        /* Close on outside click */
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Modal panel */}
      <div
        className={cn(
          'relative w-full bg-white rounded-[20px]',
          'shadow-[0_20px_25px_-5px_rgb(0_0_0/_0.1),0_8px_10px_-6px_rgb(0_0_0/_0.05)]',
          'flex flex-col',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title !== undefined) && (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
            <h2
              id="modal-title"
              className="text-base font-semibold text-slate-900 truncate"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className={cn(
                'shrink-0 flex items-center justify-center',
                'w-8 h-8 rounded-[10px]',
                'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                'transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
              )}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* When no title, show standalone close button */}
        {title === undefined && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={cn(
              'absolute top-3 right-3 z-10',
              'flex items-center justify-center',
              'w-8 h-8 rounded-[10px]',
              'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
            )}
          >
            <CloseIcon />
          </button>
        )}

        {/* Body */}
        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center gap-2 justify-end px-5 py-4 border-t border-slate-100 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
