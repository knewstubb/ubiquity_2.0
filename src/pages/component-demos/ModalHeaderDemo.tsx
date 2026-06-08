import { ModalHeader } from '@/components/composed/modal-header'

export default function ModalHeaderDemo(props: Record<string, unknown>) {
  const title = (props.title as string) ?? 'Modal Title'
  const description = (props.description as string) ?? 'Optional description text'
  const showClose = (props['show-close'] as boolean) ?? true

  return (
    <div className="w-[460px] border border-border rounded-lg overflow-hidden">
      <ModalHeader
        title={title}
        description={description || undefined}
        onClose={showClose ? () => {} : undefined}
      />
    </div>
  )
}
