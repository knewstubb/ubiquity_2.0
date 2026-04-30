import { useEffect, useCallback } from 'react';
import { X, CheckCircle, XCircle, Clock, ArrowsClockwise } from '@phosphor-icons/react';
import type { Connector } from '../../models/connector';
import styles from './ActivityLogModal.module.css';

interface ActivityLogModalProps {
  connector: Connector;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  status: 'success' | 'failed' | 'running' | 'skipped';
  user: string;
  action: string;
  date: string;
}

function generateSampleEntries(connector: Connector): LogEntry[] {
  const base = [
    {
      id: '1',
      status: 'success' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} completed — 1,247 records processed`,
      date: '27 Apr 2026 at 08:00',
    },
    {
      id: '2',
      status: 'success' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} completed — 1,245 records processed`,
      date: '26 Apr 2026 at 08:00',
    },
    {
      id: '3',
      status: 'failed' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} failed — connection timeout after 30s`,
      date: '25 Apr 2026 at 08:00',
    },
    {
      id: '4',
      status: 'success' as const,
      user: 'Brad K.',
      action: `Manual ${connector.direction} triggered — 1,243 records processed`,
      date: '24 Apr 2026 at 14:32',
    },
    {
      id: '5',
      status: 'skipped' as const,
      user: 'System',
      action: `Scheduled ${connector.direction} skipped — no new files detected`,
      date: '24 Apr 2026 at 08:00',
    },
  ];
  return base;
}

const STATUS_CONFIG = {
  success: { icon: CheckCircle, color: '#14B88A', bg: 'rgba(20, 184, 138, 0.12)' },
  failed: { icon: XCircle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
  running: { icon: ArrowsClockwise, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  skipped: { icon: Clock, color: '#A1A1AA', bg: 'rgba(161, 161, 170, 0.12)' },
};

export function ActivityLogModal({ connector, onClose }: ActivityLogModalProps) {
  const entries = generateSampleEntries(connector);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="activity-log-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 id="activity-log-title" className={styles.title}>Activity Log</h2>
            <p className={styles.subtitle}>{connector.name}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={styles.body}>
          {entries.map((entry) => {
            const cfg = STATUS_CONFIG[entry.status];
            const Icon = cfg.icon;
            return (
              <div key={entry.id} className={styles.entry}>
                <div className={styles.iconCircle} style={{ backgroundColor: cfg.bg }}>
                  <Icon size={16} weight="bold" color={cfg.color} />
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

        <div className={styles.footer}>
          <button type="button" className={styles.closeButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
