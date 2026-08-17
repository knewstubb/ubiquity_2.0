import { Switch } from '@/components/atoms/switch'
import { Label } from '@/components/atoms/label'

interface ToggleControlProps {
  value: boolean
  onChange: (value: boolean) => void
  label: string
}

export function ToggleControl({ value, onChange, label }: ToggleControlProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} size="sm" />
    </div>
  )
}
