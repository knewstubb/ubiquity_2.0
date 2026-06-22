/**
 * @component FilterChipInput
 * @description Bulk value chip input for "Is in" / "Is not in" operators in the
 * filter builder condition modal. Supports adding chips via Enter key, multi-line
 * paste (one value per line), an expandable textarea dropdown for bulk entry,
 * individual chip removal, and clear-all.
 *
 * @designDecisions
 * - Separate from the generic ChipInput (src/components/composed/chip-input.tsx)
 *   because this variant is purpose-built for bulk filter value entry with:
 *   multi-line paste splitting, count label, and no validation/dropdown features.
 * - Input uses a custom wrapper with an inline count suffix (border-l separator,
 *   muted background) rather than a header row — keeps the count always visible
 *   at the input level without taking vertical space.
 * - Focusing the input expands a dropdown textarea panel below for multi-line
 *   bulk entry. This avoids requiring users to know about paste-splitting —
 *   they can type or paste multiple values line-by-line with explicit confirm.
 * - Textarea dropdown rendered via createPortal to document.body so it escapes
 *   the Dialog's overflow/z-index stack entirely. Fixed positioning with
 *   coordinates calculated from the input wrapper's bounding rect. z-index 9999
 *   ensures it sits above all modal layers.
 * - ⌘+Enter shortcut on textarea mirrors common "submit" affordance in macOS
 *   multi-line inputs. "Add values" button serves as the explicit alternative.
 * - Raw <input> instead of the Input component to allow seamless integration
 *   within the composite border wrapper (shared border, focus-within ring).
 * - Uses Badge (variant="outline") for chips to match the filter builder's visual
 *   language — lightweight and removable.
 * - Chips and "Clear all" grouped below the input in a single column —
 *   clear-all is self-start aligned to avoid competing with confirm.
 * - Chip area has max-height (120px) with overflow-y-auto so large lists don't
 *   blow out the modal height.
 *
 * @usage
 * - Used inside ConditionModal's ValueInput when operator is "is_in" or "is_not_in"
 * - Purely controlled via value/onChange props
 * - onExpandedChange callback notifies parent when the bulk-entry textarea
 *   dropdown opens/closes — useful for adjusting modal overflow or z-index
 *
 * @validates Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7
 */

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FilterChipInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  onExpandedChange?: (expanded: boolean) => void
}

export function FilterChipInput({
  value,
  onChange,
  placeholder = 'Type a value and press Enter…',
  className,
  onExpandedChange,
}: FilterChipInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [isExpanded, setIsExpandedRaw] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  function setIsExpanded(val: boolean) {
    setIsExpandedRaw(val)
    onExpandedChange?.(val)
    if (val && inputWrapperRef.current) {
      const rect = inputWrapperRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
  }
  const inputRef = useRef<HTMLInputElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    setTextareaValue('')
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
    if (text.includes('\n')) {
      e.preventDefault()
      const lines = text.split('\n')
      addChips(lines)
    }
  }

  function handleTextareaConfirm() {
    if (textareaValue.trim()) {
      const lines = textareaValue.split('\n')
      addChips(lines)
    }
    setIsExpanded(false)
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl+Enter to confirm
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleTextareaConfirm()
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Input with values count as suffix */}
      <div ref={inputWrapperRef} className="relative">
        <div className="flex rounded-md border border-input overflow-hidden focus-within:border-ring focus-within:shadow-ring h-8">
          <input
            ref={inputRef}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 px-3 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
          />
          <span className="inline-flex items-center border-l border-input bg-muted px-3 text-xs text-muted-foreground select-none shrink-0">
            {value.length} {value.length === 1 ? 'value' : 'values'}
          </span>
        </div>

        {/* Dropdown textarea for bulk paste — rendered via portal to sit above all content */}
        {isExpanded && createPortal(
          <div
            className="fixed rounded-md border border-border bg-popover shadow-lg p-3 flex flex-col gap-2"
            style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999, animation: "slideUp 150ms ease-out both" }}
          >
            <p className="text-xs text-muted-foreground m-0">Paste or type values — one per line</p>
            <textarea
              ref={textareaRef}
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={"value 1\nvalue 2\nvalue 3"}
              className="w-full h-24 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:shadow-ring placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">⌘+Enter to add</span>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondaryGhost" size="xs" onClick={() => { setIsExpanded(false); setTextareaValue('') }}>
                  Close
                </Button>
                <Button type="button" variant="default" size="xs" onClick={handleTextareaConfirm} disabled={!textareaValue.trim()}>
                  Add values
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Chip area + clear all */}
      {value.length > 0 && (
        <div className="flex flex-col gap-1.5">
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
          <Button
            type="button"
            variant="secondaryGhost"
            size="xs"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground self-start"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
