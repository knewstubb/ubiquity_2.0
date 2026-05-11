import { CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SplitButtonOption {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

interface SplitButtonProps {
  label: string
  onClick: () => void
  options: SplitButtonOption[]
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm'
  disabled?: boolean
  className?: string
}

const variantStyles = {
  default: {
    base: 'bg-primary text-primary-foreground',
    hover: 'hover:bg-primary/80',
    divider: 'border-primary-foreground/30',
  },
  outline: {
    base: 'bg-background text-primary border border-primary',
    hover: 'hover:bg-primary/5',
    divider: 'border-primary/30',
  },
} as const

const sizeStyles = {
  default: {
    primary: 'h-9 px-4 text-sm',
    trigger: 'h-9 w-9',
  },
  sm: {
    primary: 'h-8 px-3 text-sm',
    trigger: 'h-8 w-7',
  },
} as const

export function SplitButton({
  label,
  onClick,
  options,
  variant = 'default',
  size = 'default',
  disabled = false,
  className,
}: SplitButtonProps) {
  const styles = variantStyles[variant]
  const sizes = sizeStyles[size]

  return (
    <div
      className={cn(
        'inline-flex items-stretch rounded-lg overflow-hidden',
        styles.base,
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
          'active:translate-y-px',
          sizes.primary,
          styles.hover
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>

      <div className={cn('w-px self-stretch', styles.divider, 'bg-current opacity-30')} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
              'active:translate-y-px',
              sizes.trigger,
              styles.hover
            )}
            disabled={disabled}
            aria-label="More options"
            onClick={(e) => e.stopPropagation()}
          >
            <CaretDown size={12} weight="bold" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.label}
              onClick={option.onClick}
              className="cursor-pointer"
            >
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
