import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  SquaresFour,
  ListBullets,
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
} from '@phosphor-icons/react'

const ICONS = [TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify, TextB, TextItalic]
const ICON_LABELS = ['Left', 'Center', 'Right', 'Justify', 'Bold', 'Italic']

interface ToggleGroupDemoProps {
  type?: 'single' | 'multiple'
  variant?: 'default' | 'outline'
  'item-count'?: number
}

export default function ToggleGroupDemo({ type, variant, 'item-count': itemCount }: ToggleGroupDemoProps) {
  const hasControls = type !== undefined

  if (hasControls) {
    const count = itemCount ?? 4
    const items = Array.from({ length: count }, (_, i) => {
      const Icon = ICONS[i % ICONS.length]
      return (
        <ToggleGroupItem key={i} value={`item-${i}`} aria-label={ICON_LABELS[i % ICON_LABELS.length]}>
          <Icon className="h-4 w-4" weight="bold" />
        </ToggleGroupItem>
      )
    })

    if (type === 'multiple') {
      return (
        <ToggleGroup type="multiple" variant={variant} defaultValue={['item-0']}>
          {items}
        </ToggleGroup>
      )
    }

    return (
      <ToggleGroup type="single" variant={variant} defaultValue="item-0">
        {items}
      </ToggleGroup>
    )
  }

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

      <div className="space-y-2">
        <p className="text-sm font-medium">Formatting (multiple)</p>
        <ToggleGroup type="multiple" defaultValue={['bold']}>
          <ToggleGroupItem value="bold" aria-label="Bold">
            <TextB className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <TextItalic className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <TextUnderline className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
          <ToggleGroupItem value="strikethrough" aria-label="Strikethrough">
            <TextStrikethrough className="h-4 w-4" weight="bold" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
