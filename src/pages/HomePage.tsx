import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DownloadSimple, 
  ChartLineUp, 
  PaperPlaneTilt,
  ArrowRight,
} from '@phosphor-icons/react';
import { useAccount } from '../contexts/AccountContext';
import { contacts } from '../data/contacts';
import { mailouts } from '../data/mailouts';
import { cn } from '../lib/utils';

/** Navigation sections */
const sections = [
  {
    title: 'Acquire',
    description: 'Get data in',
    icon: DownloadSimple,
    links: [
      { label: 'Connectors', path: '/audiences/connectors' },
      { label: 'Databases', path: '/audiences/databases' },
      { label: 'Forms & Surveys', path: '/content/forms' },
    ],
  },
  {
    title: 'Analyse',
    description: 'Make sense of it',
    icon: ChartLineUp,
    links: [
      { label: 'Segments', path: '/audiences/segments' },
      { label: 'Reports', path: '/analytics/reports' },
      { label: 'Dashboards', path: '/analytics/dashboards' },
    ],
  },
  {
    title: 'Act',
    description: 'Do something with it',
    icon: PaperPlaneTilt,
    links: [
      { label: 'Mailouts', path: '/channels/mailouts' },
      { label: 'Campaigns', path: '/automations/campaigns' },
      { label: 'Journeys', path: '/automations/journeys' },
    ],
  },
];

/** Returns a time-aware greeting based on local hour */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Calculate metrics from mailout data */
function calculateMetrics(accountMailouts: typeof mailouts) {
  const sentMailouts = accountMailouts.filter(m => m.status === 'sent');
  
  const totals = sentMailouts.reduce(
    (acc, m) => ({
      sent: acc.sent + m.metrics.sent,
      delivered: acc.delivered + m.metrics.delivered,
      opened: acc.opened + m.metrics.opened,
      clicked: acc.clicked + m.metrics.clicked,
    }),
    { sent: 0, delivered: 0, opened: 0, clicked: 0 }
  );

  const openRate = totals.delivered > 0 ? (totals.opened / totals.delivered) * 100 : 0;
  const clickRate = totals.delivered > 0 ? (totals.clicked / totals.delivered) * 100 : 0;

  return {
    sent: totals.sent,
    openRate,
    clickRate,
  };
}

/** Generate sends per day for the past 30 days */
function getSendsPerDay(_accountMailouts: typeof mailouts): { date: string; sends: number }[] {
  const now = new Date();
  const days: { date: string; sends: number }[] = [];
  
  // Generate realistic daily send data with variation
  // Base: ~2000-5000 sends per day with weekend dips and occasional spikes
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    
    // Base sends: 2500-4000, lower on weekends
    let baseSends = 2500 + Math.random() * 1500;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseSends *= 0.4; // Weekend drop
    }
    
    // Occasional campaign spikes (about 20% of days)
    if (Math.random() > 0.8) {
      baseSends += 3000 + Math.random() * 5000;
    }
    
    // Add some noise
    baseSends *= 0.85 + Math.random() * 0.3;
    
    days.push({
      date: dateStr,
      sends: Math.round(baseSends),
    });
  }

  return days;
}

