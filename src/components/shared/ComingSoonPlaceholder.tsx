import { Link } from 'react-router-dom';
import styles from './ComingSoonPlaceholder.module.css';

export function ComingSoonPlaceholder() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Coming Soon</h1>
        <p className={styles.message}>This feature is not yet available</p>
        <Link to="/dashboard" className={styles.link}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
