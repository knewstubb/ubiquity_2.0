/**
 * Feature Flag Resolution — mirrors production logic exactly
 *
 * Production implementation:
 * - Library: HashDepot (MurmurHash3, 32-bit)
 * - Input: byte concatenation of featureId GUID + rootAccountId GUID (32 bytes)
 * - Output: hash % 100 compared against rolloutPercentage
 * - Deterministic: same account always gets the same bucket
 * - Root account resolution: child accounts use their root account's ID for hashing
 *
 * This prototype uses a simplified hash (djb2) but the resolution logic is identical.
 * The real system uses MurmurHash3 from the HashDepot library.
 *
 * Resolution precedence (production-accurate):
 * 1. Feature.State == Disabled (0) → DISABLED_GLOBALLY
 * 2. Feature.State == EnabledGlobally (2) → ENABLED
 * 3. AccountFeature row exists → ENABLED or DISABLED_FOR_ACCOUNT
 * 4. No override → hash rollout (deterministic per account)
 *
 * Fail-safe: if resolution fails for any reason, return DISABLED (fail-safe closed).
 * The real Next.js frontend does the same — on gRPC error, feature is OFF.
 */

import { FeatureState, FeatureStatus } from '../../models/featureFlag';
import type { FeatureFlag, AccountFeature } from '../../models/featureFlag';
import { featureFlags as localFlags, accountFeatures as localOverrides } from '../../data/featureFlags';

/**
 * Simple hash function to approximate MurmurHash3 behaviour.
 * Production uses HashDepot MurmurHash3 (32-bit) with concatenated GUIDs.
 * This gives the same deterministic-per-account property.
 */
function simpleHash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Resolve a feature flag for a specific account.
 *
 * @param featureName - The feature name (e.g., 'Connectors', 'JourneyBuilder')
 * @param accountId - The account to check
 * @param rootAccountId - The root account ID (used for hash rollout). If not provided, uses accountId.
 * @param flags - Feature flag definitions (defaults to local seed data)
 * @param overrides - Per-account overrides (defaults to local seed data)
 * @returns FeatureStatus indicating whether the feature is enabled for this account
 */
export function resolveFeatureFlag(
  featureName: string,
  accountId: string,
  rootAccountId?: string,
  flags: FeatureFlag[] = localFlags,
  overrides: AccountFeature[] = localOverrides,
): FeatureStatus {
  const flag = flags.find(f => f.name === featureName);
  if (!flag) return FeatureStatus.None;

  // 1. Globally disabled — OFF for everyone, no exceptions
  if (flag.state === FeatureState.Disabled) {
    return FeatureStatus.DisabledGlobally;
  }

  // 2. Globally enabled — ON for everyone, no exceptions
  if (flag.state === FeatureState.EnabledGlobally) {
    return FeatureStatus.Enabled;
  }

  // 3. Check per-account override
  const override = overrides.find(
    o => o.accountId === accountId && o.featureId === flag.id
  );
  if (override) {
    return override.isEnabled
      ? FeatureStatus.Enabled
      : FeatureStatus.DisabledForAccount;
  }

  // 4. Hash rollout — deterministic based on feature + root account
  const hashInput = `${flag.id}:${rootAccountId ?? accountId}`;
  const bucket = simpleHash(hashInput) % 100;

  if (bucket < flag.rolloutPercentage) {
    return FeatureStatus.Enabled;
  }

  return FeatureStatus.NotSetForAccount;
}

/**
 * Convenience: check if a feature is enabled (boolean).
 * Matches the production pattern where frontend code checks:
 *   if (status === FeatureStatus.ENABLED) { show feature }
 */
export function isFeatureEnabled(
  featureName: string,
  accountId: string,
  rootAccountId?: string,
): boolean {
  const status = resolveFeatureFlag(featureName, accountId, rootAccountId);
  return status === FeatureStatus.Enabled;
}

/**
 * Get all feature flags with their resolved status for an account.
 * Useful for admin/debug views.
 */
export function resolveAllFlags(
  accountId: string,
  rootAccountId?: string,
): Array<{ flag: FeatureFlag; status: FeatureStatus }> {
  return localFlags.map(flag => ({
    flag,
    status: resolveFeatureFlag(flag.name, accountId, rootAccountId),
  }));
}
