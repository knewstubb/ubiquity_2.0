import { ModalFooter } from '@/components/composed/modal-footer'
import type { ModalAction } from '@/components/composed/modal-footer'

export default function ModalFooterDemo(props: Record<string, unknown>) {
  const intent = (props.intent as string) ?? 'default'
  const primaryLabel = (props['primary-label'] as string) ?? 'Save'
  const showSecondary = (props['show-secondary'] as boolean) ?? true
  const secondaryLabel = (props['secondary-label'] as string) ?? 'Cancel'
  const showTertiary = (props['show-tertiary'] as boolean) ?? false

  // In destructive mode, the red button takes the secondary position (left)
  // and cancel moves to the primary position (right) — prevents muscle-memory clicks
  if (intent === 'destructive') {
    return (
      <div className="w-[460px] border border-border rounded-lg overflow-hidden">
        <ModalFooter
          primaryAction={{ label: secondaryLabel, variant: 'ghost', onClick: () => {} }}
          secondaryAction={{ label: primaryLabel, variant: 'destructive', onClick: () => {} }}
        />
      </div>
    )
  }

  // Warning mode: dark solid confirm button (secondary variant)
  const primaryVariant: ModalAction['variant'] = intent === 'warning' ? 'secondary' : 'default'

  const primary: ModalAction = {
    label: primaryLabel,
    variant: primaryVariant,
    onClick: () => {},
  }

  const secondary: ModalAction | undefined = showSecondary
    ? { label: secondaryLabel, variant: 'ghost', onClick: () => {} }
    : undefined

  const tertiary: ModalAction | undefined = showTertiary
    ? { label: 'Delete', variant: 'destructiveOutline', onClick: () => {} }
    : undefined

  return (
    <div className="w-[460px] border border-border rounded-lg overflow-hidden">
      <ModalFooter
        primaryAction={primary}
        secondaryAction={secondary}
        tertiaryAction={tertiary}
      />
    </div>
  )
}
