import { useMemo } from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import { FEATURE_FLAGS } from '../constants/featureFlags';

/**
 * Hook for accessing journey builder feature flags.
 * Provides typed boolean accessors for each journey phase.
 *
 * Phases are cumulative in design but independent in flags:
 * - You CAN enable MLP without MVP (for prototyping branching alone)
 * - In production, you'd enable MVP first, then MLP, then V2
 */
export function useJourneyFeatureFlags() {
  const { isEnabled } = useFeatureFlags();

  return useMemo(
    () => ({
      /**
       * MVP Phase enabled.
       * Adds: triggers, SMS, lifecycle, multiple exits, reporting.
       */
      mvpEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_MVP),

      /**
       * MLP Phase enabled.
       * Adds: If/Else branching, A/B splits, join nodes, wait for event, update contact.
       */
      mlpEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_MLP),

      /**
       * V2 Phase enabled.
       * Adds: multi-way splits, webhooks, advanced reporting, templates.
       */
      v2Enabled: isEnabled(FEATURE_FLAGS.JOURNEY_V2),

      // ─────────────────────────────────────────────────────────────────────
      // Convenience accessors for specific features
      // ─────────────────────────────────────────────────────────────────────

      /** Can add SMS nodes (MVP) */
      smsNodeEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_MVP),

      /** Can add conditional split / If-Else nodes (MLP) */
      conditionalSplitEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_MLP),

      /** Can add A/B split nodes (MLP) */
      abSplitEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_MLP),

      /** Can add join nodes to merge paths (MLP) */
      joinNodeEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_MLP),

      /** Can add multi-way split nodes with 3+ branches (V2) */
      multiWaySplitEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_V2),

      /** Can add webhook action nodes (V2) */
      webhookNodeEnabled: isEnabled(FEATURE_FLAGS.JOURNEY_V2),
    }),
    [isEnabled],
  );
}
