import { cn } from '@/lib/utils'

interface RadioCardProps {
  selected: boolean
  onSelect: () => void
  label: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode // For inline secondary content below
}

export function RadioCard({
  selected,
  onSelect,
  label,
  disabled = false,
  className,
  children,
}: RadioCardProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md border text-left text-sm transition-colors duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          selected
            ? 'border-primary bg-accent'
            : 'border-border bg-background hover:border-primary/50 hover:bg-accent/25',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150',
            selected ? 'border-primary' : 'border-muted-foreground'
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </button>
      {/* Secondary content rendered directly below when provided */}
      {selected && children && (
        <div className="mt-2 mb-1 rounded-lg bg-muted p-3 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
