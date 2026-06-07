import { useState } from 'react'
import { RadioCard } from '@/components/composed/radio-card'
import { Input } from '@/components/ui/input'

export default function RadioCardDemo() {
  const [selected, setSelected] = useState('schedule')

  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <h3 className="text-base font-semibold text-foreground">Automation Trigger</h3>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Trigger type">
        <RadioCard
          label="On a schedule"
          selected={selected === 'schedule'}
          onSelect={() => setSelected('schedule')}
        >
          <Input placeholder="e.g. Every day at 9:00am" />
        </RadioCard>
        <RadioCard
          label="When a record is created"
          selected={selected === 'record-created'}
          onSelect={() => setSelected('record-created')}
        />
        <RadioCard
          label="When a field changes"
          selected={selected === 'field-change'}
          onSelect={() => setSelected('field-change')}
        />
        <RadioCard
          label="Manual trigger"
          selected={selected === 'manual'}
          onSelect={() => setSelected('manual')}
          disabled
        />
      </div>
    </div>
  )
}
