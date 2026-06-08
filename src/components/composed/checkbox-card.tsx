/**
 * @component CheckboxCard
 * @deprecated Use SelectorCard variant="checkbox" directly. This is a thin wrapper for backwards compatibility.
 */

import { SelectorCard } from './selector-card'

interface CheckboxCardProps {
  selected: boolean
  onToggle: () => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function CheckboxCard({ selected, onToggle, label, description, disabled, className }: CheckboxCardProps) {
  return (
    <SelectorCard
      variant="checkbox"
      selected={selected}
      onToggle={onToggle}
      label={label}
      description={description}
      disabled={disabled}
      className={className}
    />
  )
}
