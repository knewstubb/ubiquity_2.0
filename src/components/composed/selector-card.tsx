/**
 * @component SelectorCard
 * @description Unified selectable card component with four variants: icon, checkbox, radio, and option.
 * Replaces CardSelector, CheckboxCard, and RadioCard with a single cohesive API.
 *
 * @designDecisions
 * - All variants share rounded (4px) border, transition-colors, and cursor-pointer base styling
 * - Selected state: border-primary bg-accent shadow-sm
 * - Unselected state: border-border bg-background with hover preview of selected palette
 * - Icon and option variants use checkmark badge positioned -top-1.5 -right-1.5
 * - Badge and checkbox icons use text-primary-foreground (not text-white) for dark mode resilience
 * - Checkbox variant uses filled primary bg indicator when selected
 * - Radio variant uses a dot indicator and reveals children in a bg-muted box when selected
 * - Option variant is horizontal with icon left, text right, and badge top-right
 * - Disabled state applies opacity-50 and cursor-not-allowed uniformly
 * - Focus ring uses ring-ring per design system focus conventions
 *
 * @usage
 * - icon: primary source selection, connection type chooser (grid layout)
 * - checkbox: multi-select patterns (channels, enrichment options)
 * - radio: filter type selection, single-select with progressive disclosure
 * - option: mode selection cards with icon + title + description
 *
 * @accessibility
 * - radio and option variants use role="radio" — wrap them in an element with
 *   role="radiogroup" and an aria-label describing the group purpose.
 * - icon variant uses aria-pressed for toggle semantics.
 * - checkbox variant uses role="checkbox" with aria-checked.
 */

import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type SelectorCardVariant = 'icon' | 'checkbox' | 'radio' | 'option'

interface SelectorCardBaseProps {
  variant: SelectorCardVariant
  selected: boolean
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

interface SelectorCardSingleProps extends SelectorCardBaseProps {
  variant: 'icon' | 'radio' | 'option'
  onSelect: () => void
}

interface SelectorCardMultiProps extends SelectorCardBaseProps {
  variant: 'checkbox'
  onToggle: () => void
}

export type SelectorCardProps = SelectorCardSingleProps | SelectorCardMultiProps


/* ── Badge sub-component ── */

function CheckBadge() {
  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
      <Check size={12} weight="bold" className="text-primary-foreground" />
    </span>
  )
}

/* ── Shared styles ── */

const baseClasses =
  'rounded border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

const disabledClasses = 'opacity-50 cursor-not-allowed'

/* ── Icon Variant ── */

function IconVariant({ selected, label, description, icon, disabled, className, onSelect }: SelectorCardSingleProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        baseClasses,
        'relative overflow-visible flex flex-col items-center justify-center gap-2 px-4 py-3',
        'active:translate-y-px',
        selected
          ? 'border-primary text-primary bg-accent shadow-sm hover:shadow-md'
          : 'border-border text-muted-foreground bg-background hover:border-primary hover:text-primary hover:bg-accent/25',
        disabled && disabledClasses,
        className,
      )}
    >
      {selected && <CheckBadge />}
      {icon && <span className="flex items-center justify-center [&_svg]:size-7">{icon}</span>}
      <span className="text-base font-semibold text-center leading-tight">{label}</span>
      {description && (
        <span className={cn(
          'text-xs text-center leading-snug',
          selected ? 'text-primary' : 'text-muted-foreground',
        )}>
          {description}
        </span>
      )}
    </button>
  )
}

/* ── Checkbox Variant ── */

function CheckboxVariant({ selected, label, description, disabled, className, onToggle }: SelectorCardMultiProps) {
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
        baseClasses,
        'group flex items-center gap-3 px-4 py-3 text-left',
        'active:translate-y-px',
        selected
          ? 'border-primary bg-accent shadow-sm hover:shadow-md'
          : 'border-border bg-background hover:border-primary hover:bg-accent/25',
        disabled && disabledClasses,
        className,
      )}
    >
      <div className={cn(
        'w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors duration-150',
        selected
          ? 'border-2 border-primary bg-primary'
          : 'border border-muted-foreground group-hover:border-primary bg-background',
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

/* ── Radio Variant ── */

function RadioVariant({ selected, label, disabled, className, children, onSelect }: SelectorCardSingleProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          baseClasses,
          'flex items-center gap-3 px-3 py-2.5 text-left text-sm',
          selected
            ? 'border-primary bg-accent shadow-sm'
            : 'border-border bg-background hover:border-primary hover:bg-accent/25',
          disabled && disabledClasses,
          className,
        )}
      >
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
            selected ? 'border-primary' : 'border-muted-foreground',
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </button>
      {selected && children && (
        <div className="mt-2 mb-1 rounded bg-muted p-3 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Option Variant ── */

function OptionVariant({ selected, label, description, icon, disabled, className, onSelect }: SelectorCardSingleProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        baseClasses,
        'relative overflow-visible flex items-start gap-3 p-4 rounded text-left',
        'active:translate-y-px',
        selected
          ? 'border-primary bg-accent shadow-sm'
          : 'border-border bg-background hover:border-primary hover:bg-accent/25',
        disabled && disabledClasses,
        className,
      )}
    >
      {selected && <CheckBadge />}
      {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground m-0">{label}</p>
        {description && <p className="text-xs text-muted-foreground m-0 mt-1">{description}</p>}
      </div>
    </button>
  )
}

/* ── Main export ── */

export function SelectorCard(props: SelectorCardProps) {
  switch (props.variant) {
    case 'icon':
      return <IconVariant {...props} />
    case 'checkbox':
      return <CheckboxVariant {...props} />
    case 'radio':
      return <RadioVariant {...props} />
    case 'option':
      return <OptionVariant {...props} />
  }
}
