import styles from './TagFilter.module.css';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export function TagFilter({ tags, selectedTags, onToggle }: TagFilterProps) {
  return (
    <div className={styles.row} role="group" aria-label="Filter by type">
      {tags.map((tag) => {
        const isActive = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
            onClick={() => onToggle(tag)}
            aria-pressed={isActive}
            type="button"
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
