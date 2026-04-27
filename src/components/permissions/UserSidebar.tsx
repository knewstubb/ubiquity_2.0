import type { PermissionUser } from '../../models/permissions';
import styles from './UserSidebar.module.css';

interface UserSidebarProps {
  users: PermissionUser[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
}

export function UserSidebar({ users, selectedUserId, onSelectUser }: UserSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <h2 className={styles.heading}>Users</h2>
      <ul className={styles.list}>
        {users.map((user) => (
          <li
            key={user.id}
            className={`${styles.item} ${user.id === selectedUserId ? styles.itemSelected : ''}`}
            onClick={() => onSelectUser(user.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectUser(user.id);
              }
            }}
          >
            <span className={styles.avatar}>{user.initials}</span>
            <span className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
