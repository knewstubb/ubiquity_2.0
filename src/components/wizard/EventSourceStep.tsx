import { useCallback, useState } from 'react'
import { CheckboxCard } from '@/components/composed/checkbox-card'
import type { EventSource, ExporterWizardDraft } from '@/models/wizard'

interface EventSourceStepProps {
  draft: ExporterWizardDraft
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void
}

const EVENT_SOURCE_OPTIONS: { id: EventSource; label: string; description: string }[] = [
  {
    id: 'mailout_sends',
    label: 'Mailouts from this send',
    description: 'Email send, delivery, and engagement event data',
  },
  {
    id: 'campaign_events',
    label: 'All event channels from this campaign',
    description: 'Events across all channels within a campaign',
  },
  {
    id: 'failed_sends',
    label: 'All failed sends from this send',
    description: 'Bounce and failure event data for a send',
  },
]

export function EventSourceStep({ draft, onUpdate }: EventSourceStepProps) {
  const [touched, setTouched] = useState(false)
  const selectedEventSources = draft.selectedEventSources

  const handleToggle = useCallback(
    (sourceId: EventSource) => {
      setTouched(true)
      const current = [...selectedEventSources]
      const index = current.indexOf(sourceId)
      if (index >= 0) {
        current.splice(index, 1)
      } else {
        current.push(sourceId)
      }
      onUpdate({ selectedEventSources: current })
    },
    [selectedEventSources, onUpdate],
  )

  const showValidation = touched && selectedEventSources.length === 0

  return (
    <div className="flex flex-col gap-4" data-testid="event-source-step">
      <div>
        <h3 className="text-base font-semibold text-foreground m-0">
          Select event sources
        </h3>
        <p className="text-sm text-muted-foreground mt-1 m-0">
          Choose one or more event sources to include in this export.
        </p>
      </div>

      <div className="flex flex-col gap-2" role="group" aria-label="Event source selection">
        {EVENT_SOURCE_OPTIONS.map((option) => (
          <CheckboxCard
            key={option.id}
            selected={selectedEventSources.includes(option.id)}
            onToggle={() => handleToggle(option.id)}
            label={option.label}
            description={option.description}
          />
        ))}
      </div>

      {showValidation && (
        <p
          className="text-sm text-destructive m-0"
          role="alert"
          aria-live="polite"
        >
          At least one event source is required.
        </p>
      )}
    </div>
  )
}
