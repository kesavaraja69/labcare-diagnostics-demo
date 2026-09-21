import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-navy-100 bg-navy-50 text-navy-700',
        accent: 'border-teal-100 bg-teal-50 text-teal-700',
        success: 'border-success-100 bg-success-50 text-success-700',
        warning: 'border-warning-100 bg-warning-50 text-warning-700',
        danger: 'border-red-100 bg-red-50 text-red-700',
        violet: 'border-violet-100 bg-violet-50 text-violet-700',
        info: 'border-sky-100 bg-sky-50 text-sky-700',
        solid: 'border-transparent bg-navy-900 text-white',
        outline: 'border-navy-200 bg-white text-navy-600',
      },
      size: {
        default: 'px-2.5 py-0.5 text-[11px]',
        sm: 'px-2 py-0 text-[10px]',
        lg: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { badgeVariants }
