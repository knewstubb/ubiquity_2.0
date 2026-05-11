import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

// Token colours from the UDS design system
const TOKEN_COLOURS = [
  { name: 'Primary (Teal)', value: '#14B88A' },
  { name: 'Warning (Amber)', value: '#F59E0B' },
  { name: 'Error (Red)', value: '#EF4444' },
  { name: 'Info (Sky)', value: '#38BDF8' },
  { name: 'Text Primary', value: '#27272A' },
  { name: 'Text Secondary', value: '#52525B' },
  { name: 'Text Muted', value: '#A1A1AA' },
  { name: 'Surface', value: '#F4F4F5' },
  { name: 'Background', value: '#FAFAFA' },
  { name: 'Border', value: '#E4E4E7' },
  { name: 'White', value: '#FFFFFF' },
]

interface ColourControlProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export function ColourControl({ value, onChange, label }: ColourControlProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm border border-border shrink-0"
              style={{ backgroundColor: value }}
            />
            <SelectValue placeholder="Select colour" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {TOKEN_COLOURS.map((colour) => (
            <SelectItem key={colour.value} value={colour.value}>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm border border-border shrink-0"
                  style={{ backgroundColor: colour.value }}
                />
                <span>{colour.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
