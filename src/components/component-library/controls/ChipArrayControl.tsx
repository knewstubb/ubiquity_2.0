import { useState } from 'react'
import { X, Plus } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ChipArrayControlProps {
  value: string[]
  onChange: (value: string[]) => void
  label: string
  maxItems: number
}

export function ChipArrayControl({ value, onChange, label, maxItems }: ChipArrayControlProps) {
  const [inputValue, setInputValue] = useState('')

  const isAtMax = value.length >= maxItems

  function handleAdd() {
    const trimmed = inputValue.trim()
    if (!trimmed || isAtMax) return
    onChange([...value, trimmed])
    setInputValue('')
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{maxItems}
        </span>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((chip, index) => (
            <span
              key={`${chip}-${index}`}
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full border border-border',
                'bg-secondary px-2 py-0.5 text-xs text-foreground'
              )}
            >
              {chip}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                aria-label={`Remove ${chip}`}
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAtMax ? 'Max reached' : 'Add item…'}
          disabled={isAtMax}
          className="h-8 text-xs"
        />
        <Button
          type="button"
          variant="secondaryOutline"
          size="icon"
          onClick={handleAdd}
          disabled={isAtMax || !inputValue.trim()}
          className="h-8 w-8 shrink-0"
          aria-label="Add chip"
        >
          <Plus size={14} weight="bold" />
        </Button>
      </div>
    </div>
  )
}
