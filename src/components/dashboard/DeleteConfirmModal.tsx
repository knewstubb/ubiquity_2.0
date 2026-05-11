import { useState, useCallback } from 'react';
import { Modal } from '../shared/Modal';
import { TextField } from '../shared/TextField';

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
    <Modal
      title={`Delete ${objectType}?`}
      onClose={onCancel}
      maxWidth="460px"
      primaryAction={{
        label: `Delete ${objectType}`,
        onClick: () => { if (isValid) onConfirm(); },
        disabled: !isValid,
        variant: 'destructive',
      }}
      secondaryAction={{ label: 'Cancel', onClick: onCancel }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="m-0 text-base text-muted-foreground leading-relaxed [&>strong]:text-foreground">
          <strong>{objectName}</strong> will be deleted. This action cannot be undone.
        </p>
        <p className="m-0 text-base text-muted-foreground leading-relaxed [&>strong]:text-foreground">
          Type <strong>ACCEPT</strong> in the box below to confirm deletion.
        </p>
        <TextField
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="ACCEPT"
          autoFocus
          autoComplete="off"
        />
      </form>
    </Modal>
  );
}
