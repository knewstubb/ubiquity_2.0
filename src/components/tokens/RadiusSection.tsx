import type { TokenConfig } from '../../models/tokenConfig'
import { cn } from '@/lib/utils'

interface RadiusSectionProps {
  config: TokenConfig
  onUpdateRadius: (base: number) => void
}

const RADIUS_SCALE = [
  { tw: 'rounded-none', px: 0, className: 'rounded-none', usage: '—' },
  { tw: 'rounded-sm', px: 2, className: 'rounded-sm', usage: 'Colour swatches, tiny elements' },
  { tw: 'rounded', px: 4, className: 'rounded', usage: 'UDS default — buttons, inputs, badges' },
  { tw: 'rounded-md', px: 6, className: 'rounded-md', usage: 'Popovers, cards, dropdowns' },
  { tw: 'rounded-lg', px: 8, className: 'rounded-lg', usage: 'Modals, large containers, panels' },
  { tw: 'rounded-xl', px: 12, className: 'rounded-xl', usage: 'Card selectors, feature cards' },
  { tw: 'rounded-2xl', px: 16, className: 'rounded-2xl', usage: 'Hero cards, large promotional elements' },
  { tw: 'rounded-full', px: 9999, className: 'rounded-full', usage: 'Pills, avatars, chips, status badges' },
]

export function RadiusSection({ config, onUpdateRadius }: RadiusSectionProps) {
  void config
  void onUpdateRadius

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="grid grid-cols-[140px_48px_64px_1fr] items-center gap-3 pb-2 border-b border-border mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tailwind Class</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">px</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Usage</span>
      </div>

      {RADIUS_SCALE.map((item) => (
        <div key={item.tw} className="grid grid-cols-[140px_48px_64px_1fr] items-center gap-3 py-2 border-b border-border/50">
          <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">{item.tw}</code>
          <span className="text-sm tabular-nums text-muted-foreground">
            {item.px === 9999 ? '∞' : item.px}
          </span>
          <div
            className={cn(
              'w-12 h-12 border-2 border-primary bg-primary/20',
              item.className
            )}
          />
          <span className="text-xs text-muted-foreground">{item.usage}</span>
        </div>
      ))}
    </div>
  )
}
