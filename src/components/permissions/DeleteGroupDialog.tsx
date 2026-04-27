import styles from './DeleteGroupDialog.module.css';

interface DeleteGroupDialogProps {
  open: boolean;
  groupName: string;
  affectedUserCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteGroupDialog({
  open,
  groupName,
  affectedUserCount,
  onConfirm,
  onCancel,
}: DeleteGroupDialogProps) {
  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-group-title"
    >
      <div className={styles.dialog}>
        <h2 id="delete-group-title" className={styles.title}>
          Delete <span className={styles.groupName}>{groupName}</span>
        </h2>
        <p className={styles.warning}>
          {affectedUserCount > 0
            ? `${affectedUserCount} user(s) currently assigned to this group will have their assignment changed to Custom with their current permissions preserved.`
            : 'No users are currently assigned to this group.'}
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
