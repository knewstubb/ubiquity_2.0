/**
 * @component SpinnerInput
 * @description Numeric input with increment/decrement stepper buttons.
 * Uses a single unified container with a raw input and stepper column,
 * matching the design system rather than native browser styling.
 *
 * @designDecisions
 * - Single border wrapper (rounded-md) with internal raw input and stepper
 *   column — avoids border-join seam issues from composing two bordered elements
 * - focus-within on the wrapper provides consistent ring styling across
 *   input focus and stepper interaction
 * - Uses CaretUp/CaretDown Phosphor icons for stepper buttons
 * - Stepper column separated by border-l with a border-t divider between
 *   increment and decrement
 * - Input accepts keyboard entry, steppers provide click-based adjustment
 * - min/max/step props control the allowed range
 * - rounded-md (6px) matches system radius per docs/ui/borders-radius.md
 *
 * @usage
 * - Bounded numeric values: quantity pickers, day counts, depth limits
 * - Prefer over raw number Input when click-to-adjust is more ergonomic
 * - Not for large ranges or unbounded values — use Input with type="number"
 */

import * as React from 'react'
import { CaretUp, CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface SpinnerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: number | string
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
}

const SpinnerInput = React.forwardRef<HTMLInputElement, SpinnerInputProps>(
  ({ className, value, onChange, min, max, step = 1, label, disabled, ...props }, ref) => {
    const numValue = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : undefined)

    function increment() {
      if (disabled) return
      const current = numValue ?? 0
      const next = current + step
      if (max !== undefined && next > max) return
      onChange?.(next)
    }

    function decrement() {
      if (disabled) return
      const current = numValue ?? 0
      const next = current - step
      if (min !== undefined && next < min) return
      onChange?.(next)
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const val = e.target.value
      if (val === '' || val === '-') {
        onChange?.(0)
        return
      }
      const parsed = parseFloat(val)
      if (!isNaN(parsed)) {
        if (min !== undefined && parsed < min) return
        if (max !== undefined && parsed > max) return
        onChange?.(parsed)
      }
    }

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        {label && (
          <label className="text-xs font-medium text-muted-foreground">{label}</label>
        )}
        <div className="flex items-stretch h-9 rounded-md border border-input bg-background overflow-hidden focus-within:border-ring focus-within:shadow-ring">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={numValue !== undefined ? numValue : ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="flex-1 px-3 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          <div className="flex flex-col border-l border-input shrink-0 w-7">
            <button
              type="button"
              tabIndex={-1}
              onClick={increment}
              disabled={disabled || (max !== undefined && (numValue ?? 0) >= max)}
              className="flex items-center justify-center flex-1 hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increment"
            >
              <CaretUp size={10} weight="bold" className="text-muted-foreground" />
            </button>
            <div className="border-t border-input" />
            <button
              type="button"
              tabIndex={-1}
              onClick={decrement}
              disabled={disabled || (min !== undefined && (numValue ?? 0) <= min)}
              className="flex items-center justify-center flex-1 hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrement"
            >
              <CaretDown size={10} weight="bold" className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)
SpinnerInput.displayName = 'SpinnerInput'

export { SpinnerInput }
