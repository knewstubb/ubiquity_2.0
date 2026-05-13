import type { TokenConfig } from '../../models/tokenConfig'

interface SpacingSectionProps {
  config: TokenConfig
  onUpdateSpacing: (tokenName: string, value: number) => void
}

// The spacing scale used in the project — mapped to Tailwind classes and usage
const SPACING_SCALE = [
  { tw: 'gap-0.5', px: 2, usage: '—' },
  { tw: 'gap-1', px: 4, usage: 'Label → input (controller panels)' },
  { tw: 'gap-1.5', px: 6, usage: 'Label → input (forms), section header → first control' },
  { tw: 'gap-2 / space-y-2', px: 8, usage: 'Between fields within a section' },
  { tw: 'gap-3 / space-y-3', px: 12, usage: 'Between fields in forms (inter-field), popover content gap' },
  { tw: 'gap-4 / space-y-4', px: 16, usage: 'Between sections, panel padding (p-4)' },
  { tw: 'gap-5 / space-y-5', px: 20, usage: 'Section break with border (pt-5 border-b)' },
  { tw: 'gap-6 / space-y-6', px: 24, usage: 'Large section separators, modal section breaks' },
  { tw: 'gap-7', px: 28, usage: 'Page header → content (mb-7)' },
  { tw: 'gap-8 / space-y-8', px: 32, usage: 'Page-level spacing, showcase section gaps' },
  { tw: 'gap-10 / space-y-10', px: 40, usage: 'Major page sections, empty state padding' },
]

export function SpacingSection({ config, onUpdateSpacing }: SpacingSectionProps) {
  // Keep the props interface for compatibility but render our fixed scale
  void config
  void onUpdateSpacing

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="grid grid-cols-[140px_48px_80px_1fr] items-center gap-3 pb-2 border-b border-border mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tailwind Class</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">px</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Usage</span>
      </div>

      {SPACING_SCALE.map((item) => (
        <div key={item.tw} className="grid grid-cols-[140px_48px_80px_1fr] items-center gap-3 h-12 border-b border-border/50">
          <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">{item.tw}</code>
          <span className="text-sm tabular-nums text-muted-foreground">{item.px}</span>
          {/* Visual preview — actual height of the spacing between two lines */}
          <div className="flex flex-col items-start">
            <div className="w-12 h-px bg-foreground/30" />
            <div
              className="w-12 border-l-2 border-primary bg-primary/10"
              style={{ height: `${item.px}px` }}
            />
            <div className="w-12 h-px bg-foreground/30" />
          </div>
          <span className="text-xs text-muted-foreground">{item.usage}</span>
        </div>
      ))}
    </div>
  )
}
