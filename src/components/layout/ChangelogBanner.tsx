import { X } from '@phosphor-icons/react';
import { useChangelog } from '../../contexts/ChangelogContext';
import styles from './ChangelogBanner.module.css';

export function ChangelogBanner() {
  const { showBanner, unseenEntries, dismissBanner } = useChangelog();

  if (!showBanner) return null;

  return (
    <div className={styles.banner} role="status" aria-label="New updates available">
      <span className={styles.label}>What's New:</span>
      <div className={styles.entries}>
        {unseenEntries.map((entry) => (
          <span key={entry.id} className={styles.entryTitle}>
            {entry.title}
          </span>
        ))}
      </div>
      <button
        type="button"
        className={styles.dismissBtn}
        onClick={dismissBanner}
        aria-label="Dismiss changelog banner"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}
