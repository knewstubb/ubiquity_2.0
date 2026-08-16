import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      surface: {
        /** Use on zinc-50 backgrounds (pages, modals) — white textarea for contrast */
        onBackground: "bg-card",
        /** Use on white surfaces (cards, panels) — subtle grey for contrast */
        onCard: "bg-muted",
      },
    },
    defaultVariants: {
      surface: "onBackground",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, surface, ...props }, ref) => {
    return (
      <textarea
        data-component="ui/Textarea"
        className={cn(textareaVariants({ surface }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
