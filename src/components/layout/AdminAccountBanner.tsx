import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';

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
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 bg-info-subtle border border-info-border rounded text-sm text-info-foreground mx-5 mt-3"
      role="status"
      aria-label="Account selection required"
    >
      <span className="flex-1">
        Select a specific account to view this page
      </span>
      <button
        type="button"
        className="bg-transparent border border-info-border rounded px-3.5 py-1.5 text-[13px] font-semibold text-info-foreground cursor-pointer whitespace-nowrap hover:bg-[rgba(56,189,248,0.15)]"
        onClick={() => navigate('/dashboard')}
      >
        Select Account
      </button>
    </div>
  );
}
