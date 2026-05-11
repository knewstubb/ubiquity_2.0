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
        variant === 'default' && !selected && 'bg-secondary text-foreground',
        variant === 'default' && selected && 'bg-primary/10 text-primary border border-primary',
        variant === 'outline' && !selected && 'bg-transparent text-foreground border border-border',
        variant === 'outline' && selected && 'bg-primary/10 text-primary border border-primary',
        variant === 'mint' && !selected && 'bg-success-subtle text-success-foreground border border-success-border',
        variant === 'mint' && selected && 'bg-success/10 text-success border border-success',
        variant === 'red' && !selected && 'bg-destructive-subtle text-destructive border border-destructive-border',
        variant === 'red' && selected && 'bg-destructive/10 text-destructive border border-destructive',
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
