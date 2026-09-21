import * as React from 'react'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'info' | 'warning' | 'error'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  action?: { label: string; onClick: () => void }
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (input: Omit<Toast, 'id' | 'variant'> & { variant?: ToastVariant }) => string
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const VARIANTS: Record<ToastVariant, { icon: React.ElementType; wrap: string; iconColor: string }> = {
  success: { icon: CheckCircle2, wrap: 'border-success-100 bg-white', iconColor: 'text-success-500' },
  info: { icon: Info, wrap: 'border-navy-100 bg-white', iconColor: 'text-navy-500' },
  warning: { icon: TriangleAlert, wrap: 'border-warning-100 bg-white', iconColor: 'text-warning-500' },
  error: { icon: XCircle, wrap: 'border-red-100 bg-white', iconColor: 'text-red-500' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const timers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = React.useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const toast = React.useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'info', action }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setToasts((list) => [...list.slice(-3), { id, title, description, variant, action }])
      timers.current[id] = setTimeout(() => dismiss(id), 5200)
      return id
    },
    [dismiss],
  )

  const value = React.useMemo<ToastContextValue>(
    () => ({
      toasts,
      toast,
      dismiss,
      success: (title, description) => toast({ title, description, variant: 'success' }),
      error: (title, description) => toast({ title, description, variant: 'error' }),
      info: (title, description) => toast({ title, description, variant: 'info' }),
      warning: (title, description) => toast({ title, description, variant: 'warning' }),
    }),
    [toasts, toast, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-3 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:items-end sm:p-0"
      >
        {toasts.map((t) => {
          const meta = VARIANTS[t.variant]
          const Icon = meta.icon
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto w-full max-w-sm animate-fade-up rounded-xl border p-3.5 shadow-lift sm:w-[380px]',
                meta.wrap,
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', meta.iconColor)} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-[13px] leading-snug text-navy-500">{t.description}</p>
                  )}
                  {t.action && (
                    <button
                      type="button"
                      onClick={() => {
                        t.action?.onClick()
                        dismiss(t.id)
                      }}
                      className="mt-2 text-[13px] font-semibold text-teal-600 underline-offset-2 hover:underline"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
