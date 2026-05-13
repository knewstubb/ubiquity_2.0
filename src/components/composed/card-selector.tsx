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
        'relative flex flex-col items-center justify-center gap-2 rounded-md border px-4 py-3 transition-all',
        'hover:border-primary hover:bg-success-subtle hover:text-primary hover:shadow-md',
        'active:translate-y-px',
        'disabled:opacity-50 disabled:pointer-events-none',
        selected
          ? 'border-primary text-primary bg-white shadow-md'
          : 'border-border text-muted-foreground bg-secondary',
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
      <span className="flex items-center justify-center [&_svg]:size-7">{icon}</span>
      <span className="text-base font-semibold text-center leading-tight">
        {label}
      </span>
    </button>
  )
}
