export default function ColoursDemo() {
  return (
    <div className="flex flex-col gap-10">
      {/* Core Semantic Colours */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Core Surfaces</h3>
        <div className="grid grid-cols-2 gap-3">
          <Swatch bg="bg-background" fg="text-foreground" label="background" value="#FAFAFA" />
          <Swatch bg="bg-card" fg="text-card-foreground" label="card" value="#FFFFFF" />
          <Swatch bg="bg-popover" fg="text-popover-foreground" label="popover" value="#FFFFFF" />
          <Swatch bg="bg-secondary" fg="text-secondary-foreground" label="secondary" value="#F4F4F5" />
          <Swatch bg="bg-muted" fg="text-muted-foreground" label="muted" value="#F4F4F5" />
          <Swatch bg="bg-accent" fg="text-accent-foreground" label="accent" value="#E6F9F5" />
        </div>
      </section>

      {/* Primary */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Primary (Brand)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary rounded-lg p-6 flex flex-col gap-1">
            <span className="text-primary-foreground text-sm font-semibold">primary</span>
            <span className="text-primary-foreground/70 text-xs font-mono">#14B88A</span>
          </div>
          <div className="bg-primary/80 rounded-lg p-6 flex flex-col gap-1">
            <span className="text-primary-foreground text-sm font-semibold">primary/80</span>
            <span className="text-primary-foreground/70 text-xs font-mono">hover state</span>
          </div>
          <div className="bg-primary/20 rounded-lg p-6 flex flex-col gap-1 border border-primary/30">
            <span className="text-primary text-sm font-semibold">primary/20</span>
            <span className="text-primary/70 text-xs font-mono">subtle tint</span>
          </div>
        </div>
      </section>

      {/* Text Hierarchy */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Text Hierarchy</h3>
        <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="text-foreground text-base font-medium w-48">Primary text</span>
            <code className="text-xs font-mono text-muted-foreground">text-foreground</code>
            <span className="text-xs text-muted-foreground ml-auto">#27272A</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-base font-medium w-48">Secondary text</span>
            <code className="text-xs font-mono text-muted-foreground">text-muted-foreground</code>
            <span className="text-xs text-muted-foreground ml-auto">#71717A</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-tertiary-foreground text-base font-medium w-48">Tertiary text</span>
            <code className="text-xs font-mono text-muted-foreground">text-tertiary-foreground</code>
            <span className="text-xs text-muted-foreground ml-auto">#A1A1AA</span>
          </div>
        </div>
      </section>

      {/* Status Colours */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Status Colours</h3>
        <div className="flex flex-col gap-3">
          <StatusRow name="Destructive" color="destructive" hex="#EF4444" />
          <StatusRow name="Warning" color="warning" hex="#F59E0B" />
          <StatusRow name="Success" color="success" hex="#14B88A" />
          <StatusRow name="Info" color="info" hex="#0EA5E9" />
        </div>
      </section>

      {/* Border & Ring */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Border & Ring</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-16 rounded-lg border-2 border-border bg-card" />
            <code className="text-xs font-mono text-muted-foreground">border-border</code>
            <span className="text-xs text-tertiary-foreground">#E4E4E7</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-16 rounded-lg border-2 border-input bg-card" />
            <code className="text-xs font-mono text-muted-foreground">border-input</code>
            <span className="text-xs text-tertiary-foreground">#E4E4E7</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-16 rounded-lg ring-2 ring-ring bg-card" />
            <code className="text-xs font-mono text-muted-foreground">ring-ring</code>
            <span className="text-xs text-tertiary-foreground">#14B88A</span>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Chart Palette</h3>
        <div className="flex gap-3">
          <ChartSwatch n={1} hex="#14B88A" />
          <ChartSwatch n={2} hex="#3B82F6" />
          <ChartSwatch n={3} hex="#F59E0B" />
          <ChartSwatch n={4} hex="#A855F7" />
          <ChartSwatch n={5} hex="#0EA5E9" />
        </div>
      </section>
    </div>
  )
}

function Swatch({ bg, fg, label, value }: { bg: string; fg: string; label: string; value: string }) {
  return (
    <div className={`${bg} ${fg} p-5 rounded-lg border border-border min-h-[72px] flex flex-col justify-between`}>
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center justify-between">
        <code className="text-xs opacity-60 font-mono">--{label}</code>
        <span className="text-xs opacity-60 font-mono">{value}</span>
      </div>
    </div>
  )
}

function StatusRow({ name, color, hex }: { name: string; color: string; hex: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
      <span className="text-sm font-semibold text-foreground w-28">{name}</span>
      <div className={`bg-${color} text-white px-3 py-1.5 rounded-md text-xs font-semibold min-w-[72px] text-center`}>
        Default
      </div>
      <div className={`bg-${color}-subtle text-${color}-foreground px-3 py-1.5 rounded-md text-xs font-semibold border border-${color}-border min-w-[72px] text-center`}>
        Subtle
      </div>
      <div className={`border-2 border-${color}-border text-foreground px-3 py-1.5 rounded-md text-xs font-semibold min-w-[72px] text-center`}>
        Border
      </div>
      <span className="text-xs font-mono text-muted-foreground ml-auto">{hex}</span>
    </div>
  )
}

function ChartSwatch({ n, hex }: { n: number; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-14 h-14 rounded-lg bg-chart-${n}`} />
      <code className="text-xs font-mono text-muted-foreground">chart-{n}</code>
      <span className="text-xs text-tertiary-foreground">{hex}</span>
    </div>
  )
}
