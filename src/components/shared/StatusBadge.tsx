import type { AutomationStatus } from '../../models/automation';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: AutomationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium leading-tight whitespace-nowrap transition-colors duration-200',
        status === 'active' && 'bg-success-subtle text-accent-foreground',
        status === 'paused' && 'bg-secondary text-muted-foreground',
        className,
      )}
    >
      {status === 'active' ? 'Active' : 'Paused'}
    </span>
  );
}
