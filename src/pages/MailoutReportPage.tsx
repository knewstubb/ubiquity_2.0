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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/molecules/breadcrumb';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { MetricCard } from '@/components/organisms/metric-card';
import { StatBar } from '@/components/organisms/stat-bar';
import { DonutChart } from '@/components/organisms/donut-chart';
import { mailouts } from '../data/mailouts';
import type { Mailout } from '../models/mailout';

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

// Line chart for hourly activity (Opens + Clicks)
function MailoutActivityChart({ data }: { data: { hour: number; opens: number; clicks: number }[] }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.opens));
  const chartHeight = 140;
  
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
          {/* Data points - rendered as absolutely positioned divs to avoid SVG stretching */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const yOpens = 100 - (d.opens / yMax) * 100;
            const yClicks = 100 - (d.clicks / yMax) * 100;
            return (
              <div key={d.hour}>
                <div 
                  className="absolute w-2 h-2 rounded-full bg-primary -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${yOpens}%` }}
                  title={`${d.hour}h: ${formatNumberFull(d.opens)} opens`}
                />
                <div 
                  className="absolute w-2 h-2 rounded-full bg-teal-700 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${yClicks}%` }}
                  title={`${d.hour}h: ${formatNumberFull(d.clicks)} clicks`}
                />
              </div>
            );
          })}
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
          {linkPositions.map((link) => {
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

  // Stats for the StatBar component
  const statBarItems = [
    { label: 'Total Messages', value: formatNumberFull(metrics.sent) },
    { label: 'Total Delivered', value: formatNumberFull(metrics.delivered) },
    { label: 'Total Unread', value: formatNumberFull(unreadCount) },
    { label: 'Total Read', value: formatNumberFull(metrics.opened) },
    { label: 'Unique Clicks', value: formatNumberFull(uniqueClicks) },
    { label: 'Hard Bounced', value: formatNumberFull(metrics.hardBounced) },
    { label: 'Soft Bounced', value: formatNumberFull(metrics.softBounced) },
    { label: 'Opted Out', value: formatNumberFull(metrics.optedOut) },
    { label: 'Marked as Spam', value: formatNumberFull(metrics.spamComplaints) },
  ];

  // Engagement segments for DonutChart
  const engagementSegments = [
    { value: readAndClicked, color: '#0D9488', label: 'Read and clicked' },
    { value: readOnly, color: '#14B88A', label: 'Read only' },
    { value: unreadCount, color: '#A1A1AA', label: 'Unread' },
    { value: metrics.bounced, color: '#EF4444', label: 'Bounced' },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] py-7 px-6 bg-background">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/automations/campaigns">Campaigns</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/channels/mailouts">Mailouts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-foreground m-0">Mailout Report</h1>
          <p className="text-sm text-tertiary-foreground mt-1 mb-0 font-normal">
            {mailout.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/channels/mailouts')}>
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Mailouts
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Header metadata block */}
        <Card>
          <CardContent className="p-4">
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
          </CardContent>
        </Card>

        {/* 6 Primary metric cards row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Delivered"
            value={deliveredPercent}
            icon={<PaperPlaneTilt size={24} />}
            layout="centered"
            variant="success"
          />
          <MetricCard
            label="Read"
            value={readPercent}
            icon={<EnvelopeOpen size={24} />}
            layout="centered"
            variant="success"
          />
          <MetricCard
            label="Unread"
            value={unreadPercent}
            icon={<EnvelopeSimple size={24} />}
            layout="centered"
            variant="muted"
          />
          <MetricCard
            label="Bounced"
            value={bouncedPercent}
            icon={<XCircle size={24} />}
            layout="centered"
            variant="warning"
          />
          <MetricCard
            label="Click Thru"
            value={clickThroughPercent}
            icon={<CursorClick size={24} />}
            layout="centered"
            variant="success"
          />
          <MetricCard
            label="Click to Open"
            value={clickToOpenPercent}
            icon={<ChartPieSlice size={24} />}
            layout="centered"
            variant="success"
          />
        </div>

        {/* Secondary stats row */}
        <StatBar items={statBarItems} />

        {/* Two-column: Engagement donut + Mailout Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                segments={engagementSegments}
                centerLabel={{ value: formatNumber(metrics.sent), label: 'Total' }}
                formatValue={formatNumberFull}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Mailout Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <MailoutActivityChart data={mailout.hourlyActivity} />
            </CardContent>
          </Card>
        </div>

        {/* Two-column: Links table + Link Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Links</CardTitle>
            </CardHeader>
            <CardContent>
              <LinksTable links={mailout.links} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Fire size={16} className="text-orange-500" />
                Link Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LinkHeatmap links={mailout.links} />
            </CardContent>
          </Card>
        </div>

        {/* Device breakdown (additional context) */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Opens by Device</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceBreakdown
              desktop={mailout.deviceBreakdown.desktop}
              mobile={mailout.deviceBreakdown.mobile}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
