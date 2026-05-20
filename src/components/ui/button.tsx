/**
 * @component Button
 * @description Primary interactive element for actions. Uses CVA for variant/size
 * composition and Radix Slot for polymorphic rendering via `asChild`.
 *
 * @designDecisions
 * - `active:scale-95` on solid variants gives tactile click feedback
 * - `outline` uses `bg-transparent` so it layers cleanly over any surface
 * - `secondary` is a solid dark button (muted-foreground bg) for strong secondary actions
 * - `secondaryOutline` uses `border-border-strong` for a mid-weight outline that reads clearly against light surfaces without competing with primary teal actions
 * - Disabled state strips colour and adds opacity — consistent across all variants
 *
 * @usage
 * - `default` (teal): primary CTA — one per section max
 * - `destructive` (red): delete/remove actions
 * - `outline` (teal border): secondary action that still needs prominence (e.g. "Add new")
 * - `secondary` (dark solid): strong secondary — use sparingly alongside a primary
 * - `secondaryOutline` (dark grey border): low-emphasis — cancel buttons, filter toggles, toolbar actions
 * - `ghost`: inline/icon-only actions where a border would add noise
 * - `link`: inline text links styled as buttons
 *
 * @variants
 * - default: solid teal — primary actions
 * - destructive: solid red — irreversible/dangerous actions
 * - outline: transparent + teal border — prominent secondary
 * - secondary: solid dark — strong secondary
 * - secondaryOutline: transparent + border-strong — low-emphasis secondary
 * - ghost: no background until hover — minimal actions
 * - link: underline on hover — inline navigation
 *
 * @sizes
 * - sm (h-8, px-3): compact contexts — table rows, filter bars
 * - default (h-9, px-4): standard usage
 * - lg (h-10, px-6): hero CTAs, modal primary actions
 * - icon (h-9, w-9): icon-only square buttons
 *
 * @examples
 * - `<Button>Save changes</Button>` — primary action
 * - `<Button variant="secondaryOutline">Cancel</Button>` — cancel/dismiss
 * - `<Button variant="destructive">Delete</Button>` — destructive confirm
 * - `<Button variant="ghost" size="icon"><X /></Button>` — icon-only close
 * - `<Button asChild><Link to="/page">Go</Link></Button>` — polymorphic as link
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80 active:scale-95",
        outline:
          "bg-transparent text-primary border border-primary hover:bg-primary/5 active:translate-y-px",
        secondary:
          "bg-muted-foreground text-secondary border-transparent hover:bg-muted-foreground/80 active:scale-95",
        secondaryOutline:
          "bg-transparent text-foreground border border-border-strong hover:bg-secondary active:scale-95",
        ghost:
          "hover:bg-secondary hover:text-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-9 px-4 text-base",
        lg: "h-10 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
