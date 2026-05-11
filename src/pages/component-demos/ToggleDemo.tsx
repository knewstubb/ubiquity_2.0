import { Toggle } from '@/components/ui/toggle'
import { TextB, TextItalic, TextUnderline } from '@phosphor-icons/react'

export default function ToggleDemo() {
  return (
    <div className="flex flex-col gap-6">
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

      <div className="flex flex-wrap gap-3">
        <Toggle disabled aria-label="Toggle disabled">
          <TextB className="h-4 w-4" weight="bold" />
        </Toggle>
        <Toggle pressed aria-label="Toggle pressed">
          <TextB className="h-4 w-4" weight="bold" />
        </Toggle>
      </div>
    </div>
  )
}
