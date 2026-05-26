/**
 * @component Checkbox
 * @description A controlled checkbox built on Radix UI primitives with support
 * for checked, unchecked, and indeterminate states.
 *
 * @designDecisions
 * - Uses Phosphor icons (Check / Minus) to match the project icon system
 * - Indeterminate state renders a bold minus icon at a slightly smaller size (12px vs 16px) for visual distinction
 * - 16×16px hit area with rounded-sm corners aligns with UDS atom sizing
 *
 * @usage
 * - Use `primary` (default) for standard form checkboxes and filters
 * - Use `secondary` in warning/destructive contexts where teal clashes with the intent colour
 * - Use `secondary` for high-contrast contexts (e.g. dark table headers, select-all controls)
 * - Pass `checked="indeterminate"` for partial-selection indicators (e.g. bulk select with mixed state)
 *
 * @variants
 * - primary: teal border/fill — default for most form contexts
 * - secondary: dark neutral border/fill (matches secondary button) — use inside warning/destructive dialogs, or anywhere the primary teal would clash with the surrounding intent colour
 *
 * @examples
 * - Basic: <Checkbox checked={true} onCheckedChange={handler} />
 * - Secondary select-all: <Checkbox variant="secondary" checked="indeterminate" />
 */
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: 'primary' | 'secondary'
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = 'primary', ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      variant === 'primary' && "border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
      variant === 'secondary' && "border-muted-foreground data-[state=checked]:bg-muted-foreground data-[state=checked]:text-secondary data-[state=indeterminate]:bg-muted-foreground data-[state=indeterminate]:text-secondary",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      {props.checked === 'indeterminate' ? (
        <Minus className="h-3 w-3" weight="bold" />
      ) : (
        <Check className="h-4 w-4" weight="bold" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
