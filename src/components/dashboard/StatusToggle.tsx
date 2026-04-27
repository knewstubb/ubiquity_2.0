import { Toggle } from '../shared/Toggle';
import styles from './StatusToggle.module.css';

interface StatusToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function StatusToggle({ active, onToggle }: StatusToggleProps) {
  return (
    <div className={styles.wrapper}>
      <Toggle
        checked={active}
        onChange={onToggle}
        label={active ? 'Active' : 'Paused'}
      />
    </div>
  );
}
