import { useNavigate } from 'react-router-dom';
import { 
  DownloadSimple, 
  ChartLineUp, 
  PaperPlaneTilt,
  ArrowRight,
} from '@phosphor-icons/react';
import { useAccount } from '../contexts/AccountContext';
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

/**
 * Landing Dashboard — minimal navigation hub
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { selectedAccountId, accounts } = useAccount();
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountName = selectedAccount?.name || 'your workspace';

  return (
    <div className="w-full max-w-[960px] mx-auto min-h-[calc(100vh-85px)] py-12 px-6">
      {/* Greeting */}
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-foreground">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to {accountName}
        </p>
      </div>

      {/* Navigation sections */}
      <div className="grid grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="flex flex-col"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
                  <Icon size={18} weight="bold" className="text-muted-foreground" />
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
