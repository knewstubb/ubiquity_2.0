import { ModalFooter } from '@/components/composed/modal-footer'
import type { ModalAction } from '@/components/composed/modal-footer'

export default function ModalFooterDemo(props: Record<string, unknown>) {
  const primaryLabel = (props['primary-label'] as string) ?? 'Save'
  const primaryVariant = (props['primary-variant'] as string) ?? 'default'
  const showSecondary = (props['show-secondary'] as boolean) ?? true
  const secondaryLabel = (props['secondary-label'] as string) ?? 'Cancel'
  const showTertiary = (props['show-tertiary'] as boolean) ?? false
  const tertiaryLabel = (props['tertiary-label'] as string) ?? 'Delete'

  const primary: ModalAction = {
    label: primaryLabel,
    variant: primaryVariant as ModalAction['variant'],
    onClick: () => {},
  }

  const secondary: ModalAction | undefined = showSecondary
    ? { label: secondaryLabel, variant: 'ghost', onClick: () => {} }
    : undefined

  const tertiary: ModalAction | undefined = showTertiary
    ? { label: tertiaryLabel, variant: 'destructiveOutline', onClick: () => {} }
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
