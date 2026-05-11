import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface CardSelectorProps {
  icon: React.ReactNode
  label: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function CardSelector({
  icon,
  label,
  selected = false,
  disabled = false,
  onClick,
  className,
}: CardSelectorProps) {
  return (
    <button
      type="button"
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-3 shadow-sm transition-all',
        'hover:border-primary hover:bg-success-subtle hover:text-primary',
        'active:translate-y-px',
        'disabled:opacity-50 disabled:pointer-events-none',
        selected
          ? 'border-primary text-primary bg-white'
          : 'border-border text-muted-foreground bg-transparent',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      {selected && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check size={12} weight="bold" className="text-white" />
        </span>
      )}
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-xs font-semibold text-center leading-tight">
        {label}
      </span>
    </button>
  )
}
