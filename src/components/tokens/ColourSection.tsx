import type { TokenConfig, PrimitiveRef } from '../../models/tokenConfig'
import { COLOUR_TOKEN_GROUPS, TOKEN_DESCRIPTIONS } from '../../data/defaultTokenConfig'
import { resolveToHex } from '../../data/tailwindPalette'
import { ColourPicker } from './ColourPicker'

interface ColourSectionProps {
  config: TokenConfig
  onUpdateColour: (tokenName: string, mode: 'light' | 'dark', value: PrimitiveRef) => void
}

export function ColourSection({ config, onUpdateColour }: ColourSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      {COLOUR_TOKEN_GROUPS.map((group) => (
        <div key={group.name} className="flex flex-col gap-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2 border-b border-border mb-1">
            {group.name}
          </div>
          <div className="grid grid-cols-[240px_1fr_1fr] gap-4 py-1 pb-2">
            <span />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Light</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Dark</span>
          </div>
          {group.tokens.map((tokenName) => {
            const tokenValue = config.colours[tokenName]
            if (!tokenValue) return null

            const lightHex = resolveToHex(tokenValue.light)
            const darkHex = resolveToHex(tokenValue.dark)
            const desc = TOKEN_DESCRIPTIONS[tokenName]

            return (
              <div key={tokenName} className="grid grid-cols-[240px_1fr_1fr] items-start py-2.5 border-b border-border gap-4 last:border-b-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-mono text-foreground whitespace-nowrap">--{tokenName}</span>
                  {desc && (
                    <span className="text-[11px] text-muted-foreground leading-tight">{desc.usage}</span>
                  )}
                  {desc?.duplicateOf && (
                    <span className="text-[10px] text-warning leading-tight mt-0.5">⚠ Overlaps: {desc.duplicateOf}</span>
                  )}
                </div>
                <ColourPicker
                  value={tokenValue.light}
                  onSelect={(value) => onUpdateColour(tokenName, 'light', value)}
                >
                  <button type="button" className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md transition-colors duration-150 hover:bg-secondary">
                    <span
                      className="w-4 h-4 rounded-[3px] border border-black/10 shrink-0"
                      style={{ backgroundColor: lightHex ?? 'transparent' }}
                    />
                    <span className="text-[13px] font-medium text-foreground">{tokenValue.light}</span>
                    {lightHex && <span className="text-xs font-mono text-muted-foreground">{lightHex}</span>}
                  </button>
                </ColourPicker>
                <ColourPicker
                  value={tokenValue.dark}
                  onSelect={(value) => onUpdateColour(tokenName, 'dark', value)}
                >
                  <button type="button" className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md transition-colors duration-150 hover:bg-secondary">
                    <span
                      className="w-4 h-4 rounded-[3px] border border-black/10 shrink-0"
                      style={{ backgroundColor: darkHex ?? 'transparent' }}
                    />
                    <span className="text-[13px] font-medium text-foreground">{tokenValue.dark}</span>
                    {darkHex && <span className="text-xs font-mono text-muted-foreground">{darkHex}</span>}
                  </button>
                </ColourPicker>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
