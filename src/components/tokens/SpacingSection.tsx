import { Input } from '@/components/ui/input'
import type { TokenConfig } from '../../models/tokenConfig'

interface SpacingSectionProps {
  config: TokenConfig
  onUpdateSpacing: (tokenName: string, value: number) => void
}

export function SpacingSection({ config, onUpdateSpacing }: SpacingSectionProps) {
  // Sort tokens by value ascending
  const sortedTokens = Object.entries(config.spacing).sort(
    ([, a], [, b]) => a - b
  )

  // Find the max value for proportional bar widths
  const maxValue = Math.max(...sortedTokens.map(([, v]) => v), 1)

  function handleChange(tokenName: string, rawValue: string) {
    const parsed = Number(rawValue)
    if (Number.isNaN(parsed) || parsed < 0) return
    onUpdateSpacing(tokenName, parsed)
  }

  return (
    <div className="flex flex-col gap-3">
      {sortedTokens.map(([name, value]) => (
        <div key={name} className="grid grid-cols-[48px_80px_1fr] items-center gap-3">
          <span className="text-[13px] font-medium text-foreground font-mono">{name}</span>
          <div className="w-20">
            <Input
              type="number"
              min={0}
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              aria-label={`${name} spacing value`}
              className="h-8 text-[13px] px-2 py-1"
            />
          </div>
          <div className="h-6 flex items-center">
            <div
              className="h-3 rounded bg-primary transition-[width] duration-150 ease-in-out min-w-[2px]"
              style={{ width: `${(value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
