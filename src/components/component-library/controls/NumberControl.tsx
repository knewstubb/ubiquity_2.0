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
    <div className="flex flex-col gap-0.5">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="h-8 text-sm"
      />
    </div>
  )
}
