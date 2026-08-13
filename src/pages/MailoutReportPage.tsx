import { useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  PaperPlaneTilt,
  EnvelopeOpen,
  EnvelopeSimple,
  XCircle,
  CursorClick,
  ChartPieSlice,
  Link as LinkIcon,
  Fire,
  Desktop,
  DeviceMobile,
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
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toLocaleString('en-NZ');
}

function formatNumberFull(num: number): string {
  return num.toLocaleString('en-NZ');
}

function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(2)}%`;
}

// Primary metric card matching Figma design (6 cards row)
function MetricCard({
  label,
  value,
  icon,
  variant = 'default',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'muted';
}) {
  const iconColorClass = {
    default: 'text-primary',
    success: 'text-primary',
    warning: 'text-amber-500',
    muted: 'text-muted-foreground',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 bg-background border border-border rounded-lg min-w-[120px]">
      <div className={cn('flex items-center justify-center', iconColorClass[variant])}>
        {icon}
      </div>
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-xs font-medium text-muted-foreground text-center">{label}</span>
    </div>
  );
}

// Secondary stat item for the stats row
function SecondaryStatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2">
      <span className="text-lg font-semibold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
    </div>
  );
}

// Engagement donut chart
function EngagementDonut({
  readAndClicked,
  readOnly,
  unread,
  bounced,
  total,
}: {
  readAndClicked: number;
  readOnly: number;
  unread: number;
  bounced: number;
  total: number;
}) {
  // Calculate percentages for the donut segments
  const segments = [
    { value: readAndClicked, color: '#0D9488', label: 'Read and clicked' }, // teal-600
    { value: readOnly, color: '#14B88A', label: 'Read only' }, // primary
    { value: unread, color: '#A1A1AA', label: 'Unread' }, // zinc-400
    { value: bounced, color: '#EF4444', label: 'Bounced' }, // red-500
  ];

  // Build stroke-dasharray for each segment
  const circumference = 2 * Math.PI * 40; // radius = 40
  let cumulativeOffset = 0;

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {segments.map((segment, index) => {
            const percent = total > 0 ? (segment.value / total) * 100 : 0;
            const strokeLength = (percent / 100) * circumference;
            const offset = cumulativeOffset;
            cumulativeOffset += strokeLength;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{formatNumber(total)}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="text-sm text-foreground">{segment.label}</span>
            <span className="text-sm font-semibold text-foreground tabular-nums ml-auto">
              {formatNumberFull(segment.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Line chart for hourly activity (Opens + Clicks)
function MailoutActivityChart({ data }: { data: { hour: number; opens: number; clicks: number }[] }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.opens));
  const chartHeight = 140;
  const chartWidth = 100; // percentage-based
  
  // Generate nice y-axis ticks
  const yTicks = generateYAxisTicks(maxValue);
  const yMax = yTicks[yTicks.length - 1];

  // Build SVG path for opens line
  const opensPath = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.opens / yMax) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Build SVG path for clicks line
  const clicksPath = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.clicks / yMax) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-primary rounded-full" />
          <span>Opens</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-teal-700 rounded-full" />
          <span>Clicks</span>
        </div>
      </div>
      <div className="flex">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 text-[10px] text-muted-foreground tabular-nums" style={{ height: `${chartHeight}px` }}>
          {[...yTicks].reverse().map((tick) => (
            <span key={tick} className="leading-none">{formatNumber(tick)}</span>
          ))}
        </div>
        {/* Chart area */}
        <div className="flex-1 relative" style={{ height: `${chartHeight}px` }}>
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {yTicks.map((tick) => {
              const y = 100 - (tick / yMax) * 100;
              return (
                <line
                  key={tick}
                  x1="0%"
                  y1={`${y}%`}
                  x2="100%"
                  y2={`${y}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border"
                />
              );
            })}
          </svg>
          {/* Line chart */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Opens line */}
            <path
              d={opensPath}
              fill="none"
              stroke="#14B88A"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-300"
            />
            {/* Clicks line */}
            <path
              d={clicksPath}
              fill="none"
              stroke="#0D9488"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-300"
            />
          </svg>
          {/* Data points */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const yOpens = 100 - (d.opens / yMax) * 100;
              const yClicks = 100 - (d.clicks / yMax) * 100;
              return (
                <g key={d.hour}>
                  <circle cx={x} cy={yOpens} r="1.5" fill="#14B88A" vectorEffect="non-scaling-stroke" />
                  <circle cx={x} cy={yClicks} r="1.5" fill="#0D9488" vectorEffect="non-scaling-stroke" />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex pl-8">
        {data.map((d, i) => (
          <span 
            key={d.hour} 
            className="flex-1 text-[10px] text-muted-foreground tabular-nums text-center"
            style={{ marginLeft: i === 0 ? '-0.5em' : 0, marginRight: i === data.length - 1 ? '-0.5em' : 0 }}
          >
            {d.hour}h
          </span>
        ))}
      </div>
    </div>
  );
}

