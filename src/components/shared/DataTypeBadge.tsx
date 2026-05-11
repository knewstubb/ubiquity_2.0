import type { ExportDataType } from '../../models/automation';
import { cn } from '../../lib/utils';

interface DataTypeBadgeProps {
  dataType: ExportDataType;
  className?: string;
}

const LABELS: Record<ExportDataType, string> = {
  contact: 'Contact',
  transactional: 'Transactional',
  transactional_with_contact: 'Enriched',
};

export function DataTypeBadge({ dataType, className }: DataTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium leading-tight whitespace-nowrap transition-colors duration-200',
        dataType === 'contact' && 'bg-info-subtle text-info',
        dataType === 'transactional' && 'bg-warning-subtle text-warning',
        dataType === 'transactional_with_contact' && 'bg-accent text-accent-foreground',
        className,
      )}
    >
      {LABELS[dataType]}
    </span>
  );
}
