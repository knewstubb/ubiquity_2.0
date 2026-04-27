import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ContactRecord, TreatmentRecord, ProductRecord } from '../models/data';
import { useDataLayer } from '../providers/DataLayerProvider';

interface DataContextValue {
  contacts: ContactRecord[];
  treatments: TreatmentRecord[];
  products: ProductRecord[];
  contactCount: number;
  treatmentCount: number;
  productCount: number;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();

  const value = useMemo<DataContextValue>(
    () => ({
      contacts: dataLayer.contacts,
      treatments: dataLayer.treatments,
      products: dataLayer.products,
      contactCount: dataLayer.contacts.length,
      treatmentCount: dataLayer.treatments.length,
      productCount: dataLayer.products.length,
    }),
    [dataLayer.contacts, dataLayer.treatments, dataLayer.products],
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
