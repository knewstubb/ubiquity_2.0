export default function ShadowsDemo() {
  return (
    <div className="flex flex-col gap-10">
      {/* Elevation Scale */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-2">Elevation Scale</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Higher elevation = more visual prominence. Each level adds depth.
        </p>
        <div className="grid grid-cols-3 gap-6 p-8 bg-secondary rounded-xl">
          {[
            { label: 'shadow-sm', desc: 'Cards, inputs' },
            { label: 'shadow-md', desc: 'Dropdowns' },
            { label: 'shadow-lg', desc: 'Modals, dialogs' },
            { label: 'shadow-xl', desc: 'Floating panels' },
            { label: 'shadow-2xl', desc: 'Maximum elevation' },
            { label: 'shadow-none', desc: 'Flat (no shadow)' },
          ].map((item) => (
            <div
              key={item.label}
              className={`${item.label} bg-card rounded-lg p-6 flex flex-col gap-2 min-h-[100px] justify-center`}
            >
              <code className="text-sm font-mono font-semibold text-foreground">{item.label}</code>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Focus Ring */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-2">Focus Ring</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Keyboard focus indicators using <code className="font-mono bg-secondary px-1 py-0.5 rounded">--ring</code> (teal #14B88A).
        </p>
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-14 rounded-lg bg-card border border-border ring-2 ring-ring flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-mono">ring-2</span>
            </div>
            <span className="text-xs text-muted-foreground">Standard focus</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-14 rounded-lg bg-card border border-border ring-4 ring-ring/30 flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-mono">ring-4/30</span>
            </div>
            <span className="text-xs text-muted-foreground">Soft glow</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-14 rounded-lg bg-card border border-border ring-2 ring-ring ring-offset-2 ring-offset-background flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-mono">ring-offset-2</span>
            </div>
            <span className="text-xs text-muted-foreground">With offset</span>
          </div>
        </div>
      </section>
    </div>
  )
}
