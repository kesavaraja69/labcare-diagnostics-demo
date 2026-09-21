import * as React from 'react'
import { cn } from '@/lib/utils'

const baseField =
  'w-full rounded-xl border bg-white text-sm text-navy-900 shadow-[inset_0_1px_2px_rgba(10,37,64,0.03)] transition-colors placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-navy-50 disabled:opacity-70'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        baseField,
        'h-11 px-3.5',
        invalid ? 'border-red-300 focus-visible:ring-red-400/60' : 'border-navy-200 hover:border-navy-300',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        baseField,
        'min-h-[96px] px-3.5 py-2.5 leading-relaxed',
        invalid ? 'border-red-300 focus-visible:ring-red-400/60' : 'border-navy-200 hover:border-navy-300',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          baseField,
          'h-11 appearance-none pl-3.5 pr-10',
          invalid ? 'border-red-300 focus-visible:ring-red-400/60' : 'border-navy-200 hover:border-navy-300',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
      >
        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ),
)
Select.displayName = 'Select'

export { Input, Textarea, Select }
