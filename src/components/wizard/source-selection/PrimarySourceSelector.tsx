import { Users, Receipt, ChatCircle } from '@phosphor-icons/react'
import { CardSelector } from '@/components/composed/card-selector'
import type { PrimarySourceType } from '../../../models/source-selection'

interface PrimarySourceSelectorProps {
  selected: PrimarySourceType | null
  onChange: (type: PrimarySourceType) => void
  hasDownstreamConfig: boolean
}

const SOURCE_OPTIONS: {
  id: PrimarySourceType
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    id: 'contacts',
    label: 'Contacts',
    description: 'Export contact records from your database',
    icon: <Users weight="duotone" />,
  },
  {
    id: 'transactions',
    label: 'Transactions',
    description: 'Export transactional data records',
    icon: <Receipt weight="duotone" />,
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'Export message delivery data',
    icon: <ChatCircle weight="duotone" />,
  },
]

export function PrimarySourceSelector({
  selected,
  onChange,
  hasDownstreamConfig,
}: PrimarySourceSelectorProps) {
  function handleSelect(type: PrimarySourceType) {
    if (type === selected) return

    if (hasDownstreamConfig && selected !== null) {
      const confirmed = window.confirm(
        'Changing the primary source will reset your filter and enrichment settings. Continue?'
      )
      if (!confirmed) return
    }

    onChange(type)
  }

  return (
    <div
      className="grid grid-cols-3 gap-3"
      role="radiogroup"
      aria-label="Primary source selection"
    >
      {SOURCE_OPTIONS.map((option) => (
        <CardSelector
          key={option.id}
          icon={option.icon}
          label={option.label}
          selected={selected === option.id}
          onClick={() => handleSelect(option.id)}
        />
      ))}
    </div>
  )
}
