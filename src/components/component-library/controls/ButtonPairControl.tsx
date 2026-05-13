import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ButtonPairControlProps {
  value: number | string
  onChange: (value: number | string) => void
  label: string
  labels: [string, string]
  min?: number
  max?: number
  step?: number
  options?: string[]
}

export function ButtonPairControl({
  value,
  onChange,
  label,
  labels,
  min,
  max,
  step = 1,
  options,
}: ButtonPairControlProps) {
  const isOptionsMode = options !== undefined && options.length > 0

  function handleDecrement() {
    if (isOptionsMode) {
      const currentIndex = options!.indexOf(value as string)
      const prevIndex = currentIndex <= 0 ? options!.length - 1 : currentIndex - 1
      onChange(options![prevIndex])
    } else {
      const numValue = value as number
      const newValue = numValue - step
      if (min === undefined || newValue >= min) {
        onChange(newValue)
      }
    }
  }

  function handleIncrement() {
    if (isOptionsMode) {
      const currentIndex = options!.indexOf(value as string)
      const nextIndex = currentIndex >= options!.length - 1 ? 0 : currentIndex + 1
      onChange(options![nextIndex])
    } else {
      const numValue = value as number
      const newValue = numValue + step
      if (max === undefined || newValue <= max) {
        onChange(newValue)
      }
    }
  }

  const isDecrementDisabled = !isOptionsMode && min !== undefined && (value as number) <= min
  const isIncrementDisabled = !isOptionsMode && max !== undefined && (value as number) >= max

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {String(value)}
        </span>
      </div>
      <div className={cn("flex items-center gap-2")}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          className="flex-1"
        >
          {labels[0]}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          className="flex-1"
        >
          {labels[1]}
        </Button>
      </div>
    </div>
  )
}
