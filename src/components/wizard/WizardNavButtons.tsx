import styles from './WizardNavButtons.module.css';

interface WizardNavButtonsProps {
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLast: boolean;
  showBack?: boolean;
}

export function WizardNavButtons({
  onBack,
  onNext,
  canProceed,
  isLast,
  showBack = true,
}: WizardNavButtonsProps) {
  return (
    <div className={styles.navButtons}>
      {showBack && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnBack}`}
          onClick={onBack}
        >
          Back
        </button>
      )}
      <button
        type="button"
        className={`${styles.btn} ${styles.btnNext}`}
        disabled={!canProceed}
        onClick={onNext}
      >
        {isLast ? 'Save' : 'Next'}
      </button>
    </div>
  );
}
