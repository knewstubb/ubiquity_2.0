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

/**
 * Super admin emails that bypass all feature flags (always see everything enabled).
 * Must match the SUPER_ADMIN_EMAILS list in PlatformAdminContext.
 */
const SUPER_ADMIN_EMAILS = ['knewstubb@gmail.com', 'local@ubiquity.dev'];

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  scope: 'page' | 'component';
  target: string;
}

export interface FeatureFlagContextValue {
  flags: Record<string, FeatureFlag>;
  isEnabled: (flagName: string) => boolean;
  isRouteEnabled: (routePath: string) => boolean;
  isLoading: boolean;
  setFlagEnabled: (flagName: string, enabled: boolean) => Promise<void>;
  createFlag: (flag: Omit<FeatureFlag, 'enabled'> & { enabled?: boolean }) => Promise<void>;
  deleteFlag: (flagName: string) => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

/**
 * Fail-open defaults: when Supabase is not configured or fetch fails,
 * all flags are treated as enabled.
 */
const FAIL_OPEN_VALUE: FeatureFlagContextValue = {
  flags: {},
  isEnabled: () => true,
  isRouteEnabled: () => true,
  isLoading: false,
  setFlagEnabled: async () => {},
  createFlag: async () => {},
  deleteFlag: async () => {},
};

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured());
  const { user } = useAuth();

  // Super admin bypass — all flags are enabled
  const isAdminBypass = user?.email
    ? SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === user.email.toLowerCase())
    : false;

  useEffect(() => {
    if (!supabase) {
      // No Supabase — fail-open, everything enabled
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchFlags() {
      try {
        const { data, error } = await supabase!.from('feature_flags').select('*');

        if (cancelled) return;

        if (error || !data) {
          // Fail-open: treat all flags as enabled
          setFlags({});
          setIsLoading(false);
          return;
        }

        const flagMap: Record<string, FeatureFlag> = {};
        for (const row of data) {
          flagMap[row.name] = {
            name: row.name,
            enabled: row.enabled,
            description: row.description ?? '',
            scope: row.scope ?? 'page',
            target: row.target ?? '',
          };
        }
        setFlags(flagMap);
      } catch {
        // Fail-open on any error (network, table missing, etc.)
        if (!cancelled) {
          setFlags({});
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchFlags();

    return () => {
      cancelled = true;
    };
  }, []);

  const isEnabled = useCallback(
    (flagName: string): boolean => {
      if (isAdminBypass) return true;
      const flag = flags[flagName];
      // Fail-open: if flag doesn't exist, treat as enabled
      if (!flag) return true;
      return flag.enabled;
    },
    [flags, isAdminBypass],
  );

  const isRouteEnabled = useCallback(
    (routePath: string): boolean => {
      if (isAdminBypass) return true;
      // Check if any page-scoped flag with matching target is disabled
      for (const flag of Object.values(flags)) {
        if (flag.scope === 'page' && flag.target === routePath && !flag.enabled) {
          return false;
        }
      }
      // No flag disables this route — enabled
      return true;
    },
    [flags, isAdminBypass],
  );

  const setFlagEnabled = useCallback(
    async (flagName: string, enabled: boolean) => {
      if (!supabase) return;
      await supabase.from('feature_flags').update({ enabled }).eq('name', flagName);
      setFlags((prev) => {
        const flag = prev[flagName];
        if (!flag) return prev;
        return { ...prev, [flagName]: { ...flag, enabled } };
      });
    },
    [],
  );

  const createFlag = useCallback(
    async (flag: Omit<FeatureFlag, 'enabled'> & { enabled?: boolean }) => {
      if (!supabase) return;
      const newFlag: FeatureFlag = { ...flag, enabled: flag.enabled ?? false };
      await supabase.from('feature_flags').upsert({
        name: newFlag.name,
        enabled: newFlag.enabled,
        description: newFlag.description,
        scope: newFlag.scope,
        target: newFlag.target,
      });
      setFlags((prev) => ({ ...prev, [newFlag.name]: newFlag }));
    },
    [],
  );

  const deleteFlag = useCallback(
    async (flagName: string) => {
      if (!supabase) return;
      await supabase.from('feature_flags').delete().eq('name', flagName);
      setFlags((prev) => {
        const next = { ...prev };
        delete next[flagName];
        return next;
      });
    },
    [],
  );

  const value = useMemo<FeatureFlagContextValue>(
    () => {
      // When Supabase is not configured, return fail-open defaults
      if (!isSupabaseConfigured()) {
        return FAIL_OPEN_VALUE;
      }
      return { flags, isEnabled, isRouteEnabled, isLoading, setFlagEnabled, createFlag, deleteFlag };
    },
    [flags, isEnabled, isRouteEnabled, isLoading, setFlagEnabled, createFlag, deleteFlag],
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}
