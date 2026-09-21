import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Sheet — an edge-anchored modal (side drawer or bottom sheet).
 *
 * Built on the same Radix Dialog primitive as `ui/dialog.tsx` so it inherits the
 * behaviour that matters and that the app's previous hand-rolled drawers did not
 * have:
 *
 * - portal to `document.body` → never clipped by a transformed/`overflow:hidden` parent
 * - viewport-level backdrop (`z-overlay`) with the panel on `z-modal`
 * - background scroll lock while open
 * - Escape to close, backdrop click to close
 * - focus trap + focus restore, `role="dialog"`, `aria-modal`, labelled by the title
 *
 * Panels are pinned with inset positioning (`inset-y-0 right-0`, `bottom-0`), and the
 * entrance/exit animations only slide the panel — positioning never depends on a
 * transform.
 */

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

type Side = 'right' | 'left' | 'bottom'

const SIDE_POSITION: Record<Side, string> = {
  right: 'inset-y-0 right-0 h-full w-[86%] max-w-sm',
  left: 'inset-y-0 left-0 h-full w-[82%] max-w-xs',
  bottom: 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl',
}

const SIDE_ANIMATION: Record<Side, string> = {
  right: 'data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right',
  left: 'data-[state=closed]:animate-sheet-out-left data-[state=open]:animate-sheet-in-left',
  bottom: 'data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom',
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: Side
    /** Accessible name for the panel — rendered visually or via `aria-label`. */
    label?: string
    hideClose?: boolean
  }
>(({ className, children, side = 'right', label, hideClose = false, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-navy-950/45 backdrop-blur-sm data-[state=open]:animate-fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      aria-label={label}
      className={cn(
        'fixed z-modal flex flex-col overflow-hidden border-navy-100 bg-white shadow-lift focus-visible:outline-none',
        SIDE_POSITION[side],
        SIDE_ANIMATION[side],
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          className="absolute right-3 top-3 rounded-lg p-2 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Close panel"
        >
          <X className="h-4.5 w-4.5" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = 'SheetContent'

export { Sheet, SheetTrigger, SheetClose, SheetContent }
