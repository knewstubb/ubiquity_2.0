import { Label } from '@/components/ui/label'

interface ColourControlProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export function ColourControl({ value, onChange, label }: ColourControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground font-mono">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-border p-0.5"
        />
        <span className="text-sm text-foreground font-mono">{value}</span>
      </div>
    </div>
  )
}
