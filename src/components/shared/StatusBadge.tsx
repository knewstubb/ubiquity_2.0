import type { ConnectorStatus } from '../../models/connector';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: ConnectorStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status]} ${className}`}>
      {status === 'active' ? 'Active' : 'Paused'}
    </span>
  );
}
