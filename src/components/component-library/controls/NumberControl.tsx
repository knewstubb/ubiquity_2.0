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
    <div className="flex flex-col gap-1">
      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
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
