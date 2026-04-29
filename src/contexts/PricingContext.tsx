import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { UNIT_PRICES } from '../models/billing';
import type { BillingCategory } from '../models/billing';

interface PricingContextValue {
  prices: Record<BillingCategory, number>;
  setPrice: (category: BillingCategory, price: number) => void;
  resetPrices: () => void;
}

const PricingContext = createContext<PricingContextValue | null>(null);

const STORAGE_KEY = 'ubiquity-unit-prices';

function loadPrices(): Record<BillingCategory, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...UNIT_PRICES, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...UNIT_PRICES };
}

function savePrices(prices: Record<BillingCategory, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
}

export function PricingProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Record<BillingCategory, number>>(loadPrices);

  const setPrice = useCallback((category: BillingCategory, price: number) => {
    setPrices((prev) => {
      const next = { ...prev, [category]: price };
      savePrices(next);
      return next;
    });
  }, []);

  const resetPrices = useCallback(() => {
    const defaults = { ...UNIT_PRICES };
    setPrices(defaults);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PricingContext.Provider value={{ prices, setPrice, resetPrices }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing(): PricingContextValue {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error('usePricing must be used within PricingProvider');
  return ctx;
}
