import type { PermissionGroup } from '../../models/permissions';
import styles from './GroupSidebar.module.css';

interface GroupSidebarProps {
  groups: PermissionGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onCreateClick: () => void;
}

export function GroupSidebar({ groups, selectedGroupId, onSelectGroup, onCreateClick }: GroupSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <button className={styles.createButton} onClick={onCreateClick}>
        + Create
      </button>
      <ul className={styles.list}>
        {groups.map((group) => (
          <li
            key={group.id}
            className={`${styles.item} ${group.id === selectedGroupId ? styles.itemSelected : ''}`}
            onClick={() => onSelectGroup(group.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectGroup(group.id);
              }
            }}
          >
            <span className={styles.groupName}>{group.name}</span>
            <span className={styles.groupDescription}>{group.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
