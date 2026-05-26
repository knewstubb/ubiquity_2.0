import { useState } from 'react'
import { CheckboxCard } from '@/components/composed/checkbox-card'
import { useControlValues } from '@/lib/useControlValues'

const DEMO_OPTIONS = [
  { id: 'contacts', label: 'Contacts', description: 'Contact database records' },
  { id: 'mailout', label: 'Mailout Data', description: 'Email send, delivery, and engagement logs' },
  { id: 'transactional', label: 'Transactional', description: 'Purchase and activity data' },
]

export default function CheckboxCardDemo({ controls }: { controls?: Record<string, unknown> }) {
  const values = useControlValues(controls)
  const label = (values['label'] as string) ?? 'Contacts'
  const description = (values['description'] as string) ?? 'Contact database records'
  const disabled = (values['disabled'] as boolean) ?? false
  const controlledSelected = (values['selected'] as boolean) ?? false

  const [selected, setSelected] = useState<Set<string>>(new Set(['contacts']))

  // In controller mode, show a single card driven by the controls
  if (controls) {
    return (
      <div className="flex flex-col gap-2 p-8 max-w-md">
        <CheckboxCard
          selected={controlledSelected}
          onToggle={() => {}}
          label={label}
          description={description}
          disabled={disabled}
        />
      </div>
    )
  }

  // In standalone mode, show the full multi-select demo
  function handleToggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size <= 1) return prev
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2 p-8 max-w-md">
      {DEMO_OPTIONS.map((opt) => (
        <CheckboxCard
          key={opt.id}
          selected={selected.has(opt.id)}
          onToggle={() => handleToggle(opt.id)}
          label={opt.label}
          description={opt.description}
        />
      ))}
      <p className="text-xs text-muted-foreground mt-2 m-0">
        Selected: {Array.from(selected).join(', ')}
      </p>
    </div>
  )
}
