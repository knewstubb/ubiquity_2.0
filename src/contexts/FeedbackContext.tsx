import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isValidCommentBody } from '../lib/validation';
import { useAuth } from './AuthContext';

export interface FeedbackComment {
  id: string;
  pageRoute: string;
  userId: string;
  userDisplayName: string;
  body: string;
  createdAt: string;
}

export interface FeedbackContextValue {
  comments: FeedbackComment[];
  commentCountForPage: (route: string) => number;
  addComment: (body: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  isOpen: boolean;
  togglePanel: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

function mapRow(row: Record<string, unknown>): FeedbackComment {
  return {
    id: row.id as string,
    pageRoute: row.page_route as string,
    userId: row.user_id as string,
    userDisplayName: row.user_display_name as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  };
}

const NOOP_VALUE: FeedbackContextValue = {
  comments: [],
  commentCountForPage: () => 0,
  addComment: async () => {},
  deleteComment: async () => {},
  isOpen: false,
  togglePanel: () => {},
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const currentRoute = location.pathname;

  // Fetch comments for current route
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || !user) return;

    let cancelled = false;

    async function fetchComments() {
      const { data, error } = await supabase!
        .from('feedback_comments')
        .select('*')
        .eq('page_route', currentRoute)
        .order('created_at', { ascending: false });

      if (!cancelled && !error && data) {
        setComments(data.map(mapRow));
      }
      if (error) {
        console.warn('Failed to fetch feedback comments:', error.message);
      }
    }

    fetchComments();
    return () => { cancelled = true; };
  }, [currentRoute, user]);

  const commentCountForPage = useCallback(
    (route: string) => comments.filter((c) => c.pageRoute === route).length,
    [comments],
  );

  const addComment = useCallback(
    async (body: string) => {
      if (!isValidCommentBody(body)) {
        throw new Error('Comment cannot be empty');
      }
      if (!isSupabaseConfigured() || !supabase || !user) return;

      const { data, error } = await supabase
        .from('feedback_comments')
        .insert({
          page_route: currentRoute,
          user_id: user.id,
          user_display_name: user.displayName,
          body: body.trim(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }
      if (data) {
        setComments((prev) => [mapRow(data), ...prev]);
      }
    },
    [currentRoute, user],
  );

  const deleteComment = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured() || !supabase || !user) return;

      // Author-only delete: check locally first
      const comment = comments.find((c) => c.id === id);
      if (!comment || comment.userId !== user.id) return;

      const { error } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete comment: ${error.message}`);
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
    },
    [comments, user],
  );

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      comments,
      commentCountForPage,
      addComment,
      deleteComment,
      isOpen,
      togglePanel,
    }),
    [comments, commentCountForPage, addComment, deleteComment, isOpen, togglePanel],
  );

  // When Supabase not configured, provide no-op implementations
  if (!isSupabaseConfigured() || !user) {
    return (
      <FeedbackContext.Provider value={NOOP_VALUE}>
        {children}
      </FeedbackContext.Provider>
    );
  }

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

export { FeedbackContext };
