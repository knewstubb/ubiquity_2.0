import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DataLayerProvider } from './providers/DataLayerProvider';
import { RoleSimulatorProvider } from './contexts/RoleSimulatorContext';
import { CollaborationProvider } from './providers/CollaborationProvider';
import { PlatformAdminProvider } from './contexts/PlatformAdminContext';
import { AccountProvider } from './contexts/AccountContext';
import { PricingProvider } from './contexts/PricingContext';
import { CampaignsProvider } from './contexts/CampaignsContext';
import { JourneysProvider } from './contexts/JourneysContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { AssetsProvider } from './contexts/AssetsContext';
import { ConnectionsProvider } from './contexts/ConnectionsContext';
import { ConnectorsProvider } from './contexts/ConnectorsContext';
import { DataProvider } from './contexts/DataContext';
import { AppNavBar } from './components/layout/AppNavBar';
import { AdminAccountBanner } from './components/layout/AdminAccountBanner';
import { ChangelogBanner } from './components/layout/ChangelogBanner';
import { FeedbackWidget } from './components/shared/FeedbackWidget';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ConnectorDetailPage from './pages/ConnectorDetailPage';
import OverviewDashboardPage from './pages/OverviewDashboardPage';
import SegmentsPage from './pages/SegmentsPage';
import SegmentDetailPage from './pages/SegmentDetailPage';
import DatabasesPage from './pages/DatabasesPage';
import AttributesPage from './pages/AttributesPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import JourneysPage from './pages/JourneysPage';
import JourneyCanvasPage from './pages/JourneyCanvasPage';
import TemplatesPage from './pages/TemplatesPage';
import EmailsPage from './pages/EmailsPage';
import FormsPage from './pages/FormsPage';
import SmsPage from './pages/SmsPage';
import AnalyticsDashboardsPage from './pages/AnalyticsDashboardsPage';
import ReportsPage from './pages/ReportsPage';
import ActivityPage from './pages/ActivityPage';
import BillingReportPage from './pages/BillingReportPage';
import PricingPage from './pages/PricingPage';
import HeaderPlaygroundPage from './pages/HeaderPlaygroundPage';
import SettingsPage from './pages/SettingsPage';
import PermissionsPage from './pages/PermissionsPage';
import AssetsPage from './pages/AssetsPage';
import ActivityLogPage from './pages/ActivityLogPage';
import UserManagementPage from './pages/UserManagementPage';
import { usePlatformAdmin } from './contexts/PlatformAdminContext';

/** Redirects non-admin users to /dashboard */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isPlatformAdmin } = usePlatformAdmin();
  if (!isPlatformAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FeatureFlagProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
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
                                      <ConnectorsProvider>
                                        <DataProvider>
                                          <ChangelogBanner />
                                          <AppNavBar />
                                          <AdminAccountBanner />
                                          <Routes>
                                            <Route path="/" element={<DashboardPage />} />
                                            <Route path="/connector/:id" element={<ConnectorDetailPage />} />
                                            <Route path="/dashboard" element={<OverviewDashboardPage />} />
                                            <Route path="/audiences/segments" element={<SegmentsPage />} />
                                            <Route path="/audiences/segments/:segmentId" element={<SegmentDetailPage />} />
                                            <Route path="/audiences/databases" element={<DatabasesPage />} />
                                            <Route path="/audiences/attributes" element={<AttributesPage />} />
                                            <Route path="/automations/campaigns" element={<CampaignsPage />} />
                                            <Route path="/automations/campaigns/:campaignId" element={<CampaignDetailPage />} />
                                            <Route path="/automations/journeys" element={<JourneysPage />} />
                                            <Route path="/automations/journeys/:journeyId" element={<JourneyCanvasPage />} />
                                            <Route path="/content/templates" element={<TemplatesPage />} />
                                            <Route path="/content/emails" element={<EmailsPage />} />
                                            <Route path="/content/forms" element={<FormsPage />} />
                                            <Route path="/content/sms" element={<SmsPage />} />
                                            <Route path="/content/assets" element={<AssetsPage />} />
                                            <Route path="/analytics/dashboards" element={<AnalyticsDashboardsPage />} />
                                            <Route path="/analytics/reports" element={<ReportsPage />} />
                                            <Route path="/analytics/activity" element={<ActivityPage />} />
                                            <Route path="/admin/billing" element={<BillingReportPage />} />
                                            <Route path="/admin/pricing" element={<PricingPage />} />
                                            <Route path="/admin/header-playground" element={<HeaderPlaygroundPage />} />
                                            <Route path="/settings" element={<SettingsPage />} />
                                            <Route path="/settings/permissions" element={<PermissionsPage />} />
                                            <Route path="/admin/brand" element={<SettingsPage />} />
                                            <Route path="/admin/rules" element={<SettingsPage />} />
                                            <Route path="/admin/integrations" element={<SettingsPage />} />
                                            <Route path="/admin/domains" element={<SettingsPage />} />
                                            <Route path="/admin/api" element={<SettingsPage />} />
                                            <Route path="/admin/activity" element={<ActivityLogPage />} />
                                            <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
                                          </Routes>
                                          <FeedbackWidget />
                                        </DataProvider>
                                      </ConnectorsProvider>
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
                  </ProtectedRoute>
                }
              />
            </Routes>
          </FeatureFlagProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
