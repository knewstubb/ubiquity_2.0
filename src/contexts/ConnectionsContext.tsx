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

  return (
    <ConnectionsContext.Provider value={{ connections, getConnectionById, addConnection }}>
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
