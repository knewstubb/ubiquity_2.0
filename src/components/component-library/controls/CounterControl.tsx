import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CounterControlProps {
  value: number
  onChange: (value: number) => void
  label: string
  min: number
  max: number
  step: number
  /** When 'active', the value display turns teal/green when value > 0 */
  variant?: 'default' | 'active'
}

export function CounterControl({ value, onChange, label, min, max, step, variant = 'default' }: CounterControlProps) {
  const isActive = variant === 'active' && value > 0

  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 shrink-0"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          −
        </Button>
        <span className={cn(
          "w-6 text-center text-xs font-medium tabular-nums",
          isActive && "text-primary"
        )}>
          {value}
        </span>
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 shrink-0"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </Button>
      </div>
    </div>
  )
}
