import { InfoHint } from '@/components/composed/info-hint'
import type { ControlValue } from '@/data/componentRegistry'

interface InfoHintDemoProps {
  values: Record<string, ControlValue>
}

export default function InfoHintDemo({ values }: InfoHintDemoProps) {
  const variant = (values['variant'] as string) || 'inline'
  const text = (values['text'] as string) || 'Contacts already in the segment will not be re-added.'

  return (
    <div className="w-full max-w-md space-y-4">
      <InfoHint variant={variant as 'inline' | 'panel'}>
        {text}
      </InfoHint>
    </div>
  )
}
