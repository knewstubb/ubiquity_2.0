import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface WelcomeHeaderProps {
  accountName: string;
  /** Optional: show onboarding CTA for new/empty accounts */
  showOnboardingCta?: boolean;
  className?: string;
}

/** Returns a time-aware greeting based on local hour */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * WelcomeHeader — warm, contextual greeting for the landing dashboard.
 * 
 * Shows a time-aware greeting with the account name and optional onboarding CTA.
 * Uses a subtle teal gradient accent to bring brand personality.
 */
export function WelcomeHeader({ accountName, showOnboardingCta = false, className }: WelcomeHeaderProps) {
  const greeting = getGreeting();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-br from-primary/5 via-primary/10 to-transparent',
        'border border-primary/20',
        'px-6 py-5',
        className
      )}
    >
      {/* Subtle decorative accent */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -right-4 bottom-0 h-20 w-20 rounded-full bg-primary/5 blur-xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}
          </h1>
          <p className="text-base text-muted-foreground">
            Welcome to <span className="font-medium text-foreground">{accountName}</span>
          </p>
        </div>

        {showOnboardingCta && (
          <Link
            to="/audiences/connectors"
            className={cn(
              'group flex items-center gap-2',
              'rounded-lg bg-primary px-4 py-2.5',
              'text-sm font-semibold text-primary-foreground',
              'shadow-sm shadow-primary/25',
              'transition-all duration-200',
              'hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30',
              'active:scale-[0.98]'
            )}
          >
            <Sparkle weight="fill" className="h-4 w-4" />
            <span>Get started</span>
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