/** Simple SVG line chart component with hoverable data points */
function SendsLineChart({ data }: { data: { date: string; sends: number }[] }) {
  const width = 800;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxSends = Math.max(...data.map(d => d.sends), 1);
  
  // Generate path
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.sends / maxSends) * chartHeight;
    return { x, y, ...d };
  });
  
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  
  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
  
  // Y-axis labels
  const yLabels = [0, Math.round(maxSends / 2), maxSends];
  
  // X-axis labels (show first, middle, last dates)
  const xLabels = [
    { index: 0, label: formatShortDate(data[0].date) },
    { index: Math.floor(data.length / 2), label: formatShortDate(data[Math.floor(data.length / 2)].date) },
    { index: data.length - 1, label: formatShortDate(data[data.length - 1].date) },
  ];

  // Primary teal colour
  const primaryColor = '#14B88A';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <style>{`
        .chart-point {
          transition: r 150ms ease-out;
          cursor: pointer;
        }
        .chart-point:hover {
          r: 6;
        }
        .chart-tooltip {
          opacity: 0;
          transition: opacity 150ms ease-out;
          pointer-events: none;
        }
        .chart-point:hover + .chart-tooltip {
          opacity: 1;
        }
      `}</style>
      
      {/* Gradient definition for area fill */}
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {yLabels.map((val, i) => {
        const y = padding.top + chartHeight - (val / maxSends) * chartHeight;
        return (
          <line
            key={i}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeDasharray="4 4"
          />
        );
      })}
      
      {/* Area fill */}
      <path d={areaD} fill="url(#areaGradient)" />
      
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={primaryColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data points with hover tooltips */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            className="chart-point"
            cx={p.x}
            cy={p.y}
            r={p.sends > 0 ? 3 : 0}
            fill={primaryColor}
          />
          {/* Tooltip background */}
          <g className="chart-tooltip">
            <rect
              x={p.x - 35}
              y={p.y - 32}
              width={70}
              height={24}
              rx={4}
              fill="#18181B"
            />
            <text
              x={p.x}
              y={p.y - 16}
              textAnchor="middle"
              fill="white"
              className="text-[10px] font-medium"
            >
              {p.sends.toLocaleString()} sent
            </text>
          </g>
        </g>
      ))}
      
      {/* Y-axis labels */}
      {yLabels.map((val, i) => {
        const y = padding.top + chartHeight - (val / maxSends) * chartHeight;
        return (
          <text
            key={i}
            x={padding.left - 8}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
          </text>
        );
      })}
      
      {/* X-axis labels */}
      {xLabels.map(({ index, label }) => (
        <text
          key={index}
          x={points[index].x}
          y={height - 8}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

/** Format date as "Aug 13" */
function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

/** Generate sparkline data (7 data points for last 7 periods) */
function generateSparklineData(trend: 'up' | 'down' | 'stable', base: number): number[] {
  const data: number[] = [];
  let value = base * (0.85 + Math.random() * 0.1);
  
  for (let i = 0; i < 7; i++) {
    data.push(value);
    if (trend === 'up') {
      value *= 1.02 + Math.random() * 0.06;
    } else if (trend === 'down') {
      value *= 0.94 + Math.random() * 0.04;
    } else {
      value *= 0.97 + Math.random() * 0.06;
    }
  }
  
  return data;
}

/** Mini sparkline component */
function Sparkline({ data }: { data: number[] }) {
  const width = 60;
  const height = 24;
  const padding = 2;
  const primaryColor = '#14B88A';
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return { x, y };
  });
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <svg width={width} height={height} className="shrink-0">
      <path
        d={pathD}
        fill="none"
        stroke={primaryColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Primary teal colour */
const primaryColor = '#14B88A';

/**
 * Landing Dashboard — clean overview with key metrics and navigation
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { selectedAccountId, accounts } = useAccount();
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountName = selectedAccount?.name || 'your workspace';

  // Filter data by selected account
  const accountContacts = contacts.filter((c) => c.accountId === selectedAccountId);
  const accountMailouts = mailouts.filter((m) => m.accountId === selectedAccountId);
  const metrics = calculateMetrics(accountMailouts);
  const sendsPerDay = useMemo(() => getSendsPerDay(accountMailouts), [accountMailouts]);
  
  // Generate sparkline data for each metric
  const sparklines = useMemo(() => ({
    contacts: generateSparklineData('up', accountContacts.length),
    sent: generateSparklineData('up', metrics.sent),
    openRate: generateSparklineData('stable', metrics.openRate),
    clickRate: generateSparklineData('up', metrics.clickRate),
  }), [accountContacts.length, metrics.sent, metrics.openRate, metrics.clickRate]);

  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-[calc(100vh-85px)] py-10 px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-foreground">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to {accountName}
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Contacts</p>
            <Sparkline data={sparklines.contacts} />
          </div>
          <p className="text-2xl font-semibold text-primary">
            {accountContacts.length.toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Emails Sent</p>
            <Sparkline data={sparklines.sent} />
          </div>
          <p className="text-2xl font-semibold text-primary">
            {metrics.sent.toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Open Rate</p>
            <Sparkline data={sparklines.openRate} />
          </div>
          <p className="text-2xl font-semibold text-primary">
            {metrics.openRate.toFixed(1)}%
          </p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Click Rate</p>
            <Sparkline data={sparklines.clickRate} />
          </div>
          <p className="text-2xl font-semibold text-primary">
            {metrics.clickRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Sends chart */}
      <div className="p-5 rounded-xl border border-border bg-background mb-10">
        <p className="text-sm text-muted-foreground mb-4">Sends — Last 30 Days</p>
        <SendsLineChart data={sendsPerDay} />
      </div>

      {/* Navigation sections */}
      <div className="grid grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="p-5 rounded-xl border border-border bg-background"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                  <Icon size={18} weight="bold" className="text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-1">
                {section.links.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className={cn(
                      'group flex items-center justify-between w-full px-3 py-2.5 rounded-lg',
                      'text-sm text-foreground text-left',
                      'transition-colors hover:bg-muted'
                    )}
                  >
                    <span>{link.label}</span>
                    <ArrowRight 
                      size={14} 
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
