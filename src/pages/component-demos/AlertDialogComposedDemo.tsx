import { useState } from 'react'
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'
import { Button } from '@/components/ui/button'

export default function AlertDialogComposedDemo() {
  const [openIntent, setOpenIntent] = useState<'neutral' | 'warning' | 'destructive' | 'type-confirm' | null>(null)

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default" onClick={() => setOpenIntent('neutral')}>Neutral</Button>
        <Button variant="secondary" onClick={() => setOpenIntent('warning')}>Warning</Button>
        <Button variant="destructive" onClick={() => setOpenIntent('destructive')}>Destructive</Button>
        <Button variant="destructive" onClick={() => setOpenIntent('type-confirm')}>Type to Confirm</Button>
      </div>

      <AlertDialogComposed
        open={openIntent === 'neutral'}
        onOpenChange={(v) => { if (!v) setOpenIntent(null) }}
        intent="neutral"
        title="Discard changes?"
        confirmLabel="Discard"
        onConfirm={() => setOpenIntent(null)}
      >
        You have unsaved changes that will be lost.
      </AlertDialogComposed>

      <AlertDialogComposed
        open={openIntent === 'warning'}
        onOpenChange={(v) => { if (!v) setOpenIntent(null) }}
        intent="warning"
        title="Edit 'Mailchimp' connection?"
        confirmLabel="Edit connection"
        onConfirm={() => setOpenIntent(null)}
      >
        Changing this connection may affect 3 linked automations.
      </AlertDialogComposed>

      <AlertDialogComposed
        open={openIntent === 'destructive'}
        onOpenChange={(v) => { if (!v) setOpenIntent(null) }}
        intent="destructive"
        title="Delete 'Summer Sale' campaign?"
        confirmLabel="Delete"
        requiresCheckbox
        onConfirm={() => setOpenIntent(null)}
      >
        This campaign and all associated analytics will be permanently removed.
      </AlertDialogComposed>

      <AlertDialogComposed
        open={openIntent === 'type-confirm'}
        onOpenChange={(v) => { if (!v) setOpenIntent(null) }}
        intent="destructive"
        title="Delete 'Acme Corp' account?"
        confirmLabel="Delete account"
        requiresInput="DELETE"
        onConfirm={() => setOpenIntent(null)}
      >
        This will permanently delete the account and all associated data.
      </AlertDialogComposed>
    </>
  )
}
