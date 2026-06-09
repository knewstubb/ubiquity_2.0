/**
 * @component Pagination
 * @description Compound pagination component with numbered page links, prev/next navigation, and ellipsis overflow.
 *
 * @designDecisions
 * - PaginationLink uses standalone utility classes rather than buttonVariants() — decoupled from
 *   Button's variant system to avoid inheriting unwanted hover backgrounds and padding
 * - Active page uses teal border + teal text + font-semibold + rounded-md to clearly indicate
 *   current position while keeping the pagination row visually lightweight
 * - Active page hover shows bg-accent for subtle feedback without competing with the teal border
 * - Inactive pages use muted-foreground with hover-to-primary (teal) transition and explicit
 *   hover:bg-transparent — prevents any background highlight on hover for a cleaner look
 * - Border radius is rounded-md for both sizes — simplified from the previous size-specific radius
 * - Phosphor CaretLeft/CaretRight for directional arrows (consistent with icon system)
 * - DotsThree for ellipsis rather than text "..." — scales better at small sizes
 * - PaginationPrevious/Next accept a `size` prop that flows through to PaginationLink —
 *   at 'sm' the padding, font size, height, and icon dimensions all reduce proportionally
 *   for use in compact contexts (modal footers, inline table controls)
 *
 * @usage
 * - Use for paginated tables, list views, and search results with server-side pagination
 * - Not for infinite scroll or load-more patterns
 * - Compose: Pagination > PaginationContent > PaginationItem > PaginationLink/Ellipsis/Prev/Next
 *
 * @sizes
 * - default: h-9 / min-w-9, 14px text, 16px icons — data tables, full-page lists
 * - sm: h-7 / min-w-7, 12px text, 12px icons — modal footers, dense UI, inline tables
 */
import * as React from "react"
import { CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { type ButtonProps } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1.5", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer select-none',
      size === 'sm' ? 'h-7 min-w-7 px-1.5 text-xs' : 'h-9 min-w-9 px-2',
      isActive
        ? 'border border-primary !text-primary font-semibold hover:bg-accent'
        : 'text-muted-foreground hover:text-primary hover:bg-transparent',
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  size,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size={size}
    className={cn("gap-1.5", className)}
    {...props}
  >
    <CaretLeft className={cn("h-4 w-4", size === 'sm' && "h-3 w-3")} />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  size,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size={size}
    className={cn("gap-1.5", className)}
    {...props}
  >
    <span>Next</span>
    <CaretRight className={cn("h-4 w-4", size === 'sm' && "h-3 w-3")} />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <DotsThree className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
