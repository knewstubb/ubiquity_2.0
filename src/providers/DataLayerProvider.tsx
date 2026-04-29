import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Account } from '../models/account';
import type { Campaign, Journey } from '../models/campaign';
import type { JourneyDefinition } from '../models/journey';
import type { Connection } from '../models/connection';
import type { Connector } from '../models/connector';
import type { ContactRecord, TreatmentRecord, ProductRecord } from '../models/data';
import type { PermissionGroup, UserAccountAssignment, PermissionUser } from '../models/permissions';
import type { Segment } from '../models/segment';
import type { Asset } from '../models/asset';

// Local data (for synchronous fallback)
import { accounts as localAccounts } from '../data/accounts';
import { campaigns as localCampaigns, journeys as localJourneys } from '../data/campaigns';
import { journeyDefinitions as localJourneyDefinitions } from '../data/journeySeeds';
import { connections as localConnections } from '../data/connections';
import { connectors as localConnectors } from '../data/connectors';
import { contacts as localContacts } from '../data/contacts';
import { treatments as localTreatments } from '../data/treatments';
import { products as localProducts } from '../data/products';
import { defaultPermissionGroups, defaultAssignments } from '../data/permissions';
import { users as localUsers } from '../data/users';
import { segments as localSegments } from '../data/segments';
import { seedAssets } from '../data/assets';

// Adapters
import * as accountsAdapter from '../lib/adapters/accounts-adapter';
import * as campaignsAdapter from '../lib/adapters/campaigns-adapter';
import * as journeysAdapter from '../lib/adapters/journeys-adapter';
import * as connectionsAdapter from '../lib/adapters/connections-adapter';
import * as connectorsAdapter from '../lib/adapters/connectors-adapter';
import * as dataAdapter from '../lib/adapters/data-adapter';
import * as permissionsAdapter from '../lib/adapters/permissions-adapter';
import * as assetsAdapter from '../lib/adapters/assets-adapter';
import * as segmentsAdapter from '../lib/adapters/segments-adapter';

function loadLocalData() {
  return {
    accounts: localAccounts,
    campaigns: localCampaigns,
    campaignJourneys: localJourneys,
    journeyDefinitions: localJourneyDefinitions,
    connections: localConnections,
    connectors: localConnectors,
    contacts: localContacts,
    treatments: localTreatments,
    products: localProducts,
    permissionGroups: defaultPermissionGroups,
    assignments: defaultAssignments,
    users: localUsers,
    segments: localSegments,
    assets: seedAssets,
  };
}

export interface DataLayerContextValue {
  isLoading: boolean;
  error: string | null;
  accounts: Account[];
  campaigns: Campaign[];
  campaignJourneys: Journey[];
  journeyDefinitions: JourneyDefinition[];
  connections: Connection[];
  connectors: Connector[];
  contacts: ContactRecord[];
  treatments: TreatmentRecord[];
  products: ProductRecord[];
  permissionGroups: PermissionGroup[];
  assignments: UserAccountAssignment[];
  users: PermissionUser[];
  segments: Segment[];
  assets: Asset[];
}

const DataLayerContext = createContext<DataLayerContextValue | undefined>(undefined);

export function DataLayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataLayerContextValue>(() => {
    // When Supabase is not configured, load synchronously from local mock data
    if (!isSupabaseConfigured()) {
      return {
        isLoading: false,
        error: null,
        ...loadLocalData(),
      };
    }
    // When Supabase IS configured, start in loading state
    return {
      isLoading: true,
      error: null,
      accounts: [],
      campaigns: [],
      campaignJourneys: [],
      journeyDefinitions: [],
      connections: [],
      connectors: [],
      contacts: [],
      treatments: [],
      products: [],
      permissionGroups: [],
      assignments: [],
      users: [],
      segments: [],
      assets: [],
    };
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;

    async function fetchAll() {
      try {
        const [
          accounts,
          campaigns,
          campaignJourneys,
          journeyDefinitions,
          connections,
          connectors,
          contacts,
          treatments,
          products,
          permissionGroups,
          assignments,
          users,
          segments,
          assets,
        ] = await Promise.all([
          accountsAdapter.getAll(),
          campaignsAdapter.getAllCampaigns(),
          campaignsAdapter.getAllJourneys(),
          journeysAdapter.getAll(),
          connectionsAdapter.getAll(),
          connectorsAdapter.getAll(),
          dataAdapter.getContacts(),
          dataAdapter.getTreatments(),
          dataAdapter.getProducts(),
          permissionsAdapter.getPermissionGroups(),
          permissionsAdapter.getAssignments(),
          permissionsAdapter.getUsers(),
          segmentsAdapter.getAll(),
          assetsAdapter.getAll(),
        ]);

        if (!cancelled) {
          setState({
            isLoading: false,
            error: null,
            accounts,
            campaigns,
            campaignJourneys,
            journeyDefinitions,
            connections,
            connectors,
            contacts,
            treatments,
            products,
            permissionGroups,
            assignments,
            users,
            segments,
            assets,
          });
        }
      } catch (err) {
        if (!cancelled) {
          // Fall back to local data on error
          setState({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to load data',
            ...loadLocalData(),
          });
        }
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  if (state.isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'Inter', sans-serif",
        color: '#52525B',
        fontSize: '16px',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <DataLayerContext.Provider value={state}>
      {children}
    </DataLayerContext.Provider>
  );
}

export function useDataLayer(): DataLayerContextValue {
  const context = useContext(DataLayerContext);
  if (!context) {
    throw new Error('useDataLayer must be used within a DataLayerProvider');
  }
  return context;
}
