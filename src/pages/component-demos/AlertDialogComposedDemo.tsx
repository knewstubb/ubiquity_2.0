import { useState } from 'react'
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'
import { Button } from '@/components/ui/button'

export default function AlertDialogComposedDemo(props: Record<string, unknown>) {
  const [open, setOpen] = useState(false)
  const intent = (props.intent as 'neutral' | 'warning' | 'destructive') ?? 'destructive'
  const title = (props.title as string) ?? 'Delete this item?'
  const confirmLabel = (props['confirm-label'] as string) ?? 'Delete'
  const requiresCheckbox = (props['requires-checkbox'] as boolean) ?? false
  const requiresInput = (props['requires-input'] as string) || undefined

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>Open Dialog</Button>
      <AlertDialogComposed
        open={open}
        onOpenChange={setOpen}
        intent={intent}
        title={title}
        confirmLabel={confirmLabel}
        requiresCheckbox={requiresCheckbox}
        requiresInput={requiresInput}
        onConfirm={() => setOpen(false)}
      >
        This action cannot be undone. Are you sure you want to proceed?
      </AlertDialogComposed>
    </>
  )
}
