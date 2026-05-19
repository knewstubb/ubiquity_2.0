/**
 * @component Chip
 * @description Interactive label element used for tags, filters, and multi-select values.
 * Renders as a pill-shaped span with optional leading icon, dismiss button, and selectable state.
 *
 * @designDecisions
 * - Renders as a `<span>` not a `<button>` — selection behaviour is handled by the parent
 * - Dismiss button uses `e.stopPropagation()` to prevent triggering parent click handlers
 * - Dismiss button has its own `aria-label` ("Remove {label}") for screen reader clarity
 * - Selected state uses a solid fill with white text for clear visual distinction
 * - Disabled state uses opacity + pointer-events-none rather than a separate colour palette
 * - Rounded-full (pill shape) distinguishes chips from badges which use rounded-md
 * - All variants use an explicit border (transparent when no visible border needed) to prevent
 *   layout shift when toggling between variants or selected/unselected states
 *
 * @usage
 * - Use for removable tags in multi-select inputs (provide `onDismiss`)
 * - Use for filter pills in filter bars (use `selected` prop for toggle state)
 * - Use for status labels where colour semantics matter (mint for success, red for error)
 * - Do NOT use for navigation — use Badge or Button instead
 * - Do NOT use for counts/indicators — use Badge component instead
 * - Parent handles click-to-select; Chip only handles its own dismiss action
 *
 * @variants
 * - default: Neutral grey background — general-purpose tags and filters
 * - outline: Transparent with border — lighter visual weight, good for dense lists
 * - mint: Green-tinted — success/positive semantics (e.g. "Active", "Verified")
 * - red: Red-tinted — error/destructive semantics (e.g. "Failed", "Blocked")
 *
 * @sizes
 * - sm (24px height, text-xs): Compact contexts like inside inputs or dense filter bars
 * - default (28px height, text-sm): Standard usage in filter bars, tag lists, form fields
 *
 * @examples
 * - Basic tag: <Chip label="Marketing" />
 * - Dismissible: <Chip label="brad@example.com" onDismiss={() => remove(id)} />
 * - With icon: <Chip label="VIP" icon={<Star size={14} />} variant="mint" />
 * - Selected filter: <Chip label="Active" selected onClick={() => toggle('active')} />
 */
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  onDismiss?: () => void
  selected?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  variant?: 'default' | 'outline' | 'mint' | 'red'
  size?: 'sm' | 'default'
  className?: string
}

export function Chip({
  label,
  onDismiss,
  selected = false,
  disabled = false,
  icon,
  variant = 'default',
  size = 'default',
  className,
}: ChipProps) {
  const sizes = {
    sm: 'h-6 text-xs px-2 gap-1',
    default: 'h-7 text-sm px-2.5 gap-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors duration-150',
        sizes[size],
        variant === 'default' && !selected && 'bg-secondary text-foreground border border-transparent',
        variant === 'default' && selected && 'bg-primary text-white border border-primary',
        variant === 'outline' && !selected && 'bg-transparent text-foreground border border-border',
        variant === 'outline' && selected && 'bg-primary text-white border border-primary',
        variant === 'mint' && !selected && 'bg-success-subtle text-success-foreground border border-success-border',
        variant === 'mint' && selected && 'bg-success text-white border border-success',
        variant === 'red' && !selected && 'bg-destructive-subtle text-destructive border border-destructive-border',
        variant === 'red' && selected && 'bg-destructive text-white border border-destructive',
        disabled && 'opacity-40 pointer-events-none',
        className
      )}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="truncate">{label}</span>
      {onDismiss && (
        <button
          type="button"
          className={cn(
            'shrink-0 flex items-center justify-center rounded-full transition-colors duration-150',
            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
            'hover:bg-foreground/10 text-current'
          )}
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          disabled={disabled}
          aria-label={`Remove ${label}`}
        >
          <X size={size === 'sm' ? 10 : 12} weight="bold" />
        </button>
      )}
    </span>
  )
}
