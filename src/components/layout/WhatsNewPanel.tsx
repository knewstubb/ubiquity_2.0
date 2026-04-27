import { useState, useCallback } from 'react';
import { X } from '@phosphor-icons/react';
import { useChangelog } from '../../contexts/ChangelogContext';
import styles from './WhatsNewPanel.module.css';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function WhatsNewPanel() {
  const { entries } = useChangelog();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button type="button" className={styles.triggerBtn} onClick={open}>
        What's New
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={close} />
          <div className={styles.panel} role="dialog" aria-label="What's New">
            <div className={styles.header}>
              <h2 className={styles.title}>What's New</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={close}
                aria-label="Close panel"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className={styles.content}>
              {entries.length === 0 ? (
                <p className={styles.emptyState}>No changelog entries yet.</p>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className={styles.entry}>
                    <h3 className={styles.entryTitle}>{entry.title}</h3>
                    <div className={styles.entryDate}>{formatDate(entry.createdAt)}</div>
                    {entry.description && (
                      <p className={styles.entryDescription}>{entry.description}</p>
                    )}
                    {entry.affectedRoutes.length > 0 && (
                      <div className={styles.routes}>
                        {entry.affectedRoutes.map((route) => (
                          <span key={route} className={styles.routeChip}>
                            {route}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
