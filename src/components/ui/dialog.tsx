import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Dialog primitives.
 *
 * ## Why this file looks the way it does
 *
 * Dialogs were previously centred with `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`
 * on the dialog box itself. That breaks as soon as any animation writes to
 * `transform`: the `scale-in` keyframes ran with `animation-fill-mode: both`, so the
 * final keyframe (`transform: scale(1)` → identity matrix) permanently replaced the
 * centring translate. The dialog then rendered with its *top-left corner* at the
 * viewport centre, i.e. pushed down-and-right and often overflowing the bottom edge.
 *
 * The fix is structural rather than cosmetic: dialogs are now centred by a
 * **viewport-fixed flex wrapper** (`fixed inset-0 flex items-center justify-center`).
 * Centring no longer depends on a transform at all, so entrance animations are free
 * to animate `transform: scale()` without any risk of moving the dialog.
 *
 * Everything that used to come from the old approach is handled here once, for every
 * dialog in the app:
 *
 * - portal to `document.body` → never clipped by an ancestor `overflow: hidden`,
 *   `transform`, or stacking context
 * - `top-0` (not `inset-0`) flex wrapper → centres against the *visible* viewport and
 *   stays put while the page behind is scrolled
 * - `p-3 sm:p-6` padding + `max-h-[calc(100dvh-1.5rem)]` → safe spacing and a hard
 *   guarantee that the box can never extend past the viewport on any screen size
 *   (`dvh` keeps mobile browser chrome from clipping the dialog)
 * - `overflow-y-auto overscroll-contain` → long content scrolls inside the dialog
 *   instead of overflowing the screen
 * - z-index from the shared `zIndex` scale (overlay < modal < popover < toast)
 * - Radix supplies the backdrop, background scroll lock, Escape-to-close,
 *   backdrop-click-to-close when dismissible, focus trap and focus restore, and
 *   `role="dialog"` + `aria-modal` wiring
 */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-overlay bg-navy-950/45 backdrop-blur-sm data-[state=open]:animate-fade-in',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<DialogSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: DialogSize
    /** Hide the built-in close button (e.g. for a blocking progress dialog). */
    hideClose?: boolean
  }
>(({ className, children, size = 'md', hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    {/*
      Centring wrapper. `pointer-events-none` lets a click on the backdrop fall
      through to the Radix overlay underneath, so outside-click dismissal and
      Escape still behave exactly as Radix intends.
    */}
    <div className="pointer-events-none fixed inset-0 z-modal flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'pointer-events-auto relative my-auto max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto overscroll-contain rounded-2xl border border-navy-100 bg-white p-5 shadow-lift data-[state=open]:animate-dialog-in sm:max-h-[min(90dvh,calc(100dvh-3rem))] sm:p-6',
          SIZE_CLASS[size],
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute right-3.5 top-3.5 rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:right-4 sm:top-4"
            aria-label="Close dialog"
          >
            <X className="h-4.5 w-4.5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </div>
  </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex flex-col gap-1.5 pr-8', className)} {...props} />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3', className)}
    {...props}
  />
)

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold tracking-tight text-navy-900', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm leading-relaxed text-navy-500', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
