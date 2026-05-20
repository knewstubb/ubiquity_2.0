import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PrefixInputControlProps {
  value: string
  onChange: (value: string) => void
  label: string
  prefix: string
}

export function PrefixInputControl({ value, onChange, prefix }: PrefixInputControlProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-full rounded-md border border-input bg-background",
        "ring-offset-background",
        "focus-within:border-ring focus-within:shadow-ring"
      )}
    >
      <span
        className="flex items-center px-2 text-xs text-muted-foreground bg-muted border-r border-input rounded-l-md select-none"
      >
        {prefix}
      </span>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 h-full border-0 rounded-l-none shadow-none focus-visible:shadow-none focus-visible:border-transparent text-sm px-2 py-1"
      />
    </div>
  )
}
