/**
 * @component RadioCard
 * @deprecated Use SelectorCard variant="radio" directly. This is a thin wrapper for backwards compatibility.
 */

import { SelectorCard } from './selector-card'

interface RadioCardProps {
  selected: boolean
  onSelect: () => void
  label: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function RadioCard({ selected, onSelect, label, disabled, className, children }: RadioCardProps) {
  return (
    <SelectorCard
      variant="radio"
      selected={selected}
      onSelect={onSelect}
      label={label}
      disabled={disabled}
      className={className}
    >
      {children}
    </SelectorCard>
  )
}
