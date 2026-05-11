import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface RadioControlProps {
  value: string
  onChange: (value: string) => void
  label: string
  options: { label: string; value: string }[]
}

export function RadioControl({ value, onChange, label, options }: RadioControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {value}
        </span>
      </div>
      <RadioGroup value={value} onValueChange={onChange}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={`radio-${option.value}`} />
            <Label
              htmlFor={`radio-${option.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
