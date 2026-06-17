/**
 * @component DateModeSelector
 * @description Segmented control for selecting date comparison mode within the
 * filter builder's operator/value configuration step. Displays three options:
 * "Specific date", "Anniversary", and "Same day as".
 *
 * @designDecisions
 * - Uses a segmented button group (radio group pattern) matching the project's
 *   SegmentedControl component style: teal text for active, zinc-100 bg for inactive.
 * - 4px border radius per design system (rounded).
 * - The calling component handles visibility logic (hiding for in_last_n_days,
 *   is_empty, is_not_empty operators) — this component just renders the selector.
 * - Default selection is "Specific date" (value: 'specific').
 *
 * @usage
 * - Use inside OperatorValueConfig for date-type fields when the operator supports
 *   date mode selection (not in_last_n_days, is_empty, is_not_empty).
 *
 * @validates Requirements 7.14, 7.15, 7.16, 7.17
 */

import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export type DateMode = 'specific' | 'anniversary' | 'same_day'

export interface DateModeSelectorProps {
  value: DateMode
  onChange: (value: DateMode) => void
  className?: string
}

// ─── Options ─────────────────────────────────────────────────────────────────

const DATE_MODE_OPTIONS: { label: string; value: DateMode }[] = [
  { label: 'Specific date', value: 'specific' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Same day as', value: 'same_day' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function DateModeSelector({ value, onChange, className }: DateModeSelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex w-full border border-border rounded overflow-hidden',
        className
      )}
      role="radiogroup"
      aria-label="Date comparison mode"
    >
      {DATE_MODE_OPTIONS.map((option, i) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={cn(
            'flex-1 py-1.5 px-3 text-xs font-medium cursor-pointer transition-colors duration-150',
            'flex items-center justify-center',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            i < DATE_MODE_OPTIONS.length - 1 && 'border-r border-border',
            value === option.value
              ? 'text-primary font-semibold bg-background'
              : 'text-muted-foreground bg-secondary hover:text-foreground'
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
