import { inr } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function PriceBlock({
  mrp,
  price,
  discount,
  size = 'md',
  className,
}: {
  mrp: number
  price: number
  discount: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span
        className={cn(
          'font-display font-bold text-navy-900',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl',
        )}
      >
        {inr(price)}
      </span>
      {mrp > price && (
        <>
          <span className={cn('text-navy-400 line-through', size === 'sm' ? 'text-[13px]' : 'text-sm')}>
            {inr(mrp)}
          </span>
          <span
            className={cn(
              'rounded-md bg-teal-50 px-1.5 py-0.5 font-bold text-teal-700',
              size === 'sm' ? 'text-[11px]' : 'text-xs',
            )}
          >
            {discount}% OFF
          </span>
        </>
      )}
    </div>
  )
}
