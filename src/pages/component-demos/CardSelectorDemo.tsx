import { useState } from 'react'
import { CardSelector } from '@/components/composed/card-selector'
import {
  DownloadSimple,
  UploadSimple,
  CloudArrowUp,
  Folder,
  Database,
  Globe,
  Lightning,
  Gear,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const ICON_MAP: Record<string, Icon> = {
  DownloadSimple,
  UploadSimple,
  CloudArrowUp,
  Folder,
  Database,
  Globe,
  Lightning,
  Gear,
}

const DEFAULT_LABELS = ['Importer', 'Exporter', 'Sync', 'Custom', 'Advanced', 'Archive']
const DEFAULT_DESCRIPTIONS = [
  'Bring data into UbiQuity',
  'Send data to external systems',
  'Two-way data synchronisation',
  'Custom automation logic',
  'Advanced configuration options',
  'Archive and retention rules',
]
const DEFAULT_ICONS = ['DownloadSimple', 'UploadSimple', 'CloudArrowUp', 'Folder', 'Database', 'Globe']

interface CardSelectorDemoProps {
  'card-count'?: number
  rows?: number
  'max-width'?: number
  'show-description'?: boolean
  disabled?: boolean
  [key: string]: unknown
}

export default function CardSelectorDemo(props: CardSelectorDemoProps) {
  const [selected, setSelected] = useState(0)

  const cardCount = props['card-count']
  const hasControls = cardCount !== undefined

  if (hasControls) {
    const count = cardCount
    const rows = (props.rows as number) ?? 1
    const maxWidth = (props['max-width'] as number) ?? 100
    const showDescription = (props['show-description'] as boolean) ?? false
    const disabled = (props.disabled as boolean) ?? false
    const columns = Math.ceil(count / rows)

    return (
      <div className="w-full" style={{ maxWidth: `${maxWidth}%` }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: count }).map((_, i) => {
            const label = (props[`card-${i}-label`] as string) ?? DEFAULT_LABELS[i] ?? `Card ${i + 1}`
            const iconName = (props[`card-${i}-icon`] as string) ?? DEFAULT_ICONS[i] ?? 'DownloadSimple'
            const IconComp = ICON_MAP[iconName] ?? DownloadSimple
            const description = showDescription ? (DEFAULT_DESCRIPTIONS[i] ?? undefined) : undefined
            return (
              <CardSelector
                key={i}
                icon={<IconComp size={24} />}
                label={label}
                description={description}
                selected={selected === i}
                disabled={disabled}
                onClick={() => setSelected(i)}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Showcase mode — show a few card selector examples without inline controller UI
  return (
    <div className="flex flex-col gap-8">
      {/* Default 3-card selection */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Single Selection</h3>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          {DEFAULT_LABELS.slice(0, 3).map((label, i) => {
            const IconComp = ICON_MAP[DEFAULT_ICONS[i]]
            return (
              <CardSelector
                key={i}
                icon={<IconComp size={24} />}
                label={label}
                selected={selected === i}
                onClick={() => setSelected(i)}
              />
            )
          })}
        </div>
      </section>

      {/* Disabled state */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Disabled</h3>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          {DEFAULT_LABELS.slice(0, 3).map((label, i) => {
            const IconComp = ICON_MAP[DEFAULT_ICONS[i]]
            return (
              <CardSelector
                key={i}
                icon={<IconComp size={24} />}
                label={label}
                selected={i === 0}
                disabled
              />
            )
          })}
        </div>
      </section>

      {/* Multi-row layout */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Multi-row (2×3)</h3>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          {DEFAULT_LABELS.map((label, i) => {
            const IconComp = ICON_MAP[DEFAULT_ICONS[i]]
            return (
              <CardSelector
                key={i}
                icon={<IconComp size={24} />}
                label={label}
                selected={selected === i}
                onClick={() => setSelected(i)}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
