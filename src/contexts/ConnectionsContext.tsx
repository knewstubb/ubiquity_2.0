import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Connection } from '../models/connection';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useToast } from '../components/shared/Toast';
import * as connectionsAdapter from '../lib/adapters/connections-adapter';

interface ConnectionsContextValue {
  connections: Connection[];
  getConnectionById: (id: string) => Connection | undefined;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
}

const ConnectionsContext = createContext<ConnectionsContextValue | undefined>(undefined);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();

  const [connections, setConnections] = useState<Connection[]>(dataLayer.connections);

  const getConnectionById = useCallback(
    (id: string) => connections.find((c) => c.id === id),
    [connections],
  );

  const addConnection = useCallback((connection: Connection) => {
    setConnections((prev) => [...prev, connection]);
    if (supabaseMode) {
      connectionsAdapter.add(connection).catch((err) => {
        showToast(err.message || 'Failed to add connection', 'error');
        setConnections((prev) => prev.filter((c) => c.id !== connection.id));
      });
    }
  }, [supabaseMode, showToast]);

  const updateConnection = useCallback((id: string, updates: Partial<Connection>) => {
    setConnections((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      if (supabaseMode) {
        connectionsAdapter.update(id, updates).catch((err) => {
          showToast(err.message || 'Failed to update connection', 'error');
          setConnections(prev);
        });
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (supabaseMode) {
        connectionsAdapter.del(id).catch((err) => {
          showToast(err.message || 'Failed to delete connection', 'error');
          setConnections(prev);
        });
      }
      return filtered;
    });
  }, [supabaseMode, showToast]);

  return (
    <ConnectionsContext.Provider value={{ connections, getConnectionById, addConnection, updateConnection, deleteConnection }}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections(): ConnectionsContextValue {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionsProvider');
  }
  return context;
}
