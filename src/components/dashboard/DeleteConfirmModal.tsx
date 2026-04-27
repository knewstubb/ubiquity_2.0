import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  connectorName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  connectorName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
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
      aria-labelledby="delete-modal-title"
    >
      <div className={styles.dialog}>
        <h2 id="delete-modal-title" className={styles.title}>
          Delete Automation
        </h2>
        <p className={styles.message}>
          Are you sure you want to delete {connectorName}? This action cannot be
          undone.
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
