import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Campaign, Journey } from '../models/campaign';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDataLayer } from '../providers/DataLayerProvider';
import { useToast } from '../components/shared/Toast';
import * as campaignsAdapter from '../lib/adapters/campaigns-adapter';

const STORAGE_KEY = 'ubiquity-campaigns';

interface CampaignsContextValue {
  campaigns: Campaign[];
  campaignJourneys: Journey[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addJourney: (journey: Journey) => void;
  updateJourney: (id: string, updates: Partial<Journey>) => void;
  deleteJourney: (id: string) => void;
  getJourneysForCampaign: (campaignId: string) => Journey[];
}

const CampaignsContext = createContext<CampaignsContextValue | undefined>(undefined);

function saveState(campaigns: Campaign[], journeys: Journey[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ campaigns, journeys }));
}

interface PersistedCampaignsState {
  campaigns: Campaign[];
  journeys: Journey[];
}

function loadStateFromStorage(): PersistedCampaignsState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.campaigns) || !Array.isArray(parsed.journeys)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const dataLayer = useDataLayer();
  const { showToast } = useToast();
  const supabaseMode = isSupabaseConfigured();

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (!supabaseMode) {
      const stored = loadStateFromStorage();
      if (stored) return stored.campaigns;
    }
    return dataLayer.campaigns;
  });
  const [campaignJourneys, setCampaignJourneys] = useState<Journey[]>(() => {
    if (!supabaseMode) {
      const stored = loadStateFromStorage();
      if (stored) return stored.journeys;
    }
    return dataLayer.campaignJourneys;
  });

  // Persist to localStorage only in local mode
  useEffect(() => {
    if (!supabaseMode) {
      saveState(campaigns, campaignJourneys);
    }
  }, [campaigns, campaignJourneys, supabaseMode]);

  const addCampaign = useCallback((campaign: Campaign): void => {
    if (supabaseMode) {
      // Optimistic update, then persist
      setCampaigns((prev) => [...prev, campaign]);
      campaignsAdapter.addCampaign(campaign).catch((err) => {
        showToast(err.message || 'Failed to add campaign', 'error');
        setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      });
    } else {
      setCampaigns((prev) => [...prev, campaign]);
    }
  }, [supabaseMode, showToast]);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>): void => {
    setCampaigns((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      if (supabaseMode) {
        campaignsAdapter.updateCampaign(id, updates).catch((err) => {
          showToast(err.message || 'Failed to update campaign', 'error');
          setCampaigns(prev);
        });
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const deleteCampaign = useCallback((id: string): void => {
    setCampaigns((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (supabaseMode) {
        campaignsAdapter.deleteCampaign(id).catch((err) => {
          showToast(err.message || 'Failed to delete campaign', 'error');
          setCampaigns(prev);
        });
      }
      return filtered;
    });
    setCampaignJourneys((prev) => prev.filter((j) => j.campaignId !== id));
  }, [supabaseMode, showToast]);

  const addJourney = useCallback((journey: Journey): void => {
    setCampaignJourneys((prev) => [...prev, journey]);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === journey.campaignId
          ? { ...c, journeyIds: [...c.journeyIds, journey.id] }
          : c,
      ),
    );
    if (supabaseMode) {
      campaignsAdapter.addJourney(journey).catch((err) => {
        showToast(err.message || 'Failed to add journey', 'error');
        setCampaignJourneys((prev) => prev.filter((j) => j.id !== journey.id));
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === journey.campaignId
              ? { ...c, journeyIds: c.journeyIds.filter((jId) => jId !== journey.id) }
              : c,
          ),
        );
      });
    }
  }, [supabaseMode, showToast]);

  const updateJourney = useCallback((id: string, updates: Partial<Journey>): void => {
    setCampaignJourneys((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, ...updates } : j));
      if (supabaseMode) {
        campaignsAdapter.updateJourney(id, updates).catch((err) => {
          showToast(err.message || 'Failed to update journey', 'error');
          setCampaignJourneys(prev);
        });
      }
      return updated;
    });
  }, [supabaseMode, showToast]);

  const deleteJourney = useCallback((id: string): void => {
    setCampaignJourneys((prev) => {
      const journey = prev.find((j) => j.id === id);
      if (journey) {
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((c) =>
            c.id === journey.campaignId
              ? { ...c, journeyIds: c.journeyIds.filter((jId) => jId !== id) }
              : c,
          ),
        );
      }
      if (supabaseMode) {
        campaignsAdapter.deleteJourney(id).catch((err) => {
          showToast(err.message || 'Failed to delete journey', 'error');
          setCampaignJourneys(prev);
        });
      }
      return prev.filter((j) => j.id !== id);
    });
  }, [supabaseMode, showToast]);

  const getJourneysForCampaign = useCallback(
    (campaignId: string): Journey[] => {
      return campaignJourneys.filter((j) => j.campaignId === campaignId);
    },
    [campaignJourneys],
  );

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        campaignJourneys,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        addJourney,
        updateJourney,
        deleteJourney,
        getJourneysForCampaign,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns(): CampaignsContextValue {
  const context = useContext(CampaignsContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
}
