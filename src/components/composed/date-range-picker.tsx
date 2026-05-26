/**
 * @component DateRangePicker
 * @description A date range selector combining a Calendar (range mode) with preset shortcuts.
 * Uses Popover for the floating panel and Calendar for the date grid.
 *
 * @designDecisions
 * - Built on library primitives: Popover (floating panel), Calendar (date grid), Button (trigger)
 * - Presets are domain-configurable — pass any array of {label, start, end} objects
 * - Active preset highlighted in teal to show current selection
 * - Panel uses Popover's built-in animation (200ms fade+slide) and focus management
 * - Trigger shows formatted date range with calendar icon and tabular-nums
 * - Calendar range edges use filled teal circles (rounded-full exception documented here — standard date picker pattern)
 *
 * @usage
 * - Use for any date range filter where presets speed up common selections
 * - Pass domain-specific presets (billing cycles, quarters, months)
 * - For single date selection, use the Calendar component directly instead
 */

import { useState, useCallback, useMemo } from 'react'
import { CalendarBlank } from '@phosphor-icons/react'
import { type DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface DateRangePreset {
  label: string
  start: string
  end: string
}

export interface DateRangePickerProps {
  /** ISO date string for range start */
  startDate: string
  /** ISO date string for range end */
  endDate: string
  /** Called when start date changes */
  onStartDateChange: (date: string) => void
  /** Called when end date changes */
  onEndDateChange: (date: string) => void
  /** Array of preset shortcuts shown in the right panel */
  presets?: DateRangePreset[]
  /** Placeholder text when no date is selected */
  placeholder?: string
  /** Additional className for the trigger button */
  className?: string
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDate()
  const month = d.toLocaleString('en-GB', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  presets = [],
  placeholder = 'Select date range',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const selected: DateRange | undefined = useMemo(() => {
    if (!startDate || !endDate) return undefined
    return {
      from: new Date(startDate + 'T00:00:00'),
      to: new Date(endDate + 'T00:00:00'),
    }
  }, [startDate, endDate])

  const defaultMonth = useMemo(() => {
    if (!startDate) return new Date()
    return new Date(startDate + 'T00:00:00')
  }, [startDate])

  const handleRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (range?.from) {
        onStartDateChange(toIso(range.from))
        if (range.to) {
          onEndDateChange(toIso(range.to))
          setOpen(false)
        }
      }
    },
    [onStartDateChange, onEndDateChange],
  )

  const handlePresetClick = useCallback(
    (preset: DateRangePreset) => {
      onStartDateChange(preset.start)
      onEndDateChange(preset.end)
      setOpen(false)
    },
    [onStartDateChange, onEndDateChange],
  )

  const hasSelection = startDate && endDate
  const displayLabel = hasSelection
    ? `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start gap-2 font-medium",
            !hasSelection && "text-muted-foreground",
            className,
          )}
          aria-label="Select date range"
          aria-expanded={open}
        >
          <CalendarBlank size={16} weight="regular" className="text-tertiary-foreground shrink-0" />
          <span className="tabular-nums">{displayLabel}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 flex bg-background"
        align="start"
        sideOffset={4}
      >
        {/* Calendar */}
        <div className="p-3">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleRangeSelect}
            defaultMonth={defaultMonth}
            numberOfMonths={1}
          />
        </div>

        {/* Presets */}
        {presets.length > 0 && (
          <div className="border-l border-border py-3 min-w-[180px] max-h-[340px] overflow-y-auto flex flex-col">
            {presets.map((preset) => {
              const isActive = preset.start === startDate && preset.end === endDate
              return (
                <button
                  key={preset.label}
                  type="button"
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm text-foreground bg-transparent border-none cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-secondary",
                    isActive && "text-primary font-semibold",
                  )}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
