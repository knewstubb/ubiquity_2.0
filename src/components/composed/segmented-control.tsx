import { cn } from '@/lib/utils'

interface SegmentedControlOption {
  label: string
  value: string
}

interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onValueChange: (value: string) => void
  fitToText?: boolean
  className?: string
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  fitToText = false,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'inline-flex border border-border rounded-md overflow-hidden',
        !fitToText && 'w-full',
        className
      )}
      role="radiogroup"
    >
      {options.map((option, i) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={cn(
            'py-2 px-4 text-[13px] font-medium text-tertiary-foreground bg-secondary cursor-pointer transition-colors duration-150 flex items-center justify-center',
            'hover:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            !fitToText && 'flex-1 min-w-0 truncate',
            i < options.length - 1 && 'border-r border-border',
            value === option.value && 'text-primary font-semibold bg-background border-b-2 border-b-primary'
          )}
          onClick={() => onValueChange(option.value)}
        >
          <span className={cn(!fitToText && 'truncate')}>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
