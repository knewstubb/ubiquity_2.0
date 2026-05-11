import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NumberControlProps {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
  step?: number
}

export function NumberControl({ value, onChange, label, min, max, step }: NumberControlProps) {
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
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}
