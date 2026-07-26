/**
 * Feature Flag model — mirrors u3_system.dbo.Feature + dbo.AccountFeature
 *
 * Production resolution precedence:
 * 1. Feature.State == Disabled (0) → OFF for everyone (overrides per-account enables)
 * 2. Feature.State == EnabledGlobally (2) → ON for everyone (overrides per-account disables)
 * 3. AccountFeature row exists → use IsEnabled value
 * 4. No override → MurmurHash3(featureId + rootAccountId) % 100 < RolloutPercentage
 *
 * Proto enum (from ubiquity-protos/system/v1):
 *   FeatureName: NONE=0, CONNECTORS=1, SIGNED_TRACKING=2, CONNECTION_MANAGEMENT=3
 *   FeatureStatus: NONE=0, ENABLED=1, DISABLED_GLOBALLY=2, DISABLED_FOR_ACCOUNT=3, NOT_SET_FOR_ACCOUNT=4
 */

export enum FeatureState {
  Disabled = 0,           // OFF globally — kill switch
  Enabled = 1,            // Subject to rollout percentage + per-account overrides
  EnabledGlobally = 2,    // ON globally — overrides everything
}

export enum FeatureStatus {
  None = 0,
  Enabled = 1,
  DisabledGlobally = 2,
  DisabledForAccount = 3,
  NotSetForAccount = 4,
}

export interface FeatureFlag {
  id: string;
  name: string;                     // e.g., 'Connectors', 'ConnectionManagement'
  description: string;
  state: FeatureState;
  rolloutPercentage: number;        // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface AccountFeature {
  accountId: string;
  featureId: string;
  isEnabled: boolean;
}
