import { CheckboxCard } from '@/components/composed/checkbox-card'
import type { ExporterType } from '@/models/wizard'

interface TypeSelectionStepProps {
  selectedType: ExporterType | null
  onSelect: (type: ExporterType) => void
}

const TYPE_OPTIONS: { id: ExporterType; label: string; description: string }[] = [
  {
    id: 'contact_transactional',
    label: 'Contact/Transactional',
    description: 'Export specific contact and transactional data fields',
  },
  {
    id: 'event_based',
    label: 'Event-based',
    description: 'Export event sources such as mailout sends, campaign events, or failed sends',
  },
]

export function TypeSelectionStep({ selectedType, onSelect }: TypeSelectionStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-semibold text-foreground m-0">What type of exporter do you want to create?</h3>
        <p className="text-sm text-muted-foreground mt-1 m-0">
          Choose the exporter type to configure the appropriate steps and field options.
        </p>
      </div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Exporter type selection">
        {TYPE_OPTIONS.map((option) => (
          <CheckboxCard
            key={option.id}
            selected={selectedType === option.id}
            onToggle={() => onSelect(option.id)}
            label={option.label}
            description={option.description}
          />
        ))}
      </div>
    </div>
  )
}