// Generate nice y-axis tick values
function generateYAxisTicks(maxValue: number): number[] {
  if (maxValue === 0) return [0];
  
  // Find a nice step size
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  let step = magnitude;
  
  if (maxValue / step < 3) step = magnitude / 2;
  if (maxValue / step > 6) step = magnitude * 2;
  
  const ticks: number[] = [];
  for (let i = 0; i <= maxValue; i += step) {
    ticks.push(i);
  }
  // Ensure we have a tick above the max value
  if (ticks[ticks.length - 1] < maxValue) {
    ticks.push(ticks[ticks.length - 1] + step);
  }
  
  return ticks;
}

// Links table matching Figma design
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
            <th className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Link Name
            </th>
            <th className="py-2.5 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Unique
            </th>
            <th className="py-2.5 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <LinkIcon size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{link.label}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-foreground tabular-nums text-right">
                {formatNumberFull(link.uniqueClicks)}
              </td>
              <td className="py-3 px-4 text-sm text-foreground tabular-nums text-right">
                {formatNumberFull(link.totalClicks)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Link Heatmap placeholder (email preview with engagement overlay)
function LinkHeatmap({ links }: { links: Mailout['links'] }) {
  // Calculate max clicks for color intensity
  const maxClicks = Math.max(...links.map(l => l.totalClicks), 1);
  
  // Generate mock positions for links in the email preview
  // In a real implementation, these would be stored with the email template
  const linkPositions = links.slice(0, 5).map((link, index) => ({
    ...link,
    top: 15 + (index * 18), // Percentage from top
    intensity: link.totalClicks / maxClicks,
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* Email preview container */}
      <div className="relative bg-white border border-border rounded-lg overflow-hidden" style={{ minHeight: '320px' }}>
        {/* Mock email header */}
        <div className="bg-zinc-100 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <EnvelopeSimple size={16} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Email Preview</span>
              <span className="text-[10px] text-muted-foreground">Link engagement heatmap</span>
            </div>
          </div>
        </div>
        
        {/* Mock email body with heatmap overlay */}
        <div className="relative p-4">
          {/* Placeholder content blocks */}
          <div className="space-y-3">
            <div className="h-6 bg-zinc-100 rounded w-3/4" />
            <div className="h-4 bg-zinc-50 rounded w-full" />
            <div className="h-4 bg-zinc-50 rounded w-5/6" />
            <div className="h-32 bg-zinc-100 rounded" /> {/* Image placeholder */}
            <div className="h-4 bg-zinc-50 rounded w-full" />
            <div className="h-4 bg-zinc-50 rounded w-4/5" />
          </div>
          
          {/* Heatmap overlay for links */}
          {linkPositions.map((link, index) => {
            // Color intensity based on clicks (red = hot, yellow = warm)
            const hue = 0 + (1 - link.intensity) * 60; // 0 (red) to 60 (yellow)
            const saturation = 80 + link.intensity * 20;
            const lightness = 50 - link.intensity * 10;
            const bgColor = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 + link.intensity * 0.4})`;
            
            return (
              <div
                key={link.id}
                className="absolute left-4 right-4 rounded-md flex items-center justify-between px-3 py-1.5 border border-white/50"
                style={{
                  top: `${link.top}%`,
                  backgroundColor: bgColor,
                  boxShadow: `0 0 ${8 + link.intensity * 12}px ${bgColor}`,
                }}
                title={`${link.label}: ${formatNumberFull(link.totalClicks)} clicks`}
              >
                <span className="text-xs font-medium text-white drop-shadow-sm truncate">
                  {link.label}
                </span>
                <span className="text-xs font-bold text-white drop-shadow-sm tabular-nums">
                  {formatNumberFull(link.totalClicks)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Heatmap legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex h-2 rounded overflow-hidden">
          <div className="w-6 bg-yellow-400" />
          <div className="w-6 bg-orange-400" />
          <div className="w-6 bg-orange-500" />
          <div className="w-6 bg-red-500" />
          <div className="w-6 bg-red-600" />
        </div>
        <span>High</span>
      </div>
    </div>
  );
}

// Device breakdown (compact version for deliverability section)
function DeviceBreakdown({ desktop, mobile }: { desktop: number; mobile: number }) {
  const total = desktop + mobile;
  const desktopPercent = total > 0 ? (desktop / total) * 100 : 50;
  const mobilePercent = total > 0 ? (mobile / total) * 100 : 50;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${desktopPercent} ${100 - desktopPercent}`}
            className="text-primary"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Desktop size={14} className="text-primary" />
          <span className="text-sm text-foreground">Desktop</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{desktopPercent.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <DeviceMobile size={14} className="text-muted-foreground" />
          <span className="text-sm text-foreground">Mobile</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{mobilePercent.toFixed(0)}%</span>
        </div>
      </div>
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

  // Calculate derived metrics matching Figma design
  const deliveredPercent = formatPercent(metrics.delivered, metrics.sent);
  const readPercent = formatPercent(metrics.opened, metrics.delivered);
  const unreadCount = metrics.delivered - metrics.opened;
  const unreadPercent = formatPercent(unreadCount, metrics.delivered);
  const bouncedPercent = formatPercent(metrics.bounced, metrics.sent);
  const clickThroughPercent = formatPercent(metrics.clicked, metrics.delivered);
  const clickToOpenPercent = formatPercent(metrics.clicked, metrics.opened);

  // Engagement breakdown for donut
  const readAndClicked = metrics.clicked;
  const readOnly = metrics.opened - metrics.clicked;

  // Total unique clicks from links
  const uniqueClicks = mailout.links.reduce((sum, link) => sum + link.uniqueClicks, 0);

  return (
    <PageShell
      title="Mailout Report"
      subtitle={mailout.name}
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
        {/* Header metadata block */}
        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Send Date</span>
              <span className="text-sm text-foreground">{formatDate(mailout.sentAt)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</span>
              <span className="text-sm text-foreground">{mailout.subject}</span>
            </div>
            <div className="flex flex-col gap-1 lg:col-span-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pre-header Text</span>
              <span className="text-sm text-foreground">{mailout.preheaderText || '—'}</span>
            </div>
          </div>
        </div>

        {/* 6 Primary metric cards row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="Delivered"
            value={deliveredPercent}
            icon={<PaperPlaneTilt size={24} />}
            variant="success"
          />
          <MetricCard
            label="Read"
            value={readPercent}
            icon={<EnvelopeOpen size={24} />}
            variant="success"
          />
          <MetricCard
            label="Unread"
            value={unreadPercent}
            icon={<EnvelopeSimple size={24} />}
            variant="muted"
          />
          <MetricCard
            label="Bounced"
            value={bouncedPercent}
            icon={<XCircle size={24} />}
            variant="warning"
          />
          <MetricCard
            label="Click Thru"
            value={clickThroughPercent}
            icon={<CursorClick size={24} />}
            variant="success"
          />
          <MetricCard
            label="Click to Open"
            value={clickToOpenPercent}
            icon={<ChartPieSlice size={24} />}
            variant="success"
          />
        </div>

        {/* Secondary stats row */}
        <div className="flex items-center justify-between p-2 bg-background border border-border rounded-lg overflow-x-auto">
          <SecondaryStatItem label="Total Messages" value={formatNumberFull(metrics.sent)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Total Delivered" value={formatNumberFull(metrics.delivered)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Total Unread" value={formatNumberFull(unreadCount)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Total Read" value={formatNumberFull(metrics.opened)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Unique Clicks" value={formatNumberFull(uniqueClicks)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Hard Bounced" value={formatNumberFull(metrics.hardBounced)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Soft Bounced" value={formatNumberFull(metrics.softBounced)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Opted Out" value={formatNumberFull(metrics.optedOut)} />
          <div className="w-px h-8 bg-border" />
          <SecondaryStatItem label="Marked as Spam" value={formatNumberFull(metrics.spamComplaints)} />
        </div>

        {/* Two-column: Engagement donut + Mailout Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-background border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-4">Engagement</h3>
            <EngagementDonut
              readAndClicked={readAndClicked}
              readOnly={readOnly}
              unread={unreadCount}
              bounced={metrics.bounced}
              total={metrics.sent}
            />
          </div>

          <div className="p-5 bg-background border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-4">Mailout Activity</h3>
            <MailoutActivityChart data={mailout.hourlyActivity} />
          </div>
        </div>

        {/* Two-column: Links table + Link Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-background border border-border rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-4">Links</h3>
            <LinksTable links={mailout.links} />
          </div>

          <div className="p-5 bg-background border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Fire size={16} className="text-orange-500" />
              <h3 className="text-sm font-semibold text-foreground">Link Map</h3>
            </div>
            <LinkHeatmap links={mailout.links} />
          </div>
        </div>

        {/* Device breakdown (additional context) */}
        <div className="p-5 bg-background border border-border rounded-lg">
          <h3 className="text-sm font-semibold text-foreground mb-4">Opens by Device</h3>
          <DeviceBreakdown
            desktop={mailout.deviceBreakdown.desktop}
            mobile={mailout.deviceBreakdown.mobile}
          />
        </div>
      </div>
    </PageShell>
  );
}
