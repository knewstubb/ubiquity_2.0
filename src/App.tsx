import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared/Toast';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppProviders } from './providers/AppProviders';
import { AppNavBar } from './components/layout/AppNavBar';
import { AdminAccountBanner } from './components/layout/AdminAccountBanner';
import { ChangelogBanner } from './components/layout/ChangelogBanner';
import { FeedbackWidget } from './components/shared/FeedbackWidget';
import { usePlatformAdmin } from './contexts/PlatformAdminContext';
import { TokenConfigProvider } from './contexts/TokenConfigContext';

// LoginPage stays eagerly loaded — it's the unauthenticated entry point
import LoginPage from './pages/LoginPage';

// ComponentLibraryPage kept static — has named exports used in nested routes
import ComponentLibraryPage from './pages/ComponentLibraryPage';
import { ComponentDemoView, CategoryOverview } from './pages/ComponentLibraryPage';

// TokenSubPage lazy-loaded for code splitting
const TokenSubPage = React.lazy(() => import('./pages/component-demos/TokenSubPage'));

// Lazy-loaded page imports for code splitting
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const OverviewDashboardPage = React.lazy(() => import('./pages/OverviewDashboardPage'));
const SegmentsPage = React.lazy(() => import('./pages/SegmentsPage'));
const SegmentDetailPage = React.lazy(() => import('./pages/SegmentDetailPage'));
const DatabasesPage = React.lazy(() => import('./pages/DatabasesPage'));
const AttributesPage = React.lazy(() => import('./pages/AttributesPage'));
const CampaignsPage = React.lazy(() => import('./pages/CampaignsPage'));
const CampaignDetailPage = React.lazy(() => import('./pages/CampaignDetailPage'));
const JourneysPage = React.lazy(() => import('./pages/JourneysPage'));
const JourneyCanvasPage = React.lazy(() => import('./pages/JourneyCanvasPage'));
const TemplatesPage = React.lazy(() => import('./pages/TemplatesPage'));
const EmailsPage = React.lazy(() => import('./pages/EmailsPage'));
const FormsPage = React.lazy(() => import('./pages/FormsPage'));
const SmsPage = React.lazy(() => import('./pages/SmsPage'));
const AnalyticsDashboardsPage = React.lazy(() => import('./pages/AnalyticsDashboardsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const ActivityPage = React.lazy(() => import('./pages/ActivityPage'));
const BillingReportPage = React.lazy(() => import('./pages/BillingReportPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const PermissionsPage = React.lazy(() => import('./pages/PermissionsPage'));
const AssetsPage = React.lazy(() => import('./pages/AssetsPage'));
const ActivityLogPage = React.lazy(() => import('./pages/ActivityLogPage'));
const UserManagementPage = React.lazy(() => import('./pages/UserManagementPage'));
const PageComponentsPage = React.lazy(() => import('./pages/PageComponentsPage'));

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
                    <AppProviders>
                      <ChangelogBanner />
                      <AppNavBar />
                      <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
                        <AdminAccountBanner />
                        <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-sm text-muted-foreground">Loading…</p></div>}>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
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
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/settings/permissions" element={<PermissionsPage />} />
                          <Route path="/admin/brand" element={<SettingsPage />} />
                          <Route path="/admin/rules" element={<SettingsPage />} />
                          <Route path="/admin/integrations" element={<SettingsPage />} />
                          <Route path="/admin/domains" element={<SettingsPage />} />
                          <Route path="/admin/api" element={<SettingsPage />} />
                          <Route path="/admin/activity" element={<ActivityLogPage />} />
                          <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
                          <Route path="/admin/components" element={<AdminRoute><ComponentLibraryPage /></AdminRoute>}>
                            <Route index element={<Navigate to="/admin/components/tokens" replace />} />
                            <Route path="tokens" element={<Navigate to="/admin/components/tokens/colours" replace />} />
                            <Route path="tokens/:tokenSlug" element={<TokenConfigProvider><TokenSubPage /></TokenConfigProvider>} />
                            {/* Legacy foundation route redirects */}
                            <Route path="foundations" element={<Navigate to="/admin/components/tokens" replace />} />
                            <Route path="foundations/colours" element={<Navigate to="/admin/components/tokens/colours" replace />} />
                            <Route path="foundations/typography" element={<Navigate to="/admin/components/tokens/typography" replace />} />
                            <Route path="foundations/shadows" element={<Navigate to="/admin/components/tokens/shadows" replace />} />
                            <Route path="foundations/spacing-radius" element={<Navigate to="/admin/components/tokens/spacing-radius" replace />} />
                            <Route path="foundations/tokens" element={<Navigate to="/admin/components/tokens" replace />} />
                            <Route path=":category" element={<CategoryOverview />} />
                            <Route path=":category/:slug" element={<ComponentDemoView />} />
                            {/* Catch-all for invalid category/slug */}
                            <Route path="*" element={<Navigate to="/admin/components/tokens" replace />} />
                          </Route>
                          <Route path="/admin/page-components" element={<AdminRoute><PageComponentsPage /></AdminRoute>} />
                        </Routes>
                        </Suspense>
                        <FeedbackWidget />
                        <Toaster />
                      </div>
                    </AppProviders>
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
