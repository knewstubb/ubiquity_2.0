import { useState } from 'react'
import { SelectorCard } from '@/components/composed/selector-card'
import { CloudArrowUp, Database, Tag, CalendarBlank, Folder, Globe } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'

const ICONS = [CloudArrowUp, Database, Tag, CalendarBlank, Folder, Globe]
const LABELS = ['Cloud Upload', 'Database', 'Tagged', 'Scheduled', 'File Storage', 'Web API']
const DESCRIPTIONS = ['Push to cloud', 'Direct connection', 'With metadata', 'Time-based', 'Local files', 'REST endpoint']

export default function SelectorCardDemo(props: Record<string, unknown>) {
  const variant = (props.variant as string) ?? 'icon'
  const cardCount = (props.cards as number) ?? 3
  const columns = (props.columns as number) ?? 3
  const label = (props.label as string) ?? ''
  const description = (props.description as string) ?? ''
  const disabled = (props.disabled as boolean) ?? false
  const showIcon = (props['show-icon'] as boolean) ?? true
  const showChildren = (props['show-children'] as boolean) ?? true
  const maxWidth = (props['max-width'] as number) ?? 100

  const [selected, setSelected] = useState(0)
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set([0]))

  function toggleMulti(index: number) {
    setMultiSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const gridStyle = { gridTemplateColumns: `repeat(${columns}, 1fr)` }
  const wrapperStyle = { maxWidth: `${maxWidth}%` }

  if (variant === 'icon') {
    return (
      <div style={wrapperStyle}>
        <div className="grid gap-3 pt-2 pr-2" style={gridStyle}>
        {Array.from({ length: cardCount }).map((_, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <SelectorCard
              key={i}
              variant="icon"
              icon={showIcon ? <Icon size={28} /> : undefined}
              label={label || LABELS[i % LABELS.length]}
              description={description || DESCRIPTIONS[i % DESCRIPTIONS.length]}
              selected={selected === i}
              disabled={disabled}
              onSelect={() => setSelected(i)}
            />
          )
        })}
      </div>
      </div>
    )
  }

  if (variant === 'checkbox') {
    return (
      <div style={wrapperStyle}>
        <div className="grid gap-3" style={gridStyle}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <SelectorCard
            key={i}
            variant="checkbox"
            label={label || LABELS[i % LABELS.length]}
            description={description || DESCRIPTIONS[i % DESCRIPTIONS.length]}
            selected={multiSelected.has(i)}
            disabled={disabled}
            onToggle={() => toggleMulti(i)}
          />
        ))}
      </div>
      </div>
    )
  }

  if (variant === 'radio') {
    return (
      <div style={wrapperStyle}>
        <div className="grid gap-2" style={gridStyle}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <SelectorCard
            key={i}
            variant="radio"
            label={label || LABELS[i % LABELS.length]}
            selected={selected === i}
            disabled={disabled}
            onSelect={() => setSelected(i)}
          >
            {showChildren && selected === i && <Input placeholder="Filter value..." />}
          </SelectorCard>
        ))}
      </div>
      </div>
    )
  }

  // option variant
  return (
    <div style={wrapperStyle}>
      <div className="grid gap-3" style={gridStyle}>
      {Array.from({ length: cardCount }).map((_, i) => {
        const Icon = ICONS[i % ICONS.length]
        return (
          <SelectorCard
            key={i}
            variant="option"
            icon={showIcon ? <Icon size={20} weight="duotone" className="text-primary" /> : undefined}
            label={label || LABELS[i % LABELS.length]}
            description={description || DESCRIPTIONS[i % DESCRIPTIONS.length]}
            selected={selected === i}
            disabled={disabled}
            onSelect={() => setSelected(i)}
          />
        )
      })}
    </div>
    </div>
  )
}
