import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { PropOption } from '@/data/componentRegistry'

// Default token colours from the UDS design system
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
  options?: PropOption[]
}

export function ColourControl({ value, onChange, label, options }: ColourControlProps) {
  const colours = options
    ? options.map(o => ({ name: o.label, value: o.value }))
    : TOKEN_COLOURS

  const currentColour = colours.find(c => c.value === value)

  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded-full border border-border shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="truncate">{currentColour?.name ?? value}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {colours.map((colour) => (
            <SelectItem key={colour.value} value={colour.value}>
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border shrink-0"
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
