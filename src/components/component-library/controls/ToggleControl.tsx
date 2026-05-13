import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ToggleControlProps {
  value: boolean
  onChange: (value: boolean) => void
  label: string
}

export function ToggleControl({ value, onChange, label }: ToggleControlProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} className="scale-80" />
    </div>
  )
}
