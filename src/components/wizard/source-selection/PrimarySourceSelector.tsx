import { useState } from 'react'
import { Users, Receipt, ChatCircle } from '@phosphor-icons/react'
import { CardSelector } from '@/components/composed/card-selector'
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'
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
    icon: <Users />,
  },
  {
    id: 'transactions',
    label: 'Transactions',
    description: 'Export transactional data records',
    icon: <Receipt />,
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'Export message delivery data',
    icon: <ChatCircle />,
  },
]

export function PrimarySourceSelector({
  selected,
  onChange,
  hasDownstreamConfig,
}: PrimarySourceSelectorProps) {
  const [pendingType, setPendingType] = useState<PrimarySourceType | null>(null)

  function handleSelect(type: PrimarySourceType) {
    if (type === selected) return

    if (hasDownstreamConfig && selected !== null) {
      setPendingType(type)
      return
    }

    onChange(type)
  }

  function handleConfirmChange() {
    if (pendingType) {
      onChange(pendingType)
      setPendingType(null)
    }
  }

  function handleCancelChange() {
    setPendingType(null)
  }

  return (
    <>
      <div
        className="grid grid-cols-3 gap-3 pt-2 pr-2"
        role="group"
        aria-label="Primary source selection"
      >
        {SOURCE_OPTIONS.map((option) => (
          <CardSelector
            key={option.id}
            icon={option.icon}
            label={option.label}
            description={option.description}
            selected={selected === option.id}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>

      <AlertDialogComposed
        open={pendingType !== null}
        onOpenChange={(open) => { if (!open) handleCancelChange() }}
        intent="warning"
        title="Change primary source?"
        confirmLabel="Continue"
        cancelLabel="Keep current"
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
      >
        Changing the primary source will reset your filter and enrichment settings.
      </AlertDialogComposed>
    </>
  )
}
