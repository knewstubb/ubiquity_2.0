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
      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}
