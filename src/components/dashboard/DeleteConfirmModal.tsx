import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'

interface DeleteConfirmModalProps {
  /** The type of object being deleted, e.g. "Connection" or "Automation" */
  objectType: string
  /** The name of the object being deleted */
  objectName: string
  onConfirm: () => void
  onCancel: () => void
  /** Controlled open state — defaults to true for backward compatibility */
  open?: boolean
}

export function DeleteConfirmModal({
  objectType,
  objectName,
  onConfirm,
  onCancel,
  open = true,
}: DeleteConfirmModalProps) {
  return (
    <AlertDialogComposed
      open={open}
      onOpenChange={(value) => {
        if (!value) onCancel()
      }}
      intent="destructive"
      title={`Delete '${objectName}'?`}
      confirmLabel={`Delete ${objectType.toLowerCase()}`}
      onConfirm={onConfirm}
      requiresInput="DELETE"
    >
      <p className="m-0 leading-relaxed">
        This will permanently remove <span className="font-semibold">{objectName}</span> and all associated data. This cannot be undone.
      </p>
    </AlertDialogComposed>
  )
}
