import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Automation } from '../models/automation';
import type { WizardDraft } from '../models/wizard';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useToast } from '../components/shared/Toast';
import * as automationsAdapter from '../lib/adapters/connectors-adapter';

const STORAGE_KEY = 'ubiquity-automations';

interface AutomationsContextValue {
  automations: Automation[];
  addAutomation: (draft: WizardDraft) => Automation;
  addAutomationDirect: (automation: Automation) => void;
  updateAutomation: (id: string, draft: WizardDraft) => void;
  toggleAutomationStatus: (id: string) => void;
  deleteAutomation: (id: string) => void;
}

const AutomationsContext = createContext<AutomationsContextValue | undefined>(undefined);

function loadAutomationsFromStorage(): Automation[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveAutomations(automations: Automation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(automations));
}

export function AutomationsProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();

  const [automations, setAutomations] = useState<Automation[]>(() => {
    // Always check localStorage first — it may contain user-created automations
    // that haven't synced to Supabase yet
    const stored = loadAutomationsFromStorage();
    if (stored !== null) return stored;
    return dataLayer.connectors;
  });

  // Fetch from Supabase on mount when in supabase mode
  useEffect(() => {
    if (!supabaseMode) return;
    automationsAdapter.getAll().then((data) => {
      if (data.length > 0) {
        // Merge: keep any local-only automations not in Supabase
        setAutomations((prev) => {
          const supabaseIds = new Set(data.map((a) => a.id));
          const localOnly = prev.filter((a) => !supabaseIds.has(a.id));
          const merged = [...data, ...localOnly];
          saveAutomations(merged);
          return merged;
        });
      }
    }).catch((err) => {
      console.warn('Failed to fetch automations from Supabase, using local data', err);
    });
  }, []);

  // Always persist to localStorage as a fallback
  useEffect(() => {
    saveAutomations(automations);
  }, [automations]);

  const addAutomation = useCallback((draft: WizardDraft): Automation => {
    const now = new Date().toISOString();
    const automation: Automation = {
      id: crypto.randomUUID(),
      connectionId: draft.connectionId!,
      name: draft.name,
      direction: 'export',
      dataType: draft.dataType!,
      ...(draft.transactionalSource ? { transactionalSource: draft.transactionalSource } : {}),
      ...(draft.enrichmentKeyField ? { enrichmentKeyField: draft.enrichmentKeyField } : {}),
      selectedFields: draft.selectedFields,
      fileType: draft.fileType,
      formatOptions: draft.formatOptions,
      fileNamingPattern: draft.fileNamingPattern,
      schedule: draft.schedule!,
      filters: draft.filters,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      notifications: draft.notifications,
      scheduleConfig: draft.scheduleConfig,
    };
    setAutomations((prev) => [...prev, automation]);
    if (supabaseMode) {
      automationsAdapter.add(automation).catch((err) => {
        console.error('addAutomation: Supabase sync failed', err);
        showToast(`Supabase sync failed: ${err.message}. Other users won't see this automation until sync succeeds.`, 'error');
      });
    }
    return automation;
  }, [supabaseMode, showToast]);

  const addAutomationDirect = useCallback((automation: Automation): void => {
    setAutomations((prev) => [...prev, automation]);
    if (supabaseMode) {
      automationsAdapter.add(automation).catch((err) => {
        console.error('addAutomationDirect: Supabase sync failed', err);
        showToast(`Supabase sync failed: ${err.message}. Other users won't see this automation until sync succeeds.`, 'error');
      });
    }
  }, [supabaseMode, showToast]);

  const updateAutomation = useCallback((id: string, draft: WizardDraft): void => {
    setAutomations((prev) => {
      const updated = prev.map((c) =>
        c.id === id
          ? {
              ...c,
              connectionId: draft.connectionId!,
              name: draft.name,
              dataType: draft.dataType!,
              ...(draft.transactionalSource
                ? { transactionalSource: draft.transactionalSource }
                : { transactionalSource: undefined }),
              ...(draft.enrichmentKeyField
                ? { enrichmentKeyField: draft.enrichmentKeyField }
                : { enrichmentKeyField: undefined }),
              selectedFields: draft.selectedFields,
              fileType: draft.fileType,
              formatOptions: draft.formatOptions,
              fileNamingPattern: draft.fileNamingPattern,
              schedule: draft.schedule!,
              filters: draft.filters,
              notifications: draft.notifications,
              scheduleConfig: draft.scheduleConfig,
              updatedAt: new Date().toISOString(),
            }
          : c,
      );
      if (supabaseMode) {
        const target = updated.find((c) => c.id === id);
        if (target) {
          automationsAdapter.update(id, target).catch((err) => {
            showToast(err.message || 'Failed to update automation', 'error');
            setAutomations(prev);
          });
        }
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const toggleAutomationStatus = useCallback((id: string): void => {
    setAutomations((prev) => {
      const updated = prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'paused' as const : 'active' as const, updatedAt: new Date().toISOString() }
          : c,
      );
      if (supabaseMode) {
        const target = updated.find((c) => c.id === id);
        if (target) {
          automationsAdapter.update(id, { status: target.status }).catch((err) => {
            showToast(err.message || 'Failed to toggle automation status', 'error');
            setAutomations(prev);
          });
        }
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const deleteAutomation = useCallback((id: string): void => {
    setAutomations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (supabaseMode) {
        automationsAdapter.del(id).catch((err) => {
          showToast(err.message || 'Failed to delete automation', 'error');
          setAutomations(prev);
        });
      }
      return filtered;
    });
  }, [supabaseMode, showToast]);

  return (
    <AutomationsContext.Provider
      value={{ automations, addAutomation, addAutomationDirect, updateAutomation, toggleAutomationStatus, deleteAutomation }}
    >
      {children}
    </AutomationsContext.Provider>
  );
}

export function useAutomations(): AutomationsContextValue {
  const context = useContext(AutomationsContext);
  if (!context) {
    throw new Error('useAutomations must be used within an AutomationsProvider');
  }
  return context;
}
