/**
 * @component FilterChipInput
 * @description Bulk value chip input for "Is in" / "Is not in" operators in the
 * filter builder condition modal. Supports adding chips via Enter key, multi-line
 * paste (one value per line), individual chip removal, and clear-all.
 *
 * @designDecisions
 * - Separate from the generic ChipInput (src/components/composed/chip-input.tsx)
 *   because this variant is purpose-built for bulk filter value entry with:
 *   multi-line paste splitting, count label, and no validation/dropdown features.
 * - Uses Badge (variant="outline") for chips to match the filter builder's visual
 *   language — lightweight and removable.
 * - Count label ("{N} values") provides at-a-glance feedback without scrolling
 *   through all chips.
 * - "Clear all" uses a ghost button for low visual weight — it's a destructive
 *   secondary action that shouldn't compete with confirm.
 * - Chip area has max-height with overflow-y-auto so large lists don't blow out
 *   the modal height.
 *
 * @usage
 * - Used inside ConditionModal's ValueInput when operator is "is_in" or "is_not_in"
 * - Purely controlled via value/onChange props
 *
 * @validates Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7
 */

import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FilterChipInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function FilterChipInput({
  value,
  onChange,
  placeholder = 'Type a value and press Enter…',
  className,
}: FilterChipInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addChip(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  function addChips(items: string[]) {
    const newChips = items
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !value.includes(s))

    // Deduplicate within the pasted batch
    const unique = [...new Set(newChips)]
    if (unique.length > 0) {
      onChange([...value, ...unique])
    }
    setInputValue('')
  }

  function removeChip(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function clearAll() {
    onChange([])
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChip(inputValue)
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getText()
    // If the pasted content contains newlines, treat as multi-line bulk paste
    if (text.includes('\n')) {
      e.preventDefault()
      const lines = text.split('\n')
      addChips(lines)
    }
    // Otherwise let default paste behaviour populate the input normally
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Header row: count label + clear all */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {value.length} {value.length === 1 ? 'value' : 'values'}
        </span>
        {value.length > 0 && (
          <Button
            type="button"
            variant="secondaryGhost"
            size="xs"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Text input */}
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="h-8 text-sm"
      />

      {/* Chip area */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto py-1">
          {value.map((chip, index) => (
            <Badge
              key={`${chip}-${index}`}
              variant="outline"
              className="inline-flex items-center gap-1 pr-1"
            >
              <span className="truncate max-w-[150px]">{chip}</span>
              <button
                type="button"
                onClick={() => removeChip(index)}
                className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-muted transition-colors"
                aria-label={`Remove ${chip}`}
              >
                <X size={10} weight="bold" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
