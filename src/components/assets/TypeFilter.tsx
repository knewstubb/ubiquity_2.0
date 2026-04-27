import styles from './TypeFilter.module.css';

interface TypeFilterProps {
  types: string[];
  selectedTypes: string[];
  onToggle: (type: string) => void;
}

export function TypeFilter({ types, selectedTypes, onToggle }: TypeFilterProps) {
  return (
    <div className={styles.row} role="group" aria-label="Filter by asset type">
      {types.map((type) => {
        const isActive = selectedTypes.includes(type);
        return (
          <button
            key={type}
            className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
            onClick={() => onToggle(type)}
            aria-pressed={isActive}
            type="button"
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
