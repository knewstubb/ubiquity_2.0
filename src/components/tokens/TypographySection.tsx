import { Input } from '@/components/ui/input'
import type { TokenConfig } from '../../models/tokenConfig'

interface TypographySectionProps {
  config: TokenConfig
  onUpdateFontSize: (tokenName: string, value: number) => void
}

const FONT_WEIGHTS = [
  { label: 'Light (300)', weight: 300 },
  { label: 'Normal (400)', weight: 400 },
  { label: 'Medium (500)', weight: 500 },
  { label: 'SemiBold (600)', weight: 600 },
  { label: 'Bold (700)', weight: 700 },
] as const

export function TypographySection({ config, onUpdateFontSize }: TypographySectionProps) {
  const fontSizes = config.typography.fontSizes

  function handleSizeChange(tokenName: string, rawValue: string) {
    const parsed = Number(rawValue)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onUpdateFontSize(tokenName, parsed)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Font Families */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground m-0">Font Families</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-medium text-muted-foreground min-w-[140px] shrink-0">Primary (Inter)</span>
            <span className="text-base text-foreground font-[Inter,sans-serif]">
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-medium text-muted-foreground min-w-[140px] shrink-0">Mono (JetBrains Mono)</span>
            <span className="text-base text-foreground font-mono">
              {"const x = await fetch('/api')"}
            </span>
          </div>
        </div>
      </div>

      {/* Font Size Scale */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground m-0">Font Size Scale</h3>
        <div className="flex flex-col gap-3">
          {Object.entries(fontSizes).map(([name, size]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground min-w-[40px] shrink-0">{name}</span>
              <div className="w-[72px] shrink-0">
                <Input
                  type="number"
                  min={0}
                  value={size}
                  onChange={(e) => handleSizeChange(name, e.target.value)}
                  aria-label={`Font size ${name}`}
                />
              </div>
              <span
                className="text-foreground whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontSize: `${size}px` }}
              >
                Sample text
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Font Weights */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground m-0">Font Weights</h3>
        <div className="flex flex-col gap-3">
          {FONT_WEIGHTS.map(({ label, weight }) => (
            <div key={weight} className="flex items-baseline gap-4">
              <span className="text-xs font-medium text-muted-foreground min-w-[140px] shrink-0">{label}</span>
              <span
                className="text-base text-foreground"
                style={{ fontWeight: weight }}
              >
                The quick brown fox
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
