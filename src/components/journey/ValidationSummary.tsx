import {
  WarningCircle,
  Warning,
  CheckCircle,
  X,
} from '@phosphor-icons/react';
import type { ValidationError } from '../../utils/journeyValidation';
import styles from './ValidationSummary.module.css';

export interface ValidationSummaryProps {
  errors: ValidationError[];
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
}

export function ValidationSummary({
  errors,
  onSelectNode,
  onClose,
}: ValidationSummaryProps) {
  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return (
    <div className={styles.panel} role="region" aria-label="Validation summary">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>Validation</span>
          {errorCount > 0 && (
            <span className={styles.errorCount}>{errorCount}</span>
          )}
          {warningCount > 0 && (
            <span className={styles.warningCount}>{warningCount}</span>
          )}
        </div>
        <button
          className={styles.closeButton}
          onClick={onClose}
          title="Close validation summary"
          aria-label="Close validation summary"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

      {/* Success state */}
      {errors.length === 0 && (
        <div className={styles.successState}>
          <CheckCircle
            size={32}
            weight="fill"
            className={styles.successIcon}
          />
          <span className={styles.successText}>Journey is valid</span>
          <span className={styles.successSubtext}>
            No errors or warnings found
          </span>
        </div>
      )}

      {/* Error list */}
      {errors.length > 0 && (
        <ul className={styles.errorList}>
          {errors.map((error, index) => (
            <li
              key={`${error.nodeId ?? 'journey'}-${index}`}
              className={styles.errorItem}
              onClick={() => error.nodeId && onSelectNode(error.nodeId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (error.nodeId) onSelectNode(error.nodeId);
                }
              }}
              aria-label={`${error.severity}: ${error.message}`}
            >
              <span className={styles.errorIcon}>
                {error.severity === 'error' ? (
                  <WarningCircle
                    size={16}
                    weight="fill"
                    className={styles.errorIconError}
                  />
                ) : (
                  <Warning
                    size={16}
                    weight="fill"
                    className={styles.errorIconWarning}
                  />
                )}
              </span>
              <span className={styles.errorMessage}>{error.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
