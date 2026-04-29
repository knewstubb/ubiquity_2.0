import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import styles from './AdminAccountBanner.module.css';

/**
 * Routes that support All Accounts Mode (cross-account aggregate views).
 * All other routes require a specific root account to be selected.
 */
const ALL_ACCOUNTS_SUPPORTED_ROUTES = [
  '/admin/billing',
  '/admin/activity',
  '/dashboard',
];

export function AdminAccountBanner() {
  const { isAllAccountsMode } = useAccount();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAllAccountsMode) return null;

  const routeSupportsAllAccounts = ALL_ACCOUNTS_SUPPORTED_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(route + '/'),
  );

  if (routeSupportsAllAccounts) return null;

  return (
    <div className={styles.banner} role="status" aria-label="Account selection required">
      <span className={styles.message}>
        Select a specific account to view this page
      </span>
      <button
        type="button"
        className={styles.selectBtn}
        onClick={() => navigate('/dashboard')}
      >
        Select Account
      </button>
    </div>
  );
}
