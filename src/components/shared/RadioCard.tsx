import type { ReactNode } from 'react';
import styles from './RadioCard.module.css';

interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

export function RadioCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  disabled = false,
  name,
  value,
  className = '',
}: RadioCardProps) {
  return (
    <label
      className={`${styles.card} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''} ${className}`}
    >
      <input
        type="radio"
        className={styles.input}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        name={name}
        value={value}
      />
      <div className={styles.content}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <div className={styles.text}>
          <span className={styles.title}>{title}</span>
          {description && <span className={styles.description}>{description}</span>}
        </div>
      </div>
      <span className={`${styles.radio} ${selected ? styles.radioSelected : ''}`} />
    </label>
  );
}
