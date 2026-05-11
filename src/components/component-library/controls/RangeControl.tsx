import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface RangeControlProps {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
  step?: number
}

export function RangeControl({ value, onChange, label, min = 0, max = 100, step = 1 }: RangeControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}
