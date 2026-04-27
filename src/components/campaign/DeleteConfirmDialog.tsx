import styles from './DeleteConfirmDialog.module.css';

interface DeleteConfirmDialogProps {
  itemName: string;
  itemType: 'campaign' | 'journey';
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  itemName,
  itemType,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
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
      aria-labelledby="delete-confirm-title"
    >
      <div className={styles.dialog}>
        <h2 id="delete-confirm-title" className={styles.title}>
          Delete {itemType === 'campaign' ? 'Campaign' : 'Journey'}
        </h2>
        <p className={styles.message}>
          Are you sure you want to delete {itemName}? This action cannot be undone.
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
