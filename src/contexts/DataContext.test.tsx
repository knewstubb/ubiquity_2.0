import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider } from '../components/shared/Toast';
import { DataLayerProvider } from '../providers/DataLayerProvider';
import { DataProvider, useData } from './DataContext';
import { contacts } from '../data/contacts';
import { treatments } from '../data/treatments';
import { products } from '../data/products';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DataLayerProvider>
        <DataProvider>{children}</DataProvider>
      </DataLayerProvider>
    </ToastProvider>
  );
}

describe('DataContext', () => {
  it('provides the pre-seeded contacts array', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.contacts).toEqual(contacts);
  });

  it('provides the pre-seeded treatments array', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.treatments).toEqual(treatments);
  });

  it('provides the pre-seeded products array', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.products).toEqual(products);
  });

  it('exposes correct record counts', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.contactCount).toBe(contacts.length);
    expect(result.current.treatmentCount).toBe(treatments.length);
    expect(result.current.productCount).toBe(products.length);
  });

  it('throws when useData is used outside provider', () => {
    expect(() => {
      renderHook(() => useData());
    }).toThrow('useData must be used within a DataProvider');
  });
});
