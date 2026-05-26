/**
 * @component Combobox
 * @description Searchable single-select dropdown built on Radix Popover. Provides
 * type-ahead filtering for long option lists while matching the standard input height (h-9).
 *
 * @designDecisions
 * - Uses Radix Popover (not Command/Dialog) to keep the dropdown inline and lightweight
 * - Popover width matches trigger via --radix-popover-trigger-width for visual alignment
 * - Search resets on close to avoid stale filter state on reopen
 * - Check icon + font-medium on selected item for clear active indication
 *
 * @usage
 * - Use when the option list exceeds ~7 items and benefits from search filtering
 * - For short lists without search, prefer a standard Select
 * - Controlled only (value + onValueChange) — no uncontrolled mode
 *
 * @status
 * - normal: default border, standard focus ring
 * - warning: amber border and focus ring (validation hint)
 * - error: red border and focus ring (validation failure)
 *
 * @examples
 * - Field mapping dropdowns where users pick from 20+ database columns
 * - Timezone or country selectors with searchable lists
 */
import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import { CaretDown, Check, MagnifyingGlass } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

/* ── Types ── */

export interface ComboboxProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  status?: "normal" | "warning" | "error"
}

/* ── Component ── */

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = "Select…",
      searchPlaceholder = "Search…",
      disabled = false,
      className,
      status = "normal",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const selectedLabel = React.useMemo(
      () => options.find((o) => o.value === value)?.label ?? "",
      [options, value],
    )

    const filtered = React.useMemo(() => {
      if (!search) return options
      const lower = search.toLowerCase()
      return options.filter((o) => o.label.toLowerCase().includes(lower))
    }, [options, search])

    function handleSelect(optionValue: string) {
      onValueChange(optionValue)
      setOpen(false)
    }

    function handleOpenChange(nextOpen: boolean) {
      setOpen(nextOpen)
      if (!nextOpen) {
        setSearch("")
      }
    }

    return (
      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
              status === "normal" &&
                "border-border focus-visible:border-ring focus-visible:shadow-ring",
              status === "warning" &&
                "border-warning focus-visible:border-warning focus-visible:shadow-ring-warning",
              status === "error" &&
                "border-destructive focus-visible:border-destructive focus-visible:shadow-ring-destructive",
              className,
            )}
          >
            <span
              className={cn(
                "truncate",
                !value && "text-muted-foreground",
              )}
            >
              {value ? selectedLabel : placeholder}
            </span>
            <CaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="z-[200] w-[var(--radix-popover-trigger-width)] min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <MagnifyingGlass className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none border-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>

            {/* Options list */}
            <div className="max-h-[200px] overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No results found.
                </div>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-secondary focus:bg-secondary",
                      option.value === value && "font-medium",
                    )}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {option.value === value && (
                        <Check className="h-4 w-4" />
                      )}
                    </span>
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    )
  },
)

Combobox.displayName = "Combobox"
