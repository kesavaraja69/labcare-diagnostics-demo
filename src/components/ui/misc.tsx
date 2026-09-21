import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Check, ChevronDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

/* --------------------------------- Skeleton -------------------------------- */
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('skeleton', className)} aria-hidden {...props} />
)

/* -------------------------------- Separator -------------------------------- */
export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-navy-100',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
))
Separator.displayName = 'Separator'

/* --------------------------------- Switch ---------------------------------- */
export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-teal-500 data-[state=unchecked]:bg-navy-200',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

/* ------------------------------- Radio group ------------------------------- */
export const RadioGroup = RadioGroupPrimitive.Root

export const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label: React.ReactNode
    description?: React.ReactNode
    icon?: React.ReactNode
    meta?: React.ReactNode
  }
>(({ className, label, description, icon, meta, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'group relative flex w-full items-start gap-3 rounded-xl border border-navy-200 bg-white p-4 text-left transition-all duration-200 hover:border-navy-300 hover:bg-navy-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-50/50 data-[state=checked]:shadow-[0_0_0_1px_rgba(28,170,163,0.35)]',
      className,
    )}
    {...props}
  >
    {icon && <span className="mt-0.5 text-navy-500 group-data-[state=checked]:text-teal-600">{icon}</span>}
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-navy-900">{label}</span>
      {description && <span className="mt-1 block text-[13px] leading-snug text-navy-500">{description}</span>}
      {meta && <span className="mt-2 block text-[12px] font-medium text-teal-700">{meta}</span>}
    </span>
    <RadioGroupPrimitive.Indicator className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-teal-500 bg-teal-500 text-white">
      <Check className="h-3 w-3" strokeWidth={3} />
    </RadioGroupPrimitive.Indicator>
    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-navy-300 group-data-[state=checked]:hidden" />
  </RadioGroupPrimitive.Item>
))
RadioCard.displayName = 'RadioCard'

/* -------------------------------- Checkbox --------------------------------- */
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-5 w-5 shrink-0 rounded-[6px] border border-navy-300 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-500 data-[state=checked]:text-white',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

/* ---------------------------------- Tabs ----------------------------------- */
export const Tabs = TabsPrimitive.Root

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-navy-50 p-1 no-scrollbar sm:w-auto',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-semibold text-navy-500 transition-all hover:text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 data-[state=active]:bg-white data-[state=active]:text-navy-900 data-[state=active]:shadow-soft sm:flex-none',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = TabsPrimitive.Content

/* -------------------------------- Accordion -------------------------------- */
export const Accordion = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('overflow-hidden rounded-xl border border-navy-100 bg-white shadow-soft transition-colors', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between gap-4 px-4 py-4 text-left text-[15px] font-semibold text-navy-900 transition-colors hover:bg-navy-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:px-5',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4.5 w-4.5 shrink-0 text-navy-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = 'AccordionTrigger'

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('px-4 pb-4 pt-0 text-sm leading-relaxed text-navy-600 sm:px-5', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = 'AccordionContent'

/* --------------------------------- Progress -------------------------------- */
export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-navy-100', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 rounded-full bg-teal-500 transition-transform duration-700', indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = 'Progress'

/* --------------------------------- Tooltip --------------------------------- */
export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-popover max-w-xs rounded-lg bg-navy-900 px-2.5 py-1.5 text-[12px] font-medium text-white shadow-lift animate-fade-in',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = 'TooltipContent'

/* -------------------------------- Empty state ------------------------------ */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 bg-white/70 px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-navy-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ------------------------------- Stepper dots ------------------------------ */
export function StepIndicator({
  steps,
  current,
  className,
}: {
  steps: { label: string; short?: string }[]
  current: number
  className?: string
}) {
  return (
    <ol className={cn('flex items-center gap-2 sm:gap-3', className)} aria-label="Booking progress">
      {steps.map((step, i) => {
        const index = i + 1
        const state = index < current ? 'done' : index === current ? 'current' : 'todo'
        return (
          <li key={step.label} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold transition-colors',
                  state === 'done' && 'border-teal-500 bg-teal-500 text-white',
                  state === 'current' && 'border-navy-900 bg-navy-900 text-white',
                  state === 'todo' && 'border-navy-200 bg-white text-navy-400',
                )}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : index}
              </span>
              <span
                className={cn(
                  'hidden truncate text-[13px] font-semibold sm:block',
                  state === 'todo' ? 'text-navy-400' : 'text-navy-900',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={cn('h-px flex-1 rounded-full', index < current ? 'bg-teal-400' : 'bg-navy-100')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Minus }
