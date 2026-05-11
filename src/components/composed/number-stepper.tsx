import { Minus, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface NumberStepperProps {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'default'
  variant?: 'default' | 'plain'
  className?: string
}

export function NumberStepper({
  value,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  size = 'default',
  variant = 'default',
  className,
}: NumberStepperProps) {
  const isActive = value > min
  const atMin = value <= min
  const atMax = value >= max

  const sizes = {
    sm: { container: 'h-7', button: 'w-7', value: 'w-7 text-sm', icon: 12 },
    default: { container: 'h-9', button: 'w-9', value: 'w-9 text-base', icon: 14 },
  }

  const s = sizes[size]

  return (
    <div
      className={cn(
        'inline-flex items-stretch border border-input rounded-md overflow-hidden',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {/* Decrement */}
      <button
        type="button"
        className={cn(
          'flex items-center justify-center transition-colors duration-150',
          s.container, s.button,
          'text-foreground hover:bg-muted hover:text-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
        onClick={() => onValueChange(Math.max(min, value - step))}
        disabled={disabled || atMin}
        aria-label="Decrease"
      >
        <Minus size={s.icon} weight="bold" />
      </button>

      {/* Value */}
      <div
        className={cn(
          'flex items-center justify-center font-semibold tabular-nums transition-colors duration-150',
          s.container, s.value,
          variant === 'default' && isActive
            ? 'bg-primary text-primary-foreground'
            : variant === 'default'
            ? 'bg-transparent text-muted-foreground'
            : 'bg-transparent text-foreground'
        )}
      >
        {value}
      </div>

      {/* Increment */}
      <button
        type="button"
        className={cn(
          'flex items-center justify-center transition-colors duration-150',
          s.container, s.button,
          'text-foreground hover:bg-muted hover:text-primary',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
        onClick={() => onValueChange(Math.min(max, value + step))}
        disabled={disabled || atMax}
        aria-label="Increase"
      >
        <Plus size={s.icon} weight="bold" />
      </button>
    </div>
  )
}
