import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider } from '../components/shared/Toast';
import { DataLayerProvider } from '../providers/DataLayerProvider';
import { ConnectionsProvider, useConnections } from './ConnectionsContext';
import { connections as preSeededConnections } from '../data/connections';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DataLayerProvider>
        <ConnectionsProvider>{children}</ConnectionsProvider>
      </DataLayerProvider>
    </ToastProvider>
  );
}

describe('ConnectionsContext', () => {
  it('provides the pre-seeded connections array', () => {
    const { result } = renderHook(() => useConnections(), { wrapper });
    expect(result.current.connections).toEqual(preSeededConnections);
    expect(result.current.connections.length).toBeGreaterThanOrEqual(2);
  });

  it('getConnectionById returns the correct connection', () => {
    const { result } = renderHook(() => useConnections(), { wrapper });
    const first = preSeededConnections[0];
    expect(result.current.getConnectionById(first.id)).toEqual(first);
  });

  it('getConnectionById returns undefined for unknown id', () => {
    const { result } = renderHook(() => useConnections(), { wrapper });
    expect(result.current.getConnectionById('nonexistent-id')).toBeUndefined();
  });

  it('throws when useConnections is used outside provider', () => {
    expect(() => {
      renderHook(() => useConnections());
    }).toThrow('useConnections must be used within a ConnectionsProvider');
  });
});
