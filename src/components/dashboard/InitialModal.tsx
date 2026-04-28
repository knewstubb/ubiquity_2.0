import { useState, useEffect, useCallback } from 'react';
import type { Connection } from '../../models/connection';
import styles from './InitialModal.module.css';

interface InitialModalProps {
  connection: Connection;
  onProceed: (name: string, direction: 'import' | 'export') => void;
  onClose: () => void;
}

export function InitialModal({ connection, onProceed, onClose }: InitialModalProps) {
  const [name, setName] = useState('');
  const [direction, setDirection] = useState<'import' | 'export' | null>(null);

  const canProceed = direction !== null && name.trim().length > 0;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleProceed() {
    if (canProceed) onProceed(name.trim(), direction!);
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}
      role="dialog" aria-modal="true" aria-labelledby="initial-modal-title">
      <div className={styles.dialog}>
        {/* Title bar */}
        <div className={styles.titleBar}>
          <h2 id="initial-modal-title" className={styles.title}>New Automation</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {/* Connection name — centred, teal */}
          <div className={styles.connectionName}>{connection.name}</div>

          {/* Automation Type — card selector */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Automation Type</span>
            <div className={styles.typeCards}>
              <button
                type="button"
                className={`${styles.typeCard} ${direction === 'import' ? styles.typeCardActive : ''}`}
                onClick={() => setDirection('import')}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M16 6v14M10 14l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 24h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className={styles.typeCardLabel}>IMPORTER</span>
              </button>
              <button
                type="button"
                className={`${styles.typeCard} ${direction === 'export' ? styles.typeCardActive : ''}`}
                onClick={() => setDirection('export')}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M16 20V6M10 12l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 24h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className={styles.typeCardLabel}>EXPORTER</span>
              </button>
            </div>
          </div>

          {/* Automation Name */}
          <div className={styles.section}>
            <label className={styles.sectionLabel} htmlFor="automation-name-input">Automation Name</label>
            <input
              id="automation-name-input"
              className={styles.nameInput}
              type="text"
              placeholder="Enter automation name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.nextButton} disabled={!canProceed} onClick={handleProceed}>Next</button>
        </div>
      </div>
    </div>
  );
}
