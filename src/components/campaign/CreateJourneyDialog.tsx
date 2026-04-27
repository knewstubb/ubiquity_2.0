import { useState, useEffect } from 'react';
import type { JourneyType } from '../../models/campaign';
import styles from './CreateJourneyDialog.module.css';

const JOURNEY_TYPES: { value: JourneyType; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 're-engagement', label: 'Re-engagement' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'promotional', label: 'Promotional' },
];

interface CreateJourneyDialogProps {
  open: boolean;
  campaignId: string;
  onClose: () => void;
  onCreate: (name: string, type: JourneyType) => void;
}

export function CreateJourneyDialog({
  open,
  onClose,
  onCreate,
}: CreateJourneyDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<JourneyType>('welcome');
  const [showValidation, setShowValidation] = useState(false);

  const nameTrimmed = name.trim();
  const isNameValid = nameTrimmed.length > 0;

  useEffect(() => {
    if (open) {
      setName('');
      setType('welcome');
      setShowValidation(false);
    }
  }, [open]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isNameValid) {
      setShowValidation(true);
      return;
    }
    onCreate(nameTrimmed, type);
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-journey-title"
    >
      <form className={styles.dialog} onSubmit={handleSubmit}>
        <h2 id="create-journey-title" className={styles.title}>
          Create Journey
        </h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="journey-name">
            Journey Name<span className={styles.required}>*</span>
          </label>
          <input
            id="journey-name"
            className={`${styles.input} ${showValidation && !isNameValid ? styles.inputError : ''}`}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (showValidation && e.target.value.trim().length > 0) {
                setShowValidation(false);
              }
            }}
            placeholder="Enter journey name"
            autoFocus
          />
          {showValidation && !isNameValid && (
            <p className={styles.validationMessage}>Journey name is required</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="journey-type">
            Journey Type
          </label>
          <select
            id="journey-type"
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as JourneyType)}
          >
            {JOURNEY_TYPES.map((jt) => (
              <option key={jt.value} value={jt.value}>
                {jt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={styles.createButton}
            disabled={!isNameValid}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
