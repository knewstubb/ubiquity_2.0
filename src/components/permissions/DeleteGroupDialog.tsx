import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed'

interface DeleteGroupDialogProps {
  open: boolean
  groupName: string
  affectedUserCount: number
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteGroupDialog({
  open,
  groupName,
  affectedUserCount,
  onConfirm,
  onCancel,
}: DeleteGroupDialogProps) {
  return (
    <AlertDialogComposed
      open={open}
      onOpenChange={(value) => {
        if (!value) onCancel()
      }}
      intent="destructive"
      title={`Delete '${groupName}'?`}
      confirmLabel="Delete group"
      onConfirm={onConfirm}
      onCancel={onCancel}
      requiresCheckbox
    >
      <p className="m-0">
        {affectedUserCount > 0
          ? `${affectedUserCount} user(s) currently assigned to this group will have their assignment changed to Custom with their current permissions preserved.`
          : 'No users are currently assigned to this group.'}
      </p>
    </AlertDialogComposed>
  )
}
