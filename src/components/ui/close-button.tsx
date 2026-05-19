/**
 * @component CloseButton
 * @description Standardised close/dismiss button (X icon) used across modals, panels, banners,
 * and dialogs. Single source of truth for all close button styling in the application.
 *
 * @designDecisions
 * - Uses CVA for size variants to ensure consistent dimensions across all contexts
 * - Supports asChild via Radix Slot for composing with primitives like SheetPrimitive.Close
 * - Hover state uses bg-secondary (subtle grey) rather than opacity to maintain contrast
 * - Focus ring follows the project standard: ring-2 ring-ring ring-offset-2
 * - Icon is always centred with no visible label — sr-only "Close" provides accessible name
 * - No text variant — this is icon-only by design. Use Button for labelled close actions.
 *
 * @usage
 * - Use for dismissing containers (modals, sheets, panels, banners, toasts)
 * - Do NOT use for chip remove buttons or field clear buttons (those have different semantics)
 * - Do NOT use for "Cancel" actions that need a visible label — use Button variant="ghost" instead
 * - Position with className (e.g. "absolute right-4 top-4") — the component has no built-in positioning
 *
 * @sizes
 * - xs (20×20px, 12px icon): Compact contexts like inline banners or dense UI
 * - sm (24×24px, 14px icon): Modal headers via ModalHeader component
 * - default (28×28px, 16px icon): Standard panels, sheets, validation summaries
 * - lg (32×32px, 20px icon): Large modals, slide-out panels, feature flags modal
 *
 * @examples
 * - Standalone: <CloseButton size="sm" onClick={onClose} />
 * - With Radix: <CloseButton asChild className="absolute right-4 top-4"><SheetPrimitive.Close /></CloseButton>
 * - Custom label: <CloseButton aria-label="Dismiss notification" onClick={dismiss} />
 */
import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const closeButtonVariants = cva(
  "inline-flex items-center justify-center rounded-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "h-5 w-5",
        sm: "h-6 w-6",
        default: "h-7 w-7",
        lg: "h-8 w-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeButtonVariants> {
  asChild?: boolean
}

const iconSizeMap: Record<NonNullable<CloseButtonProps["size"]>, number> = {
  xs: 12,
  sm: 14,
  default: 16,
  lg: 20,
}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, size = "default", asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const iconSize = iconSizeMap[size ?? "default"]

    return (
      <Comp
        className={cn(closeButtonVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        <Slottable>{children}</Slottable>
        <X size={iconSize} />
        <span className="sr-only">Close</span>
      </Comp>
    )
  }
)
CloseButton.displayName = "CloseButton"

export { CloseButton, closeButtonVariants }
