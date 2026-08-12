import { useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  EnvelopeSimple,
  CheckCircle,
  Eye,
  CursorClick,
  UserMinus,
  Warning,
  DeviceMobile,
  Desktop,
  Link as LinkIcon,
} from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { mailouts } from '../data/mailouts';
import type { Mailout } from '../models/mailout';
import { cn } from '../lib/utils';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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

function formatPercentValue(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Stat card for top-level metrics
function StatCard({
  label,
  value,
  subValue,
  icon,
  color = 'default',
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const colorClasses = {
    default: 'bg-muted/50 text-muted-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
      <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg', colorClasses[color])}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-xl font-semibold text-foreground tabular-nums">{value}</span>
        {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
      </div>
    </div>
  );
}

// Progress bar for engagement metrics
function EngagementBar({
  label,
  value,
  total,
  description,
}: {
  label: string;
  value: number;
  total: number;
  description: string;
}) {
  const percent = formatPercentValue(value, total);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground tabular-nums">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}

// Device breakdown pie chart (simplified visual)
function DeviceBreakdown({ desktop, mobile }: { desktop: number; mobile: number }) {
  const total = desktop + mobile;
  const desktopPercent = total > 0 ? (desktop / total) * 100 : 50;
  const mobilePercent = total > 0 ? (mobile / total) * 100 : 50;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${desktopPercent} ${100 - desktopPercent}`}
            className="text-primary"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Desktop size={16} className="text-primary" />
          <span className="text-sm text-foreground">Desktop</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{desktopPercent.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <DeviceMobile size={16} className="text-muted-foreground" />
          <span className="text-sm text-foreground">Mobile</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{mobilePercent.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

// Hourly activity chart (simple bar chart)
function ActivityChart({ data }: { data: { hour: number; opens: number; clicks: number }[] }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => Math.max(d.opens, d.clicks)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>Opens</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <span>Clicks</span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => (
          <div key={d.hour} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '100px' }}>
              <div
                className="w-full bg-primary rounded-t-sm transition-all duration-300"
                style={{ height: `${(d.opens / maxValue) * 100}%` }}
                title={`${d.opens} opens`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{d.hour}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Links table
function LinksTable({ links }: { links: Mailout['links'] }) {
  if (links.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No links tracked in this mailout.</p>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="border-b border-border">
            <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Link
            </th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Unique Clicks
            </th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total Clicks
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id} className="border-b border-border last:border-b-0">
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <LinkIcon size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground font-medium">{link.label}</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-sm text-foreground tabular-nums text-right">
                {formatNumber(link.uniqueClicks)}
              </td>
              <td className="py-2.5 px-3 text-sm text-foreground tabular-nums text-right">
                {formatNumber(link.totalClicks)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MailoutReportPage() {
  const { mailoutId } = useParams<{ mailoutId: string }>();
  const navigate = useNavigate();

  const mailout = useMemo(() => {
    return mailouts.find((m) => m.id === mailoutId);
  }, [mailoutId]);

  if (!mailout) {
    return <Navigate to="/channels/mailouts" replace />;
  }

  const { metrics } = mailout;

  // Calculate key rates
  const deliveryRate = formatPercent(metrics.delivered, metrics.sent);
  const openRate = formatPercent(metrics.opened, metrics.delivered);
  const clickRate = formatPercent(metrics.clicked, metrics.delivered);
  const clickToOpenRate = formatPercent(metrics.clicked, metrics.opened);

  return (
    <PageShell
      title={mailout.name}
      subtitle={`Sent ${formatDate(mailout.sentAt)}`}
      action={
        <button
          className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-foreground border border-border rounded font-medium text-sm cursor-pointer transition-colors duration-150 hover:bg-muted"
          onClick={() => navigate('/channels/mailouts')}
        >
          <ArrowLeft size={16} />
          Back to Mailouts
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Subject line */}
        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</span>
            <span className="text-base text-foreground">{mailout.subject}</span>
            {mailout.preheaderText && (
              <span className="text-sm text-muted-foreground">{mailout.preheaderText}</span>
            )}
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Click-through Rate"
            value={clickRate}
            subValue="of delivered"
            icon={<CursorClick size={20} weight="fill" />}
            color="success"
          />
          <StatCard
            label="Click-to-Open Rate"
            value={clickToOpenRate}
            subValue="of opened"
            icon={<CursorClick size={20} weight="fill" />}
            color="success"
          />
          <StatCard
            label="Open Rate"
            value={openRate}
            subValue="of delivered"
            icon={<Eye size={20} weight="fill" />}
            color="default"
          />
          <StatCard
            label="Delivery Rate"
            value={deliveryRate}
            subValue="of sent"
            icon={<CheckCircle size={20} weight="fill" />}
            color="default"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Sent</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{formatNumber(metrics.sent)}</span>
          </div>
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Delivered</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{formatNumber(metrics.delivered)}</span>
          </div>
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Opened</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{formatNumber(metrics.opened)}</span>
          </div>
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Clicked</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{formatNumber(metrics.clicked)}</span>
          </div>
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Bounced</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{formatNumber(metrics.bounced)}</span>
          </div>
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Unsubscribed</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{formatNumber(metrics.unsubscribed)}</span>
          </div>
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Spam</span>
            <span className="text-lg font-semibold text-foreground tabular-nums">{formatNumber(metrics.spamComplaints)}</span>
          </div>
          <div className="flex flex-col p-3 bg-background border border-border rounded-lg">
            <span className="text-xs text-muted-foreground">Segment</span>
            <span className="text-sm font-medium text-foreground truncate" title={mailout.segmentName}>
              {mailout.segmentName || '—'}
            </span>
          </div>
        </div>

        {/* Two-column layout for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement metrics */}
          <div className="p-5 bg-background border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-4">Engagement Breakdown</h3>
            <div className="flex flex-col gap-4">
              <EngagementBar
                label="Delivered"
                value={metrics.delivered}
                total={metrics.sent}
                description="of recipients received the email"
              />
              <EngagementBar
                label="Opened"
                value={metrics.opened}
                total={metrics.delivered}
                description="of delivered emails were opened"
              />
              <EngagementBar
                label="Clicked"
                value={metrics.clicked}
                total={metrics.delivered}
                description="of delivered emails had a link clicked"
              />
              <EngagementBar
                label="Unsubscribed"
                value={metrics.unsubscribed}
                total={metrics.delivered}
                description="of delivered emails resulted in an unsubscribe"
              />
            </div>
          </div>

          {/* Device breakdown */}
          <div className="p-5 bg-background border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-4">Opens by Device</h3>
            <DeviceBreakdown
              desktop={mailout.deviceBreakdown.desktop}
              mobile={mailout.deviceBreakdown.mobile}
            />
          </div>
        </div>

        {/* Activity chart */}
        {mailout.hourlyActivity.length > 0 && (
          <div className="p-5 bg-background border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-4">Activity (First 24 Hours)</h3>
            <ActivityChart data={mailout.hourlyActivity} />
          </div>
        )}

        {/* Links performance */}
        <div className="p-5 bg-background border border-border rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-4">Link Performance</h3>
          <LinksTable links={mailout.links} />
        </div>
      </div>
    </PageShell>
  );
}
