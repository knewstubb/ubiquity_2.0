import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TextControlProps {
  value: string
  onChange: (value: string) => void
  label: string
  /** When true, hides the standalone label (used when a parent switch provides context) */
  hideLabel?: boolean
}

export function TextControl({ value, onChange, label, hideLabel }: TextControlProps) {
  if (hideLabel) {
    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs"
        placeholder={label}
      />
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs"
      />
    </div>
  )
}
