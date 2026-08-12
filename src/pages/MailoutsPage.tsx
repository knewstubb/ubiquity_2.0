import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeSimple, Clock, CheckCircle, Warning, Spinner } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { useAccount } from '../contexts/AccountContext';
import { mailouts, getMailoutsForAccount } from '../data/mailouts';
import type { Mailout, MailoutStatus } from '../models/mailout';
import { cn } from '../lib/utils';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-NZ');
}

function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function StatusBadge({ status }: { status: MailoutStatus }) {
  const config: Record<MailoutStatus, { label: string; className: string; icon: React.ReactNode }> = {
    sent: {
      label: 'Sent',
      className: 'bg-success/10 text-success border-success/20',
      icon: <CheckCircle size={14} weight="fill" />,
    },
    sending: {
      label: 'Sending',
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: <Spinner size={14} weight="bold" className="animate-spin" />,
    },
    scheduled: {
      label: 'Scheduled',
      className: 'bg-info/10 text-info border-info/20',
      icon: <Clock size={14} weight="fill" />,
    },
    draft: {
      label: 'Draft',
      className: 'bg-muted text-muted-foreground border-border',
      icon: <EnvelopeSimple size={14} weight="fill" />,
    },
    failed: {
      label: 'Failed',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: <Warning size={14} weight="fill" />,
    },
  };

  const { label, className, icon } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border', className)}>
      {icon}
      {label}
    </span>
  );
}

function MailoutRow({ mailout, onClick }: { mailout: Mailout; onClick: () => void }) {
  const { metrics } = mailout;
  const openRate = formatPercent(metrics.opened, metrics.delivered);
  const clickRate = formatPercent(metrics.clicked, metrics.delivered);
  const deliveryRate = formatPercent(metrics.delivered, metrics.sent);

  return (
    <tr
      className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{mailout.name}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[300px]">{mailout.subject}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={mailout.status} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatDate(mailout.sentAt)}
      </td>
      <td className="py-3 px-4 text-sm text-foreground tabular-nums text-right">
        {formatNumber(metrics.sent)}
      </td>
      <td className="py-3 px-4 text-sm text-foreground tabular-nums text-right">
        <span className="text-foreground">{formatNumber(metrics.delivered)}</span>
        <span className="text-muted-foreground ml-1">({deliveryRate})</span>
      </td>
      <td className="py-3 px-4 text-sm tabular-nums text-right">
        <span className="text-foreground">{openRate}</span>
      </td>
      <td className="py-3 px-4 text-sm tabular-nums text-right">
        <span className="text-foreground">{clickRate}</span>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {mailout.segmentName || '—'}
      </td>
    </tr>
  );
}

export default function MailoutsPage() {
  const navigate = useNavigate();
  const { selectedAccountId } = useAccount();

  const filteredMailouts = useMemo(() => {
    const accountMailouts = getMailoutsForAccount(selectedAccountId, mailouts);
    // Sort by sentAt descending (most recent first)
    return [...accountMailouts].sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }, [selectedAccountId]);

  const handleRowClick = (mailoutId: string) => {
    navigate(`/channels/mailouts/${mailoutId}`);
  };

  return (
    <PageShell
      title="Mailouts"
      subtitle="Email campaigns sent to your audience"
    >
      {filteredMailouts.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Mailout
                </th>
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sent
                </th>
                <th className="py-2.5 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Recipients
                </th>
                <th className="py-2.5 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Delivered
                </th>
                <th className="py-2.5 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Open Rate
                </th>
                <th className="py-2.5 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Click Rate
                </th>
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Segment
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMailouts.map((mailout) => (
                <MailoutRow
                  key={mailout.id}
                  mailout={mailout}
                  onClick={() => handleRowClick(mailout.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-tertiary-foreground">
          <EnvelopeSimple size={48} weight="duotone" className="text-tertiary-foreground mb-3" />
          <p className="text-base font-semibold text-muted-foreground m-0 mb-2">No mailouts found</p>
          <p className="text-sm text-tertiary-foreground m-0">
            Mailouts will appear here once they've been sent.
          </p>
        </div>
      )}
    </PageShell>
  );
}
