import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { computeUnseenEntries } from '../lib/changelog-utils';

export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  affectedRoutes: string[];
  createdAt: string;
}

export interface ChangelogContextValue {
  entries: ChangelogEntry[];
  unseenEntries: ChangelogEntry[];
  dismissBanner: () => void;
  showBanner: boolean;
}

const ChangelogContext = createContext<ChangelogContextValue | undefined>(undefined);

function mapRow(row: Record<string, unknown>): ChangelogEntry {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    affectedRoutes: (row.affected_routes as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

const NOOP_VALUE: ChangelogContextValue = {
  entries: [],
  unseenEntries: [],
  dismissBanner: () => {},
  showBanner: false,
};

export function ChangelogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [lastSeenEntryId, setLastSeenEntryId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Fetch changelog entries and last seen entry
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || !user) return;

    let cancelled = false;

    async function fetchData() {
      // Fetch entries ordered by created_at DESC
      const { data: entriesData, error: entriesError } = await supabase!
        .from('changelog_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (!entriesError && entriesData) {
        setEntries(entriesData.map(mapRow));
      } else if (entriesError) {
        console.warn('Failed to fetch changelog entries:', entriesError.message);
      }

      // Fetch last seen entry for this user
      const { data: seenData, error: seenError } = await supabase!
        .from('user_changelog_seen')
        .select('last_seen_entry_id')
        .eq('user_id', user!.id)
        .single();

      if (cancelled) return;

      if (!seenError && seenData) {
        setLastSeenEntryId(seenData.last_seen_entry_id as string);
      }
      // If no record exists, lastSeenEntryId stays null (all entries are unseen)

      setLoaded(true);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  const { unseenEntries, showBanner } = useMemo(() => {
    if (!loaded) return { unseenEntries: [] as ChangelogEntry[], showBanner: false };
    return computeUnseenEntries(entries, lastSeenEntryId);
  }, [entries, lastSeenEntryId, loaded]);

  const dismissBanner = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase || !user || entries.length === 0) return;

    const latestEntryId = entries[0].id;
    setLastSeenEntryId(latestEntryId);

    // Upsert the last seen entry
    const { error } = await supabase
      .from('user_changelog_seen')
      .upsert(
        { user_id: user.id, last_seen_entry_id: latestEntryId },
        { onConflict: 'user_id' },
      );

    if (error) {
      console.warn('Failed to dismiss changelog banner:', error.message);
    }
  }, [user, entries]);

  const value = useMemo<ChangelogContextValue>(
    () => ({ entries, unseenEntries, dismissBanner, showBanner }),
    [entries, unseenEntries, dismissBanner, showBanner],
  );

  if (!isSupabaseConfigured() || !user) {
    return (
      <ChangelogContext.Provider value={NOOP_VALUE}>
        {children}
      </ChangelogContext.Provider>
    );
  }

  return (
    <ChangelogContext.Provider value={value}>
      {children}
    </ChangelogContext.Provider>
  );
}

export function useChangelog(): ChangelogContextValue {
  const context = useContext(ChangelogContext);
  if (!context) {
    throw new Error('useChangelog must be used within a ChangelogProvider');
  }
  return context;
}

export { ChangelogContext };
