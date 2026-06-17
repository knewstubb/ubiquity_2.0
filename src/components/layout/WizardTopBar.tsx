import { useNavigate } from 'react-router-dom';
import { AccountSwitcher } from './AccountSwitcher';

/**
 * Locked top bar for full-page wizard routes.
 * Shows logo + account switcher. Navigation items are hidden — the user is in a focused task.
 */
export function WizardTopBar() {
  const navigate = useNavigate();

  return (
    <nav className="shrink-0 bg-background border-b border-border h-14" aria-label="Wizard navigation">
      <div className="flex items-center pl-6 pr-4 h-full">
        {/* Logo — teal rounded square with white U */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg border-none cursor-pointer shrink-0 transition-opacity duration-150 hover:opacity-90"
          onClick={() => navigate('/dashboard')}
          aria-label="UbiQuity home"
        >
          <span className="font-sans text-lg font-bold leading-none text-primary-foreground">U</span>
        </button>

        <div className="w-px h-5 bg-border shrink-0 mx-3" aria-hidden="true" />

        {/* Account Selector */}
        <AccountSwitcher />
      </div>
    </nav>
  );
}
