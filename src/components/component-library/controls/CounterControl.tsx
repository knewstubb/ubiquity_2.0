import { Label } from '@/components/ui/label'
import { NumberStepper } from '@/components/composed/number-stepper'

interface CounterControlProps {
  value: number
  onChange: (value: number) => void
  label: string
  min: number
  max: number
  step: number
  /** When 'active', the value display turns teal/green when value > min */
  variant?: 'default' | 'active'
}

export function CounterControl({ value, onChange, label, min, max, step, variant = 'default' }: CounterControlProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <NumberStepper
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        size="sm"
        variant={variant === 'active' ? 'toggle' : 'plain'}
      />
    </div>
  )
}
