import { Switch } from '../../ui/switch'
import { cn } from '../../../lib/utils'

interface ToggleControlProps {
  value: boolean
  onChange: (value: boolean) => void
  label: string
}

export function ToggleControl({ value, onChange, label }: ToggleControlProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3')}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}
