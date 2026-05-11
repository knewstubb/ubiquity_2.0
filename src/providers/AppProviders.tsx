import type { ReactNode } from 'react';
import { DataLayerProvider } from './DataLayerProvider';
import { RoleSimulatorProvider } from '../contexts/RoleSimulatorContext';
import { CollaborationProvider } from './CollaborationProvider';
import { PlatformAdminProvider } from '../contexts/PlatformAdminContext';
import { AccountProvider } from '../contexts/AccountContext';
import { PricingProvider } from '../contexts/PricingContext';
import { CampaignsProvider } from '../contexts/CampaignsContext';
import { JourneysProvider } from '../contexts/JourneysContext';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { AssetsProvider } from '../contexts/AssetsContext';
import { ConnectionsProvider } from '../contexts/ConnectionsContext';
import { AutomationsProvider } from '../contexts/AutomationsContext';
import { DataProvider } from '../contexts/DataContext';

/**
 * Composes all domain-level providers that live inside ProtectedRoute.
 * Order matters — each provider may depend on those above it.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    /* Infrastructure & role resolution */
    <DataLayerProvider>
      <RoleSimulatorProvider>
        <CollaborationProvider>
          <PlatformAdminProvider>
            <AccountProvider>
              <PricingProvider>
                {/* Domain data providers */}
                <CampaignsProvider>
                  <JourneysProvider>
                    <PermissionsProvider>
                      <AssetsProvider>
                        <ConnectionsProvider>
                          <AutomationsProvider>
                            <DataProvider>
                              {children}
                            </DataProvider>
                          </AutomationsProvider>
                        </ConnectionsProvider>
                      </AssetsProvider>
                    </PermissionsProvider>
                  </JourneysProvider>
                </CampaignsProvider>
              </PricingProvider>
            </AccountProvider>
          </PlatformAdminProvider>
        </CollaborationProvider>
      </RoleSimulatorProvider>
    </DataLayerProvider>
  );
}
