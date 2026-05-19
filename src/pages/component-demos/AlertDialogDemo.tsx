import { useState } from 'react'
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'
import { Button } from '@/components/ui/button'

interface AlertDialogDemoProps {
  'object-name'?: string
  'confirmation-guard'?: 'none' | 'checkbox' | 'type-to-confirm'
  'input-text'?: string
  loading?: boolean
  'loading-label'?: string
}

// Intent-specific defaults based on the action type
const intentDefaults = {
  neutral: {
    action: 'Save',
    title: (name: string) => name ? `Save '${name}'?` : 'Save changes?',
    body: 'Your changes will be applied immediately.',
    confirmLabel: (name: string) => name ? `Save '${name}'` : 'Save',
  },
  warning: {
    action: 'Edit',
    title: (name: string) => name ? `Edit '${name}'?` : 'Edit connection?',
    body: 'Changes to this connection may affect all linked automations. Proceed only if you understand the impact.',
    confirmLabel: (name: string) => name ? `Edit '${name}'` : 'Edit connection',
  },
  destructive: {
    action: 'Delete',
    title: (name: string) => name ? `Delete '${name}'?` : 'Delete item?',
    body: 'This action cannot be undone. All associated data will be permanently removed.',
    confirmLabel: (name: string) => name ? `Delete '${name}'` : 'Delete',
  },
}

export default function AlertDialogDemo(props: AlertDialogDemoProps) {
  const [openIntent, setOpenIntent] = useState<'neutral' | 'warning' | 'destructive' | null>(null)

  const objectName = props['object-name'] ?? ''
  const confirmationGuard = props['confirmation-guard'] ?? 'none'
  const inputText = props['input-text'] ?? 'DELETE'
  const loading = props.loading ?? false
  const loadingLabel = props['loading-label'] ?? 'Deleting...'

  function getDialogProps(intent: 'neutral' | 'warning' | 'destructive') {
    const defaults = intentDefaults[intent]
    return {
      title: defaults.title(objectName),
      body: defaults.body,
      confirmLabel: defaults.confirmLabel(objectName),
    }
  }

  function handleConfirm() {
    if (loading) {
      return new Promise<void>(resolve => setTimeout(resolve, 2000))
    }
    setOpenIntent(null)
  }

  const dialogProps = openIntent ? getDialogProps(openIntent) : null

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="default" onClick={() => setOpenIntent('neutral')}>
          Open neutral dialog
        </Button>
        <Button variant="secondarySolid" onClick={() => setOpenIntent('warning')}>
          Open warning dialog
        </Button>
        <Button variant="destructive" onClick={() => setOpenIntent('destructive')}>
          Open destructive dialog
        </Button>
      </div>

      {openIntent && dialogProps && (
        <AlertDialogComposed
          open={true}
          onOpenChange={(value) => { if (!value) setOpenIntent(null) }}
          intent={openIntent}
          title={dialogProps.title}
          confirmLabel={dialogProps.confirmLabel}
          onConfirm={handleConfirm}
          requiresCheckbox={openIntent === 'destructive' && confirmationGuard === 'checkbox' ? true : undefined}
          requiresInput={openIntent === 'destructive' && confirmationGuard === 'type-to-confirm' ? inputText : undefined}
          loadingLabel={loading ? loadingLabel : undefined}
        >
          {dialogProps.body}
        </AlertDialogComposed>
      )}
    </>
  )
}
