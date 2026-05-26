/**
 * @component CheckboxCard
 * @description A selectable card with a checkbox indicator. Used for multi-select patterns
 * where the user can pick one or more options from a list.
 *
 * @designDecisions
 * - 4px radius per docs/ui/borders-radius.md default
 * - Selected state uses border-primary + bg-accent + shadow-sm (subtle tinted fill to reinforce selection)
 * - Selected hover darkens fill to bg-accent/75 (feedback that the card is still interactive)
 * - Unselected hover uses border-primary + bg-accent/25 (border tints teal on hover to hint interactivity)
 * - Checkbox uses filled primary background when checked (not just a border change)
 * - Unselected checkbox uses 1px border; selected uses 2px border for visual weight differentiation
 * - Unselected checkbox border tints teal on card hover (group-hover) to reinforce interactivity hint
 * - Renders as a button with role="checkbox" and aria-checked for accessibility
 * - Focus ring uses teal (--ring) per docs/ui/borders-radius.md focus rules
 * - Transition duration 150ms per docs/ui/motion.md state change timing
 *
 * @usage
 * - Use for multi-select option lists (data sources, permissions, feature toggles)
 * - For single-select, use CardSelector or SegmentedControl instead
 * - For simple boolean toggles, use Switch instead
 *
 * @variants
 * - default: card with checkbox, label, and optional description
 *
 * @examples
 * - <CheckboxCard selected={true} onToggle={handleToggle} label="Contacts" description="Contact database records" />
 * - <CheckboxCard selected={false} onToggle={handleToggle} label="Mailout Data" />
 * - <CheckboxCard selected={false} onToggle={handleToggle} label="Disabled option" disabled />
 */

import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface CheckboxCardProps {
  /** Whether the card is currently selected */
  selected: boolean
  /** Called when the card is clicked */
  onToggle: () => void
  /** Primary label text */
  label: string
  /** Optional description text below the label */
  description?: string
  /** Whether the card is disabled */
  disabled?: boolean
  /** Additional className */
  className?: string
}

export function CheckboxCard({
  selected,
  onToggle,
  label,
  description,
  disabled = false,
  className,
}: CheckboxCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded border text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px",
        selected
          ? "border-primary bg-accent shadow-sm hover:shadow-md"
          : "border-border bg-background hover:border-primary hover:bg-accent/25",
        disabled && "opacity-50 cursor-not-allowed hover:bg-background",
        className,
      )}
    >
      <div className={cn(
        "w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors duration-150",
        selected ? "border-2 border-primary bg-primary" : "border border-muted-foreground group-hover:border-primary bg-background",
      )}>
        {selected && <Check size={12} weight="bold" className="text-primary-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground m-0">{label}</p>
        {description && <p className="text-xs text-muted-foreground m-0">{description}</p>}
      </div>
    </button>
  )
}
