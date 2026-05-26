/**
 * @component Switch
 * @description Toggle switch for boolean on/off states. Built on Radix Switch primitive.
 *
 * @designDecisions
 * - Three sizes: default (h-6 w-11), sm (h-5 w-9), xs (h-4 w-7)
 * - Uses primary colour when checked, input colour when unchecked
 * - Thumb uses shadow-lg for depth against the track
 * - Focus ring uses ring token for accessibility
 * - Disabled state uses opacity-50 + cursor-not-allowed
 *
 * @sizes
 * - default: h-6 w-11, thumb h-5 w-5 — standard forms
 * - sm: h-5 w-9, thumb h-4 w-4 — controller panels, compact UI
 * - xs: h-4 w-7, thumb h-3 w-3 — inline, very tight spaces
 */
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: 'default' | 'sm' | 'xs'
}

const SIZES = {
  default: {
    root: 'h-6 w-11',
    thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
  },
  sm: {
    root: 'h-5 w-9',
    thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
  },
  xs: {
    root: 'h-4 w-7',
    thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
  },
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size = 'default', ...props }, ref) => {
  const s = SIZES[size]

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        s.root,
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
          s.thumb,
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
