/**
 * @component CardSelector
 * @description Selectable card with icon, label, and checkmark badge for single/multi-choice selections.
 *
 * @designDecisions
 * - Uses bg-accent (not bg-secondary) for selected state to provide clear visual distinction
 * - Shadow-md on selected state reinforces elevation hierarchy (selected = raised)
 * - Selected hover deepens shadow (shadow-lg) rather than changing colour — already at full teal
 * - Unselected hover previews the selected palette (teal border + text + accent/25 bg)
 * - Checkmark badge positioned -top-1.5 -right-1.5 to overlap border without clipping content
 * - overflow-visible on the button ensures the badge renders outside the box without being clipped
 * - transition-colors (not transition-all) to avoid animating shadow/transform on hover
 * - Disabled state relies on native HTML disabled attribute (no explicit opacity class)
 *
 * @usage
 * - Use for 2–6 option selections where each option benefits from an icon
 * - Prefer over radio buttons when options are visual/categorical
 * - Wrap in a grid container at the usage site to control layout
 *
 * @variants
 * - selected: teal border, accent background, shadow-md, hover deepens to shadow-lg, checkmark badge
 * - unselected: neutral border, background, muted text, hover previews teal palette
 * - disabled: native HTML disabled (no pointer events via browser default)
 */
import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface CardSelectorProps {
  icon: React.ReactNode
  label: string
  /** Optional description text below the label */
  description?: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function CardSelector({
  icon,
  label,
  description,
  selected = false,
  disabled = false,
  onClick,
  className,
}: CardSelectorProps) {
  return (
    <button
      type="button"
      className={cn(
        'relative overflow-visible flex flex-col items-center justify-center gap-2 rounded-md border px-4 py-3 transition-colors duration-150',
        'active:translate-y-px',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-primary text-primary bg-accent shadow-md hover:shadow-lg'
          : 'border-border text-muted-foreground bg-background hover:border-primary hover:text-primary hover:bg-accent/25',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      {selected && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check size={12} weight="bold" className="text-white" />
        </span>
      )}
      <span className="flex items-center justify-center [&_svg]:size-7">{icon}</span>
      <span className="text-base font-semibold text-center leading-tight">
        {label}
      </span>
      {description && (
        <span className="text-xs text-center leading-snug text-muted-foreground">
          {description}
        </span>
      )}
    </button>
  )
}
