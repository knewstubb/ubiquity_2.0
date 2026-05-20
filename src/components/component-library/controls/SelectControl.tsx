import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface SelectControlProps {
  value: string
  onChange: (value: string) => void
  label: string
  options: { label: string; value: string }[]
  /** When true, shows label as a grey prefix zone instead of a standalone label above */
  inline?: boolean
}

export function SelectControl({ value, onChange, label, options, inline }: SelectControlProps) {
  if (inline) {
    return (
      <div className={cn(
        "flex h-8 w-full rounded-md border border-input bg-background overflow-hidden",
        "focus-within:border-ring focus-within:shadow-ring"
      )}>
        <span className="flex items-center px-2 text-xs text-muted-foreground bg-muted border-r border-input select-none shrink-0">
          {label}
        </span>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-full border-0 rounded-none shadow-none focus:shadow-none focus:ring-0 text-sm flex-1 min-w-0">
            <SelectValue placeholder={`Select`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
