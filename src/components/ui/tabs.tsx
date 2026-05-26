/**
 * @component Tabs
 * @description Tab navigation built on Radix Tabs primitive. Supports two visual variants:
 * pill (enclosed, grey background) and underline (transparent, bottom border indicator).
 *
 * @designDecisions
 * - Pill variant: grey muted background, rounded container, active tab gets white bg + shadow.
 *   Use for compact content switching inside cards/panels.
 * - Underline variant: transparent background, full-width border-bottom, active tab gets
 *   foreground text + 2px bottom border. Use for page-level navigation within a view.
 * - Variant is set on TabsList and inherited by TabsTrigger via CSS context.
 * - Both variants use Radix primitives for keyboard nav + accessibility.
 * - Badge uses Tailwind `group` / `group-data-[state=active]` pattern so the badge span
 *   reacts to the parent trigger's Radix data-state attribute (the attribute lives on the
 *   trigger, not the badge itself).
 *
 * @usage
 * - <TabsList variant="pill"> — default, compact content tabs
 * - <TabsList variant="underline"> — page-level navigation, filter tabs
 * - TabsTrigger accepts an optional badge prop for count indicators
 */
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

type TabsVariant = 'pill' | 'underline'
type TabsSize = 'default' | 'compact'

const TabsVariantContext = React.createContext<TabsVariant>('pill')
const TabsSizeContext = React.createContext<TabsSize>('default')

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsVariant
  size?: TabsSize
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = 'pill', size = 'default', ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsSizeContext.Provider value={size}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          variant === 'pill' && "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          variant === 'underline' && "flex items-center gap-0 border-b border-border",
          className
        )}
        {...props}
      />
    </TabsSizeContext.Provider>
  </TabsVariantContext.Provider>
))
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Optional count badge displayed after the label */
  badge?: number
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, badge, children, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext)
  const size = React.useContext(TabsSizeContext)

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "group inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === 'pill' && "rounded-sm px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        variant === 'underline' && size === 'default' && "px-3.5 py-2.5 text-sm text-muted-foreground border-b-2 border-transparent -mb-px transition-colors duration-150 hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:font-semibold",
        variant === 'underline' && size === 'compact' && "px-3 py-2 text-xs text-muted-foreground border-b-2 border-transparent -mb-px transition-colors duration-150 hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:font-semibold",
        className
      )}
      {...props}
    >
      {children}
      {badge !== undefined && (
        <span className={cn(
          "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
          "bg-muted text-muted-foreground",
          "group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground",
        )}>
          {badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsVariant, TabsSize }
