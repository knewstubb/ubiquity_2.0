import { cn } from '@/lib/utils'

const COMPONENT_HEIGHTS = [
  { tw: 'h-6', px: 24, usage: 'Tiny buttons (icon-only in controller panels)' },
  { tw: 'h-7', px: 28, usage: 'Small buttons (Done, ghost actions in popovers)' },
  { tw: 'h-8', px: 32, usage: 'Controller panel inputs, compact selects' },
  { tw: 'h-9', px: 36, usage: 'Default form/modal inputs and selects' },
  { tw: 'h-10', px: 40, usage: 'Large inputs, primary action buttons' },
  { tw: 'h-12', px: 48, usage: 'Hero buttons, large CTAs' },
]

const CONTAINER_WIDTHS = [
  { tw: 'w-56', px: 224, usage: 'Controller panel (narrow, no text inputs)' },
  { tw: 'w-64', px: 256, usage: 'Controller panel (with text inputs)' },
  { tw: 'max-w-[400px]', px: 400, usage: 'Popovers (wide)' },
  { tw: 'max-w-[480px]', px: 480, usage: 'ChooserModal, small dialogs' },
  { tw: 'max-w-[560px]', px: 560, usage: 'Create Connection modal, form dialogs' },
  { tw: '60vw / max-w-[1080px]', px: 1080, usage: 'Wizard modals (import automation)' },
  { tw: 'inset-4 (calc(100vw-32px))', px: 0, usage: 'Takeover modal — email editor, full-screen editors' },
  { tw: 'max-w-[1440px]', px: 1440, usage: 'Page content container' },
]

const BORDER_COLOURS = [
  { tw: 'border-border', colour: 'var(--border)', usage: 'Default borders, dividers, table lines' },
  { tw: 'border-input', colour: 'var(--input)', usage: 'Input field borders (slightly darker than border)' },
  { tw: 'border-primary', colour: 'var(--primary)', usage: 'Selected state, active focus ring' },
  { tw: 'border-destructive', colour: 'var(--destructive)', usage: 'Error state inputs, destructive actions' },
]

export function SizingSection() {
  return (
    <div className="flex flex-col gap-10">
      {/* Component Heights */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Component Heights</h2>
        <div className="flex flex-col gap-0">
          <div className="grid grid-cols-[100px_48px_80px_1fr] items-center gap-3 pb-2 border-b border-border mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Class</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">px</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Usage</span>
          </div>
          {COMPONENT_HEIGHTS.map((item) => (
            <div key={item.tw} className="grid grid-cols-[100px_48px_80px_1fr] items-center gap-3 py-2 border-b border-border/50">
              <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">{item.tw}</code>
              <span className="text-sm tabular-nums text-muted-foreground">{item.px}</span>
              <div
                className="w-full rounded border border-primary bg-primary/20"
                style={{ height: `${item.px}px` }}
              />
              <span className="text-xs text-muted-foreground">{item.usage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Container Widths */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Container Widths</h2>
        <div className="flex flex-col gap-0">
          <div className="grid grid-cols-[180px_64px_1fr] items-center gap-3 pb-2 border-b border-border mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Class</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">px</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Usage</span>
          </div>
          {CONTAINER_WIDTHS.map((item) => (
            <div key={item.tw} className="flex flex-col gap-1.5 py-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">{item.tw}</code>
                <span className="text-sm tabular-nums text-muted-foreground">{item.px === 0 ? '100% - 32px' : `${item.px}px`}</span>
                <span className="text-xs text-muted-foreground">— {item.usage}</span>
              </div>
              <div
                className="h-3 rounded bg-primary/20 border border-primary/40"
                style={{ width: item.px === 0 ? 'calc(100% - 32px)' : `min(${item.px}px, 100%)` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Border Colours */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Semantic Borders</h2>
        <div className="flex flex-col gap-0">
          <div className="grid grid-cols-[160px_48px_1fr] items-center gap-3 pb-2 border-b border-border mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Class</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Usage</span>
          </div>
          {BORDER_COLOURS.map((item) => (
            <div key={item.tw} className="grid grid-cols-[160px_48px_1fr] items-center gap-3 py-2 border-b border-border/50">
              <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">{item.tw}</code>
              <div
                className={cn('w-10 h-10 rounded border-2', item.tw.replace('border-', 'border-'))}
                style={{ borderColor: item.colour }}
              />
              <span className="text-xs text-muted-foreground">{item.usage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
