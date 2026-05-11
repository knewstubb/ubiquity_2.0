import type { ReactNode } from 'react';
import { ToastProvider } from '../components/shared/Toast';
import { DataLayerProvider } from './DataLayerProvider';
import { ConnectionsProvider } from '../contexts/ConnectionsContext';
import { AutomationsProvider } from '../contexts/AutomationsContext';
import { DataProvider } from '../contexts/DataContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DataLayerProvider>
        <ConnectionsProvider>
          <AutomationsProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </AutomationsProvider>
        </ConnectionsProvider>
      </DataLayerProvider>
    </ToastProvider>
  );
}
