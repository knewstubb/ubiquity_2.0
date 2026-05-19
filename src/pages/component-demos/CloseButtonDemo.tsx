import { CloseButton } from '@/components/ui/close-button'

interface CloseButtonDemoProps {
  size?: 'xs' | 'sm' | 'default' | 'lg'
  disabled?: boolean
  ariaLabel?: string
}

export default function CloseButtonDemo({ size, disabled, ariaLabel }: CloseButtonDemoProps) {
  const hasControls = size !== undefined

  if (hasControls) {
    return (
      <CloseButton
        size={size}
        disabled={disabled}
        aria-label={ariaLabel || undefined}
        onClick={() => {}}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Sizes */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <CloseButton size="xs" onClick={() => {}} />
            <span className="text-[11px] text-muted-foreground">xs (20px)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CloseButton size="sm" onClick={() => {}} />
            <span className="text-[11px] text-muted-foreground">sm (24px)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CloseButton size="default" onClick={() => {}} />
            <span className="text-[11px] text-muted-foreground">default (28px)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CloseButton size="lg" onClick={() => {}} />
            <span className="text-[11px] text-muted-foreground">lg (32px)</span>
          </div>
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">States</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <CloseButton onClick={() => {}} />
            <span className="text-[11px] text-muted-foreground">Default</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CloseButton disabled onClick={() => {}} />
            <span className="text-[11px] text-muted-foreground">Disabled</span>
          </div>
        </div>
      </section>

      {/* In Context */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">In Context</h3>
        <div className="flex flex-col gap-3">
          {/* Modal header example */}
          <div className="relative border border-border rounded-lg p-4 pr-12">
            <span className="text-sm font-semibold text-foreground">Modal Title</span>
            <CloseButton size="sm" className="absolute right-3 top-3" onClick={() => {}} />
          </div>
          {/* Panel header example */}
          <div className="relative border border-border rounded-lg p-4 pr-12">
            <span className="text-sm font-semibold text-foreground">Panel Header</span>
            <CloseButton size="default" className="absolute right-3 top-3" onClick={() => {}} />
          </div>
        </div>
      </section>
    </div>
  )
}
