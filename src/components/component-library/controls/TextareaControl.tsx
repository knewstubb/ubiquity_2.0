import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TextareaControlProps {
  value: string
  onChange: (value: string) => void
  label: string
  hideLabel?: boolean
}

export function TextareaControl({ value, onChange, label, hideLabel }: TextareaControlProps) {
  if (hideLabel) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[60px] text-sm resize-y"
        placeholder={label}
      />
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[60px] text-sm resize-y"
      />
    </div>
  )
}
