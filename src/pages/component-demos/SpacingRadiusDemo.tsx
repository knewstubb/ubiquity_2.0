export default function SpacingRadiusDemo() {
  return (
    <div className="flex flex-col gap-10">
      {/* Spacing Scale */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-2">Spacing Scale</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Base unit: 4px. Tailwind utilities use multiples (p-1 = 4px, p-2 = 8px, etc.)
        </p>
        <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-3">
          {[
            { label: 'p-0.5', px: 2, name: 'xxs', desc: 'micro gaps' },
            { label: 'p-1', px: 4, name: 'xs', desc: 'tight spacing' },
            { label: 'p-2', px: 8, name: 'sm', desc: 'compact padding' },
            { label: 'p-3', px: 12, name: 'ms', desc: 'medium-small' },
            { label: 'p-4', px: 16, name: 'md', desc: 'default padding' },
            { label: 'p-6', px: 24, name: 'lg', desc: 'section spacing' },
            { label: 'p-8', px: 32, name: 'xl', desc: 'large gaps' },
            { label: 'p-10', px: 40, name: 'xxl', desc: 'page margins' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <code className="text-sm text-foreground w-14 font-mono font-semibold">{item.label}</code>
              <span className="text-xs text-muted-foreground w-10 text-right">{item.px}px</span>
              <div className="flex-1 flex items-center">
                <div
                  className="bg-primary rounded-sm h-6"
                  style={{ width: `${Math.max(item.px * 2.5, 8)}px` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.name} — {item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-2">Border Radius</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Derived from <code className="font-mono bg-secondary px-1 py-0.5 rounded">--radius: 8px</code>. The <strong>lg</strong> value is the base.
        </p>
        <div className="grid grid-cols-4 gap-5">
          {[
            { label: 'rounded-sm', desc: '4.8px', cls: 'rounded-sm' },
            { label: 'rounded-md', desc: '6.4px', cls: 'rounded-md' },
            { label: 'rounded-lg', desc: '8px (base)', cls: 'rounded-lg' },
            { label: 'rounded-xl', desc: '11.2px', cls: 'rounded-xl' },
            { label: 'rounded-2xl', desc: '14.4px', cls: 'rounded-2xl' },
            { label: 'rounded-3xl', desc: '17.6px', cls: 'rounded-3xl' },
            { label: 'rounded-full', desc: '9999px', cls: 'rounded-full' },
            { label: 'rounded-none', desc: '0px', cls: 'rounded-none' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 bg-primary ${item.cls}`} />
              <code className="text-xs font-mono text-foreground font-semibold">{item.label}</code>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
