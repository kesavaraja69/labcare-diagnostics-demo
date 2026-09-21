import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean; hint?: string }
>(({ className, children, required, hint, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('flex items-baseline gap-1.5 text-[13px] font-semibold text-navy-800', className)}
    {...props}
  >
    <span>
      {children}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden>
          *
        </span>
      )}
    </span>
    {hint && <span className="text-[11px] font-normal text-navy-400">{hint}</span>}
  </LabelPrimitive.Root>
))
Label.displayName = 'Label'

export const FieldError = ({ children }: { children?: React.ReactNode }) =>
  children ? (
    <p role="alert" className="flex items-center gap-1 text-[12px] font-medium text-red-600">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden>
        <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 9.25a.9.9 0 110 1.8.9.9 0 010-1.8zM8 4.2a.75.75 0 01.75.8l-.2 3.1a.55.55 0 11-1.1 0l-.2-3.1A.75.75 0 018 4.2z" />
      </svg>
      {children}
    </p>
  ) : null

export { Label }
