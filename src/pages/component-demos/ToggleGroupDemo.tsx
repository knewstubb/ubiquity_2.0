import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify, SquaresFour, ListBullets } from '@phosphor-icons/react'

export default function ToggleGroupDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">Text alignment (single)</p>
        <ToggleGroup type="single" defaultValue="left">
          <ToggleGroupItem value="left" aria-label="Align left">
            <TextAlignLeft className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <TextAlignCenter className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <TextAlignRight className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify">
            <TextAlignJustify className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">View mode (single, outline)</p>
        <ToggleGroup type="single" variant="outline" defaultValue="grid">
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <SquaresFour className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <ListBullets className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
