import type { ReactNode } from 'react';
import { ToastProvider } from '../components/shared/Toast';
import { DataLayerProvider } from './DataLayerProvider';
import { ConnectionsProvider } from '../contexts/ConnectionsContext';
import { ConnectorsProvider } from '../contexts/ConnectorsContext';
import { DataProvider } from '../contexts/DataContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DataLayerProvider>
        <ConnectionsProvider>
          <ConnectorsProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </ConnectorsProvider>
        </ConnectionsProvider>
      </DataLayerProvider>
    </ToastProvider>
  );
}
