/**
 * @component CardSelector
 * @deprecated Use SelectorCard variant="icon" directly. This is a thin wrapper for backwards compatibility.
 */

import { SelectorCard } from './selector-card'

interface CardSelectorProps {
  icon: React.ReactNode
  label: string
  description?: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function CardSelector({ icon, label, description, selected = false, disabled = false, onClick, className }: CardSelectorProps) {
  return (
    <SelectorCard
      variant="icon"
      icon={icon}
      label={label}
      description={description}
      selected={selected}
      disabled={disabled}
      onSelect={onClick ?? (() => {})}
      className={className}
    />
  )
}
