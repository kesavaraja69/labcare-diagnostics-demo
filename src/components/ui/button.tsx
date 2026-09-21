import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 [&_svg]:shrink-0 active:scale-[0.985]',
  {
    variants: {
      variant: {
        default:
          'bg-navy-900 text-white shadow-soft hover:bg-navy-800 hover:shadow-lift',
        accent: 'bg-teal-500 text-white shadow-soft hover:bg-teal-600 hover:shadow-lift',
        outline: 'border border-navy-200 bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50',
        secondary: 'bg-navy-50 text-navy-900 hover:bg-navy-100',
        ghost: 'text-navy-700 hover:bg-navy-50 hover:text-navy-900',
        subtle: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
        destructive: 'bg-red-600 text-white shadow-soft hover:bg-red-700',
        link: 'text-teal-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 rounded-lg px-3 text-[13px]',
        lg: 'h-12 px-6 text-[15px]',
        xl: 'h-14 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    if (asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Comp>
      )
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
