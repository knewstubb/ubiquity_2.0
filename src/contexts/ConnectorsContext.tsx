import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Connector } from '../models/connector';
import type { WizardDraft } from '../models/wizard';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useToast } from '../components/shared/Toast';
import * as connectorsAdapter from '../lib/adapters/connectors-adapter';

const STORAGE_KEY = 'ubiquity-connectors';

interface ConnectorsContextValue {
  connectors: Connector[];
  addConnector: (draft: WizardDraft) => Connector;
  addConnectorDirect: (connector: Connector) => void;
  updateConnector: (id: string, draft: WizardDraft) => void;
  toggleConnectorStatus: (id: string) => void;
  deleteConnector: (id: string) => void;
}

const ConnectorsContext = createContext<ConnectorsContextValue | undefined>(undefined);

function loadConnectorsFromStorage(): Connector[] | null {
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

function saveConnectors(connectors: Connector[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connectors));
}

export function ConnectorsProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();

  const [connectors, setConnectors] = useState<Connector[]>(() => {
    if (!supabaseMode) {
      const stored = loadConnectorsFromStorage();
      if (stored !== null) return stored;
    }
    return dataLayer.connectors;
  });

  useEffect(() => {
    if (!supabaseMode) {
      saveConnectors(connectors);
    }
  }, [connectors, supabaseMode]);

  const addConnector = useCallback((draft: WizardDraft): Connector => {
    const now = new Date().toISOString();
    const connector: Connector = {
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
    };
    setConnectors((prev) => [...prev, connector]);
    if (supabaseMode) {
      connectorsAdapter.add(connector).catch((err) => {
        showToast(err.message || 'Failed to add connector', 'error');
        setConnectors((prev) => prev.filter((c) => c.id !== connector.id));
      });
    }
    return connector;
  }, [supabaseMode, showToast]);

  const addConnectorDirect = useCallback((connector: Connector): void => {
    setConnectors((prev) => [...prev, connector]);
    if (supabaseMode) {
      connectorsAdapter.add(connector).catch((err) => {
        showToast(err.message || 'Failed to add connector', 'error');
        setConnectors((prev) => prev.filter((c) => c.id !== connector.id));
      });
    }
  }, [supabaseMode, showToast]);

  const updateConnector = useCallback((id: string, draft: WizardDraft): void => {
    setConnectors((prev) => {
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
              updatedAt: new Date().toISOString(),
            }
          : c,
      );
      if (supabaseMode) {
        const target = updated.find((c) => c.id === id);
        if (target) {
          connectorsAdapter.update(id, target).catch((err) => {
            showToast(err.message || 'Failed to update connector', 'error');
            setConnectors(prev);
          });
        }
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const toggleConnectorStatus = useCallback((id: string): void => {
    setConnectors((prev) => {
      const updated = prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'paused' as const : 'active' as const, updatedAt: new Date().toISOString() }
          : c,
      );
      if (supabaseMode) {
        const target = updated.find((c) => c.id === id);
        if (target) {
          connectorsAdapter.update(id, { status: target.status }).catch((err) => {
            showToast(err.message || 'Failed to toggle connector status', 'error');
            setConnectors(prev);
          });
        }
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const deleteConnector = useCallback((id: string): void => {
    setConnectors((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (supabaseMode) {
        connectorsAdapter.del(id).catch((err) => {
          showToast(err.message || 'Failed to delete connector', 'error');
          setConnectors(prev);
        });
      }
      return filtered;
    });
  }, [supabaseMode, showToast]);

  return (
    <ConnectorsContext.Provider
      value={{ connectors, addConnector, addConnectorDirect, updateConnector, toggleConnectorStatus, deleteConnector }}
    >
      {children}
    </ConnectorsContext.Provider>
  );
}

export function useConnectors(): ConnectorsContextValue {
  const context = useContext(ConnectorsContext);
  if (!context) {
    throw new Error('useConnectors must be used within a ConnectorsProvider');
  }
  return context;
}
