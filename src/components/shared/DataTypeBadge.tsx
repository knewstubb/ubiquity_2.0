import type { ExportDataType } from '../../models/connector';
import styles from './DataTypeBadge.module.css';

interface DataTypeBadgeProps {
  dataType: ExportDataType;
  className?: string;
}

const LABELS: Record<ExportDataType, string> = {
  contact: 'Contact',
  transactional: 'Transactional',
  transactional_with_contact: 'Enriched',
};

export function DataTypeBadge({ dataType, className = '' }: DataTypeBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[dataType]} ${className}`}>
      {LABELS[dataType]}
    </span>
  );
}
