import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'

interface DeleteConfirmDialogProps {
  itemName: string
  itemType: 'campaign' | 'journey'
  onConfirm: () => void
  onCancel: () => void
  /** Controlled open state — defaults to true for backward compatibility with conditional rendering */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
}

export function DeleteConfirmDialog({
  itemName,
  itemType,
  onConfirm,
  onCancel,
  open = true,
  onOpenChange,
}: DeleteConfirmDialogProps) {
  function handleOpenChange(value: boolean) {
    if (!value) {
      onCancel()
    }
    onOpenChange?.(value)
  }

  return (
    <AlertDialogComposed
      open={open}
      onOpenChange={handleOpenChange}
      intent="destructive"
      title={`Delete '${itemName}'?`}
      confirmLabel={`Delete ${itemType}`}
      onConfirm={onConfirm}
      requiresCheckbox
    >
      This will permanently delete '{itemName}' and all its data. This cannot be undone.
    </AlertDialogComposed>
  )
}
