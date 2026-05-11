import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TextControlProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export function TextControl({ value, onChange, label }: TextControlProps) {
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
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
