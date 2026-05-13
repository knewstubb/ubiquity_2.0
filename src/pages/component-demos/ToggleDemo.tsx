import { Toggle } from '@/components/ui/toggle'
import { TextB, TextItalic, TextUnderline } from '@phosphor-icons/react'

interface ToggleDemoProps {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  pressed?: boolean
  disabled?: boolean
}

export default function ToggleDemo({ variant, size, pressed, disabled }: ToggleDemoProps) {
  const hasControls = variant !== undefined

  if (hasControls) {
    return (
      <Toggle
        variant={variant}
        size={size}
        pressed={pressed}
        disabled={disabled}
        aria-label="Toggle bold"
      >
        <TextB className="h-4 w-4" weight="bold" />
      </Toggle>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Default</h3>
        <div className="flex flex-wrap gap-3">
          <Toggle aria-label="Toggle bold">
            <TextB className="h-4 w-4" weight="bold" />
          </Toggle>
          <Toggle aria-label="Toggle italic">
            <TextItalic className="h-4 w-4" weight="bold" />
          </Toggle>
          <Toggle aria-label="Toggle underline">
            <TextUnderline className="h-4 w-4" weight="bold" />
          </Toggle>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Outline</h3>
        <div className="flex flex-wrap gap-3">
          <Toggle variant="outline" aria-label="Toggle bold">
            <TextB className="h-4 w-4" weight="bold" />
          </Toggle>
          <Toggle variant="outline" aria-label="Toggle italic">
            <TextItalic className="h-4 w-4" weight="bold" />
          </Toggle>
          <Toggle variant="outline" aria-label="Toggle underline">
            <TextUnderline className="h-4 w-4" weight="bold" />
          </Toggle>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">States</h3>
        <div className="flex flex-wrap gap-3">
          <Toggle disabled aria-label="Toggle disabled">
            <TextB className="h-4 w-4" weight="bold" />
          </Toggle>
          <Toggle pressed aria-label="Toggle pressed">
            <TextB className="h-4 w-4" weight="bold" />
          </Toggle>
        </div>
      </section>
    </div>
  )
}
