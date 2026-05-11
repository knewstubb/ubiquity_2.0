import { PageShell } from '../components/layout/PageShell';
import { notifications } from '../data/notifications';
import { cn } from '../lib/utils';

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
  success: 'bg-primary',
  info: 'bg-info',
  warning: 'bg-warning',
  error: 'bg-destructive',
};

export default function ActivityPage() {
  return (
    <PageShell title="Activity" subtitle="Audit log and recent activity feed">
      <div className="flex flex-col gap-0">
        {sortedNotifications.map((n, i) => (
          <div
            key={n.id}
            className={cn(
              'flex items-start gap-4 px-5 py-4 border-b border-border bg-white',
              i === 0 && 'rounded-t-md border-t border-border',
              i === sortedNotifications.length - 1 && 'rounded-b-md'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', dotClass[n.type] ?? '')} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm text-foreground m-0 leading-normal', !n.read && 'font-semibold')}>{n.message}</p>
              <p className="text-xs text-tertiary-foreground mt-1 mb-0">{formatTimestamp(n.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
