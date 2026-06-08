import { useState } from 'react'
import { SelectorCard } from '@/components/composed/selector-card'
import { CloudArrowUp, Database, Tag, CalendarBlank } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'

export default function SelectorCardDemo(props: Record<string, unknown>) {
  const variant = (props.variant as string) ?? 'icon'
  const label = (props.label as string) ?? 'Option label'
  const description = (props.description as string) ?? ''
  const selected = (props.selected as boolean) ?? true
  const disabled = (props.disabled as boolean) ?? false
  const showIcon = (props['show-icon'] as boolean) ?? true
  const showChildren = (props['show-children'] as boolean) ?? true

  // Local state for interactive demo
  const [isSelected, setIsSelected] = useState(selected)

  const icon = showIcon ? <CloudArrowUp size={20} weight="duotone" className="text-primary" /> : undefined

  if (variant === 'icon') {
    return (
      <div className="grid grid-cols-3 gap-4 pt-2 pr-2">
        <SelectorCard
          variant="icon"
          icon={<CloudArrowUp size={28} weight="duotone" />}
          label={label || 'Cloud Upload'}
          description={description || 'Push to cloud'}
          selected={isSelected}
          disabled={disabled}
          onSelect={() => setIsSelected(!isSelected)}
        />
        <SelectorCard
          variant="icon"
          icon={<Database size={28} weight="duotone" />}
          label="Database"
          description="Direct connection"
          selected={false}
          disabled={disabled}
          onSelect={() => {}}
        />
        <SelectorCard
          variant="icon"
          icon={<Tag size={28} weight="duotone" />}
          label="Tagged"
          description="With metadata"
          selected={false}
          disabled={disabled}
          onSelect={() => {}}
        />
      </div>
    )
  }

  if (variant === 'checkbox') {
    return (
      <div className="flex flex-col gap-3 max-w-sm">
        <SelectorCard
          variant="checkbox"
          label={label || 'Contacts'}
          description={description || 'Contact database records'}
          selected={isSelected}
          disabled={disabled}
          onToggle={() => setIsSelected(!isSelected)}
        />
        <SelectorCard
          variant="checkbox"
          label="Transactions"
          description="Purchase history"
          selected={false}
          disabled={disabled}
          onToggle={() => {}}
        />
      </div>
    )
  }

  if (variant === 'radio') {
    return (
      <div className="flex flex-col gap-3 max-w-sm">
        <SelectorCard
          variant="radio"
          label={label || 'Contains'}
          selected={isSelected}
          disabled={disabled}
          onSelect={() => setIsSelected(!isSelected)}
        >
          {showChildren && <Input placeholder="Filter value..." />}
        </SelectorCard>
        <SelectorCard
          variant="radio"
          label="Starts with"
          selected={false}
          disabled={disabled}
          onSelect={() => {}}
        />
      </div>
    )
  }

  // option variant
  return (
    <div className="flex flex-col gap-3 max-w-md">
      <SelectorCard
        variant="option"
        icon={icon}
        label={label || 'Fixed value'}
        description={description || 'Apply the same value to every record on import.'}
        selected={isSelected}
        disabled={disabled}
        onSelect={() => setIsSelected(!isSelected)}
      />
      <SelectorCard
        variant="option"
        icon={showIcon ? <CalendarBlank size={20} weight="duotone" className="text-primary" /> : undefined}
        label="Next send date"
        description="Stamp each record with the next scheduled send date."
        selected={false}
        disabled={disabled}
        onSelect={() => {}}
      />
    </div>
  )
}
