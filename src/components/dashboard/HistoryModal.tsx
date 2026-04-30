import { useEffect, useCallback } from 'react';
import { X, Plus, Play, Pause, PencilSimple } from '@phosphor-icons/react';
import type { Connector } from '../../models/connector';
import styles from './HistoryModal.module.css';

interface HistoryModalProps {
  connector: Connector;
  onClose: () => void;
}

interface HistoryEntry {
  id: string;
  icon: 'created' | 'activated' | 'deactivated' | 'edited';
  user: string;
  action: string;
  date: string;
}

function generateHistoryEntries(connector: Connector): HistoryEntry[] {
  const createdDate = new Date(connector.createdAt);
  const updatedDate = new Date(connector.updatedAt);

  const fmt = (d: Date) => {
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} at ${hours}:${mins}`;
  };

  const entries: HistoryEntry[] = [
    {
      id: '1',
      icon: 'created',
      user: 'Brad K.',
      action: `Created automation "${connector.name}"`,
      date: fmt(createdDate),
    },
    {
      id: '2',
      icon: 'activated',
      user: 'Brad K.',
      action: 'Activated automation',
      date: fmt(new Date(createdDate.getTime() + 60000)),
    },
  ];

  if (connector.status === 'paused') {
    entries.push({
      id: '3',
      icon: 'deactivated',
      user: 'Sarah M.',
      action: 'Paused automation',
      date: fmt(new Date(updatedDate.getTime() - 86400000)),
    });
  }

  entries.push({
    id: '4',
    icon: 'edited',
    user: 'Brad K.',
    action: 'Updated schedule and file pattern settings',
    date: fmt(updatedDate),
  });

  return entries.reverse();
}

const ICON_CONFIG = {
  created: { Icon: Plus, color: '#14B88A', bg: 'rgba(20, 184, 138, 0.12)' },
  activated: { Icon: Play, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  deactivated: { Icon: Pause, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  edited: { Icon: PencilSimple, color: '#71717A', bg: 'rgba(113, 113, 122, 0.12)' },
};

export function HistoryModal({ connector, onClose }: HistoryModalProps) {
  const entries = generateHistoryEntries(connector);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="history-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 id="history-title" className={styles.title}>History</h2>
            <p className={styles.subtitle}>{connector.name}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.timeline}>
            {entries.map((entry, idx) => {
              const cfg = ICON_CONFIG[entry.icon];
              const IconComponent = cfg.Icon;
              return (
                <div key={entry.id} className={styles.entry}>
                  <div className={styles.timelineTrack}>
                    <div className={styles.iconCircle} style={{ backgroundColor: cfg.bg }}>
                      <IconComponent size={14} weight="bold" color={cfg.color} />
                    </div>
                    {idx < entries.length - 1 && <div className={styles.timelineLine} />}
                  </div>
                  <div className={styles.entryContent}>
                    <div className={styles.entryMain}>
                      <span className={styles.entryUser}>{entry.user}</span>
                      <span className={styles.entryAction}>{entry.action}</span>
                    </div>
                    <span className={styles.entryDate}>{entry.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.closeButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
