/**
 * @component SegmentedToggle
 * @description A two-option toggle selector rendered as pill segments within a rounded container.
 * Used for binary choices in forms (e.g. Create new / Skip missing, Any column / Mapped only).
 *
 * @designDecisions
 * - Outer container uses bg-secondary with generous padding (p-1.5) and full rounding (rounded-lg)
 * - Active segment: white background, rounded-md, subtle shadow, teal (primary) text
 * - Inactive segment: transparent background, muted text, hover brightens text
 * - Equal width segments via flex-1
 * - Transition on background and text colour for smooth state changes
 * - Full-width by default (w-full on container)
 *
 * @usage
 * - Use for any binary form choice where both options are equally weighted
 * - Not suitable for 3+ options (use a different pattern)
 * - Controlled only: value + onValueChange
 */
import { cn } from '@/lib/utils'

interface SegmentedToggleOption {
  value: string
  label: string
}

interface SegmentedToggleProps {
  value: string
  onValueChange: (value: string) => void
  options: [SegmentedToggleOption, SegmentedToggleOption]
  className?: string
  disabled?: boolean
}

export function SegmentedToggle({ value, onValueChange, options, className, disabled }: SegmentedToggleProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1.5 bg-secondary rounded-lg w-full', disabled && 'opacity-50 pointer-events-none', className)}>
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 text-center cursor-pointer',
              isActive
                ? 'bg-card text-primary shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground',
              disabled && 'cursor-not-allowed',
            )}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
