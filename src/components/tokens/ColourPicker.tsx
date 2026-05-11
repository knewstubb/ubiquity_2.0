import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { PALETTE_NAMES, SHADE_STEPS, tailwindPalette, resolveToHex } from '../../data/tailwindPalette'
import type { PrimitiveRef } from '../../models/tokenConfig'
import { cn } from '../../lib/utils'

interface ColourPickerProps {
  value: PrimitiveRef
  onSelect: (value: PrimitiveRef) => void
  children: React.ReactNode
}

export function ColourPicker({ value, onSelect, children }: ColourPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedHex = resolveToHex(value) ?? '#000000'

  function handleSelect(palette: string, shade: string) {
    const ref = `${palette}-${shade}` as PrimitiveRef
    onSelect(ref)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
        <div className="flex flex-col gap-3 p-4 max-h-[400px] overflow-y-auto">
          <div className="text-[13px] font-semibold text-foreground">Select Colour</div>
          <div className="flex flex-col gap-1">
            {PALETTE_NAMES.map((palette) => (
              <div key={palette} className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-muted-foreground w-14 shrink-0 text-right">{palette}</span>
                <div className="flex gap-0.5">
                  {SHADE_STEPS.map((shade) => {
                    const hex = tailwindPalette[palette]?.[shade] ?? '#000000'
                    const ref = `${palette}-${shade}`
                    const isSelected = ref === value

                    return (
                      <button
                        key={shade}
                        type="button"
                        className={cn(
                          "w-[18px] h-[18px] rounded-[3px] border border-black/[0.08] cursor-pointer transition-transform duration-100 ease-in-out p-0 hover:scale-[1.2] hover:z-[1]",
                          isSelected && "outline-2 outline-primary outline-offset-1"
                        )}
                        style={{ backgroundColor: hex }}
                        onClick={() => handleSelect(palette, shade)}
                        title={`${ref} (${hex})`}
                        aria-label={`Select ${palette} ${shade}`}
                        aria-pressed={isSelected}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Selected:</span>
            <span className="text-xs font-medium text-foreground">{value}</span>
            <span className="text-xs font-mono text-muted-foreground">{selectedHex}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
