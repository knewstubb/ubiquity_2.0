import { ModalFooter } from '@/components/composed/modal-footer'

export default function ModalFooterDemo(props: Record<string, unknown>) {
  const primaryLabel = (props['primary-label'] as string) ?? 'Save'
  const secondaryLabel = (props['secondary-label'] as string) ?? 'Cancel'
  const showTertiary = (props['show-tertiary'] as boolean) ?? false

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <ModalFooter
        primaryAction={{ label: primaryLabel, onClick: () => {} }}
        secondaryAction={{ label: secondaryLabel, onClick: () => {} }}
        tertiaryAction={showTertiary ? { label: 'Delete', variant: 'destructive', onClick: () => {} } : undefined}
      />
    </div>
  )
}
