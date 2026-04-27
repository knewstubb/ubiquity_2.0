import { useState, useEffect } from 'react';
import styles from './CreateCampaignDialog.module.css';

interface CreateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, goal: string) => void;
}

export function CreateCampaignDialog({
  open,
  onClose,
  onCreate,
}: CreateCampaignDialogProps) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const nameTrimmed = name.trim();
  const isNameValid = nameTrimmed.length > 0;

  useEffect(() => {
    if (open) {
      setName('');
      setGoal('');
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
    onCreate(nameTrimmed, goal.trim());
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-campaign-title"
    >
      <form className={styles.dialog} onSubmit={handleSubmit}>
        <h2 id="create-campaign-title" className={styles.title}>
          Create Campaign
        </h2>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="campaign-name">
            Campaign Name<span className={styles.required}>*</span>
          </label>
          <input
            id="campaign-name"
            className={`${styles.input} ${showValidation && !isNameValid ? styles.inputError : ''}`}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (showValidation && e.target.value.trim().length > 0) {
                setShowValidation(false);
              }
            }}
            placeholder="Enter campaign name"
            autoFocus
          />
          {showValidation && !isNameValid && (
            <p className={styles.validationMessage}>Campaign name is required</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="campaign-goal">
            Goal
          </label>
          <textarea
            id="campaign-goal"
            className={styles.textarea}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe the campaign goal (optional)"
          />
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
