import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FeedbackProvider } from '../contexts/FeedbackContext';
import { ChangelogProvider } from '../contexts/ChangelogContext';
import { initActivityLog, stopActivityLog, trackPageView } from '../lib/activity-log';

function ActivityLogTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

function ActiveCollaboration({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Initialize activity log on mount, stop on unmount
  useEffect(() => {
    if (user) {
      initActivityLog(user.id);
    }
    return () => {
      stopActivityLog();
    };
  }, [user]);

  return (
    <FeedbackProvider>
      <ChangelogProvider>
        <ActivityLogTracker />
        {children}
      </ChangelogProvider>
    </FeedbackProvider>
  );
}

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // In local-only mode or when not authenticated, provide no-op implementations
  if (!isSupabaseConfigured() || !user) {
    return (
      <FeedbackProvider>
        <ChangelogProvider>
          {children}
        </ChangelogProvider>
      </FeedbackProvider>
    );
  }

  return <ActiveCollaboration>{children}</ActiveCollaboration>;
}
