import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

/**
 * Super admin emails that can access the component highlighter.
 * Must match the SUPER_ADMIN_EMAILS list in FeatureFlagContext/PlatformAdminContext.
 */
const SUPER_ADMIN_EMAILS = ['knewstubb@gmail.com', 'local@ubiquity.dev'];

export interface HighlighterContextValue {
  /** Whether the highlighter overlay is currently active */
  isActive: boolean;
  /** Toggle the highlighter on/off */
  toggle: () => void;
  /** Whether the current user has access to the highlighter */
  hasAccess: boolean;
}

const HighlighterContext = createContext<HighlighterContextValue | undefined>(undefined);

export function HighlighterProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const { user } = useAuth();

  // Only super admins can access the highlighter
  const hasAccess = useMemo(() => {
    if (!user?.email) return false;
    return SUPER_ADMIN_EMAILS.some(
      (e) => e.toLowerCase() === user.email.toLowerCase()
    );
  }, [user?.email]);

  const toggle = useCallback(() => {
    if (!hasAccess) return;
    setIsActive((prev) => !prev);
  }, [hasAccess]);

  // Sync state to HTML attribute for CSS activation
  useEffect(() => {
    if (isActive) {
      document.documentElement.dataset.highlighter = 'on';
    } else {
      delete document.documentElement.dataset.highlighter;
    }
  }, [isActive]);

  // Keyboard shortcut: Ctrl+Shift+L
  useEffect(() => {
    if (!hasAccess) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        setIsActive((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAccess]);

  const value = useMemo<HighlighterContextValue>(
    () => ({ isActive, toggle, hasAccess }),
    [isActive, toggle, hasAccess]
  );

  return (
    <HighlighterContext.Provider value={value}>
      {children}
    </HighlighterContext.Provider>
  );
}

export function useHighlighter(): HighlighterContextValue {
  const context = useContext(HighlighterContext);
  if (!context) {
    throw new Error('useHighlighter must be used within a HighlighterProvider');
  }
  return context;
}
