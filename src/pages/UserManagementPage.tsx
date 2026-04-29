import { PageShell } from '../components/layout/PageShell';
import styles from './UserManagementPage.module.css';

export default function UserManagementPage() {
  return (
    <PageShell title="User Management" subtitle="Cross-organisation user management">
      <div className={styles.emptyState}>
        <p className={styles.emptyMessage}>
          Cross-organisation user management coming soon.
        </p>
      </div>
    </PageShell>
  );
}
