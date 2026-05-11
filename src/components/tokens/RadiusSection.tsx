import { Input } from '@/components/ui/input'
import type { TokenConfig } from '../../models/tokenConfig'

interface RadiusSectionProps {
  config: TokenConfig
  onUpdateRadius: (base: number) => void
}

interface DerivedRadius {
  name: string
  value: number
}

function deriveRadiusValues(base: number): DerivedRadius[] {
  return [
    { name: 'none', value: 0 },
    { name: 'sm', value: base * 0.6 },
    { name: 'md', value: base * 0.8 },
    { name: 'lg', value: base },
    { name: 'xl', value: base * 1.4 },
    { name: 'full', value: 9999 },
  ]
}

export function RadiusSection({ config, onUpdateRadius }: RadiusSectionProps) {
  const base = config.radius.base
  const derived = deriveRadiusValues(base)

  function handleBaseChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 1) {
      onUpdateRadius(value)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground">Base Radius:</span>
        <Input
          type="number"
          min={1}
          value={base}
          onChange={handleBaseChange}
          className="w-[72px]"
          aria-label="Base radius value"
        />
        <span className="text-sm text-muted-foreground">px</span>
        <span className="text-xs text-tertiary-foreground">(other values derived from base)</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {derived.map((token) => (
          <div key={token.name} className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-foreground min-w-[40px]">{token.name}</span>
            <span className="text-[13px] text-muted-foreground min-w-[64px]">
              {token.value === 9999 ? '9999px' : `${parseFloat(token.value.toFixed(1))}px`}
            </span>
            <div
              className="w-12 h-12 border-2 border-border bg-background shrink-0"
              style={{ borderRadius: `${token.value}px` }}
              aria-label={`${token.name} radius preview`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
