import { PageShell } from '../components/layout/PageShell';
import { notifications } from '../data/notifications';
import styles from './pages.module.css';

const sortedNotifications = [...notifications].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
);

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const dotClass: Record<string, string> = {
  success: styles.feedDotSuccess,
  info: styles.feedDotInfo,
  warning: styles.feedDotWarning,
  error: styles.feedDotError,
};

export default function ActivityPage() {
  return (
    <PageShell title="Activity" subtitle="Audit log and recent activity feed">
      <div className={styles.feedList}>
        {sortedNotifications.map((n) => (
          <div
            key={n.id}
            className={`${styles.feedItem} ${!n.read ? styles.feedUnread : ''}`}
          >
            <span className={`${styles.feedDot} ${dotClass[n.type] ?? ''}`} />
            <div className={styles.feedContent}>
              <p className={styles.feedMessage}>{n.message}</p>
              <p className={styles.feedTimestamp}>{formatTimestamp(n.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
