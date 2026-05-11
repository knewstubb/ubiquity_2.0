export default function TypographyDemo() {
  return (
    <div className="flex flex-col gap-10">
      {/* Font Family */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Font Families</h3>
        <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-4">
          <div className="flex items-baseline gap-4">
            <span className="text-sm text-muted-foreground w-20 shrink-0">Sans</span>
            <span className="font-sans text-xl text-foreground">Inter — The quick brown fox jumps over the lazy dog</span>
          </div>
          <div className="border-t border-border pt-4 flex items-baseline gap-4">
            <span className="text-sm text-muted-foreground w-20 shrink-0">Mono</span>
            <span className="font-mono text-xl text-foreground">JetBrains Mono — const x = 42;</span>
          </div>
        </div>
      </section>

      {/* Font Sizes */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Font Sizes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Overridden so <code className="font-mono bg-secondary px-1 py-0.5 rounded">text-base</code> = 14px (UDS standard, not Tailwind's default 16px).
        </p>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {[
            { label: 'text-xs', size: '10px', example: 'Micro labels, timestamps' },
            { label: 'text-sm', size: '12px', example: 'Body XS, captions, badges' },
            { label: 'text-base', size: '14px', example: 'Body default — most UI text' },
            { label: 'text-lg', size: '16px', example: 'Body large, section titles' },
            { label: 'text-xl', size: '18px', example: 'Heading H5' },
            { label: 'text-2xl', size: '24px', example: 'Heading H2, page titles' },
            { label: 'text-3xl', size: '30px', example: 'Heading H1' },
            { label: 'text-4xl', size: '36px', example: 'Display M' },
            { label: 'text-5xl', size: '48px', example: 'Display L' },
          ].map((item, i) => (
            <div key={item.label} className={`flex items-baseline gap-4 px-6 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
              <code className="text-xs font-mono text-primary font-semibold w-20 shrink-0">{item.label}</code>
              <span className="text-xs text-muted-foreground w-10 shrink-0">{item.size}</span>
              <span style={{ fontSize: item.size }} className="text-foreground font-medium">{item.example}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Font Weights */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Font Weights</h3>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {[
            { label: 'font-light', weight: 300, name: 'Light' },
            { label: 'font-normal', weight: 400, name: 'Normal (Regular)' },
            { label: 'font-medium', weight: 500, name: 'Medium' },
            { label: 'font-semibold', weight: 600, name: 'SemiBold' },
            { label: 'font-bold', weight: 700, name: 'Bold' },
          ].map((item, i) => (
            <div key={item.label} className={`flex items-center gap-4 px-6 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
              <code className="text-xs font-mono text-primary font-semibold w-28 shrink-0">{item.label}</code>
              <span className="text-xs text-muted-foreground w-8 shrink-0">{item.weight}</span>
              <span style={{ fontWeight: item.weight }} className="text-lg text-foreground">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Text Hierarchy */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Text Hierarchy</h3>
        <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-lg">Primary — high emphasis, headings, labels</span>
            <code className="text-xs font-mono text-muted-foreground">text-foreground</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-lg">Secondary — descriptions, supporting text</span>
            <code className="text-xs font-mono text-muted-foreground">text-muted-foreground</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tertiary-foreground text-lg">Tertiary — placeholders, timestamps, hints</span>
            <code className="text-xs font-mono text-muted-foreground">text-tertiary-foreground</code>
          </div>
        </div>
      </section>
    </div>
  )
}
