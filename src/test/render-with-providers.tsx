import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import { ToastProvider } from '../components/shared/Toast';
import { AuthProvider } from '../contexts/AuthContext';
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import { DataLayerProvider } from '../providers/DataLayerProvider';
import { RoleSimulatorProvider } from '../contexts/RoleSimulatorContext';
import { CollaborationProvider } from '../providers/CollaborationProvider';
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

// ─── Configuration ───────────────────────────────────────────────────────────

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial route entries for MemoryRouter. Defaults to ['/'] */
  initialEntries?: string[];
  /** Starting index in initialEntries. Defaults to last entry. */
  initialIndex?: number;
}

// ─── Full Provider Wrapper ───────────────────────────────────────────────────

/**
 * Renders a component wrapped in the full provider tree matching App.tsx nesting.
 *
 * Since `isSupabaseConfigured()` is mocked to return false globally (in setup.ts),
 * AuthProvider provides a mock local user and DataLayerProvider uses local seed data.
 * This means tests get a fully authenticated, data-rich environment by default.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
) {
  const {
    initialEntries = ['/'],
    initialIndex,
    ...renderOptions
  } = options;

  function AllProviders({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        <ToastProvider>
          <AuthProvider>
            <FeatureFlagProvider>
              <DataLayerProvider>
                <RoleSimulatorProvider>
                  <CollaborationProvider>
                    <PlatformAdminProvider>
                      <AccountProvider>
                        <PricingProvider>
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
            </FeatureFlagProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: AllProviders, ...renderOptions }),
  };
}

// ─── Minimal Provider Wrapper ────────────────────────────────────────────────

export interface RenderWithMinimalProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial route entries for MemoryRouter. Defaults to ['/'] */
  initialEntries?: string[];
  /** Starting index in initialEntries. Defaults to last entry. */
  initialIndex?: number;
}

/**
 * Renders a component with only MemoryRouter + ToastProvider.
 * Use for components that don't need auth, data, or other context.
 */
export function renderWithMinimalProviders(
  ui: ReactElement,
  options: RenderWithMinimalProvidersOptions = {},
) {
  const {
    initialEntries = ['/'],
    initialIndex,
    ...renderOptions
  } = options;

  function MinimalProviders({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </MemoryRouter>
    );
  }

  return {
    ...render(ui, { wrapper: MinimalProviders, ...renderOptions }),
  };
}
