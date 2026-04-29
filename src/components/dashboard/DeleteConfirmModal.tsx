import { useState, useCallback } from 'react';
import { X } from '@phosphor-icons/react';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  /** The type of object being deleted, e.g. "Connection" or "Automation" */
  objectType: string;
  /** The name of the object being deleted */
  objectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  objectType,
  objectName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');
  const isValid = inputValue.trim() === 'ACCEPT';

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid) onConfirm();
    },
    [isValid, onConfirm],
  );

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 id="delete-modal-title" className={styles.title}>
            Delete {objectType}?
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onCancel} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.divider} />

        <form onSubmit={handleSubmit} className={styles.body}>
          <p className={styles.message}>
            <strong>{objectName}</strong> will be deleted. This action cannot be undone.
          </p>
          <p className={styles.instruction}>
            Type <strong>ACCEPT</strong> in the box below to confirm deletion.
          </p>
          <input
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ACCEPT"
            autoFocus
            autoComplete="off"
          />

          <div className={styles.divider} />

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.deleteButton} disabled={!isValid}>
              Delete {objectType}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
