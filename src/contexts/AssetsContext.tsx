import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Asset, AssetScope } from '../models/asset';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useToast } from '../components/shared/Toast';
import * as assetsAdapter from '../lib/adapters/assets-adapter';

const STORAGE_KEY = 'ubiquity-assets';

interface AssetsContextValue {
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  deleteAsset: (id: string) => void;
  getAssetsByScope: (scope: AssetScope, scopeId?: string) => Asset[];
}

const AssetsContext = createContext<AssetsContextValue | undefined>(undefined);

function saveState(assets: Asset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

function loadAssetsFromStorage(): Asset[] | null {
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

export function AssetsProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();

  const [assets, setAssets] = useState<Asset[]>(() => {
    if (!supabaseMode) {
      const stored = loadAssetsFromStorage();
      if (stored !== null) return stored;
    }
    return dataLayer.assets;
  });

  useEffect(() => {
    if (!supabaseMode) {
      saveState(assets);
    }
  }, [assets, supabaseMode]);

  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'createdAt'>): void => {
    const newAsset: Asset = {
      ...asset,
      id: `asset-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAssets((prev) => [...prev, newAsset]);
    if (supabaseMode) {
      assetsAdapter.add(asset).catch((err) => {
        showToast(err.message || 'Failed to add asset', 'error');
        setAssets((prev) => prev.filter((a) => a.id !== newAsset.id));
      });
    }
  }, [supabaseMode, showToast]);

  const deleteAsset = useCallback((id: string): void => {
    setAssets((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (supabaseMode) {
        assetsAdapter.del(id).catch((err) => {
          showToast(err.message || 'Failed to delete asset', 'error');
          setAssets(prev);
        });
      }
      return filtered;
    });
  }, [supabaseMode, showToast]);

  const getAssetsByScope = useCallback(
    (scope: AssetScope, scopeId?: string): Asset[] => {
      if (scope === 'global') {
        return assets.filter((a) => a.scope === 'global');
      }
      if (scope === 'campaign') {
        return assets.filter((a) => a.scope === 'campaign' && a.campaignId === scopeId);
      }
      // account scope
      if (scopeId === 'acc-master') {
        return assets.filter((a) => a.scope === 'account');
      }
      return assets.filter((a) => a.scope === 'account' && a.accountId === scopeId);
    },
    [assets],
  );

  return (
    <AssetsContext.Provider value={{ assets, addAsset, deleteAsset, getAssetsByScope }}>
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssets(): AssetsContextValue {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetsProvider');
  }
  return context;
}
