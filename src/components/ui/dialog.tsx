/**
 * @component Dialog
 * @description Modal dialog built on Radix UI Dialog primitive. Uses a structured
 * three-section layout (Header → Body → Footer) with zero internal padding on the
 * content wrapper — each section owns its own spacing.
 *
 * @designDecisions
 * - z-[150] on overlay and content ensures dialogs stack above all other UI layers
 *   (nav bars, dropdowns, tooltips) without conflicting with Tailwind's default z-50 scale
 * - max-w-[460px] keeps dialogs compact and focused for confirmation/action use cases
 * - p-0 + gap-0 on content: sections (Header, Body, Footer) manage their own padding
 *   so consumers can omit sections without leftover whitespace
 * - bg-card + border-border for surface consistency with the card system
 * - overflow-hidden prevents content from breaking the rounded corners
 * - Overlay uses backdrop-blur-xs for subtle depth without heavy dimming
 * - onInteractOutside prevented: clicking the overlay does NOT dismiss the dialog.
 *   Users must explicitly close via a cancel/close button. This avoids accidental
 *   data loss in form dialogs and matches the prototype's opinionated modal behaviour.
 *
 * @usage
 * - Use for confirmations, short forms, and focused actions (not full wizards)
 * - For larger multi-step flows, use a custom modal with wider max-width via className override
 * - Always include DialogHeader with a DialogTitle for accessibility
 * - Use DialogBody for main content area between header and footer
 * - DialogFooter right-aligns action buttons with consistent gap-3 spacing
 *
 * @structure
 * - DialogHeader: horizontal flex with justify-between, use for title + optional close button
 * - DialogBody: padded content area (px-6 py-4)
 * - DialogFooter: right-aligned button row (px-6 py-4, gap-3)
 *
 * @examples
 * - Confirmation: Header (title) → Body (message) → Footer (Cancel + Confirm buttons)
 * - Form dialog: Header (title) → Body (form fields) → Footer (Cancel + Submit)
 */
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[150] bg-black/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onInteractOutside={(e) => e.preventDefault()}
      className={cn(
        "fixed left-[50%] top-[50%] z-[150] grid w-full max-w-[460px] translate-x-[-50%] translate-y-[-50%] border border-border bg-card p-0 gap-0 overflow-hidden shadow-lg rounded-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between px-6 pt-6",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 py-4", className)}
    {...props}
  />
)
DialogBody.displayName = "DialogBody"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 px-6 py-4",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-base text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
