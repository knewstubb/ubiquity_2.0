/**
 * @component NumberStepper
 * @description Compact numeric input with decrement/value/increment buttons.
 *
 * @designDecisions
 * - Two variants serve different use cases:
 *   - `toggle`: value text turns primary (teal) when value > min, muted when at min.
 *     Use when 0 = off and 1+ = on.
 *   - `plain`: neutral foreground text always. Use when the value is always meaningful
 *     (e.g. column count min=2).
 * - Colour-only state indication (no circle/badge) keeps the component compact and
 *   avoids visual weight in dense controller panels.
 * - Three sizes: default (h-9), sm (h-7), xs (h-5) for different density contexts.
 * - Explicit bg-background on container ensures correct surface colour in nested/dark contexts.
 * - tabular-nums on the value ensures consistent width as numbers change.
 * - Buttons disable at min/max bounds with opacity reduction.
 *
 * @usage
 * - Use `variant="toggle"` when 0 means "off" (e.g. nesting depth, border radius)
 * - Use `variant="plain"` (default) when the value is always active (e.g. column count, row count)
 * - Use `size="xs"` in tight controller panels, `size="sm"` in standard panels
 *
 * @sizes
 * - xs: h-5, w-5, text-xs, 10px icons
 * - sm: h-7, w-7, text-sm, 12px icons
 * - default: h-9, w-9, text-base, 14px icons
 */
import { Minus, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface NumberStepperProps {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'xs' | 'sm' | 'default'
  /** 'toggle' shows number in a green circle when value > min (on/off semantics).
   *  'plain' always shows neutral text (magnitude-only, no on/off semantics). */
  variant?: 'toggle' | 'plain'
  className?: string
}

export function NumberStepper({
  value,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  size = 'default',
  variant = 'plain',
  className,
}: NumberStepperProps) {
  const isActive = value > min
  const atMin = value <= min
  const atMax = value >= max

  const sizes = {
    xs: { container: 'h-5', button: 'w-5', value: 'w-5 text-xs', icon: 10 },
    sm: { container: 'h-7', button: 'w-7', value: 'w-7 text-sm', icon: 12 },
    default: { container: 'h-9', button: 'w-9', value: 'w-9 text-base', icon: 14 },
  }

  const s = sizes[size]

  return (
    <div
      className={cn(
        'inline-flex items-stretch border border-input rounded-md overflow-hidden bg-background',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {/* Decrement */}
      <button
        type="button"
        className={cn(
          'flex items-center justify-center transition-colors duration-150',
          s.container, s.button,
          'text-foreground hover:bg-muted hover:text-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
        onClick={() => onValueChange(Math.max(min, value - step))}
        disabled={disabled || atMin}
        aria-label="Decrease"
      >
        <Minus size={s.icon} weight="bold" />
      </button>

      {/* Value */}
      <div
        className={cn(
          'flex items-center justify-center font-semibold tabular-nums transition-colors duration-150',
          s.container, s.value,
          variant === 'toggle' && isActive && 'text-primary',
          variant === 'toggle' && !isActive && 'text-muted-foreground',
          variant === 'plain' && 'text-foreground',
        )}
      >
        {value}
      </div>

      {/* Increment */}
      <button
        type="button"
        className={cn(
          'flex items-center justify-center transition-colors duration-150',
          s.container, s.button,
          'text-foreground hover:bg-muted hover:text-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
        onClick={() => onValueChange(Math.min(max, value + step))}
        disabled={disabled || atMax}
        aria-label="Increase"
      >
        <Plus size={s.icon} weight="bold" />
      </button>
    </div>
  )
}
