/**
 * Feature flag name constants.
 *
 * Flags are stored in Supabase and toggled via the Feature Flags modal
 * (accessible to platform admins via Settings).
 *
 * Usage:
 *   const { isEnabled } = useFeatureFlags();
 *   if (isEnabled(FEATURE_FLAGS.JOURNEY_MVP)) { ... }
 */
export const FEATURE_FLAGS = {
  // ─────────────────────────────────────────────────────────────────────────
  // Journey Builder Phases
  // ─────────────────────────────────────────────────────────────────────────
  // Each phase flag enables ALL features in that phase.
  // Phases are cumulative — enabling MLP assumes MVP is also enabled.

  /**
   * MVP Phase: Production-ready triggers, lifecycle, SMS, multiple exits, reporting.
   * - Segment entry triggers
   * - Event-based triggers (form submitted, purchase made, page visited)
   * - Scheduled triggers (one-time, recurring)
   * - SMS node
   * - Draft/Active/Paused/Archived status
   * - Multiple end nodes with exit reasons
   * - Journey entry/completion counts
   */
  JOURNEY_MVP: 'journey-mvp',

  /**
   * MLP Phase: Branching logic and flow control.
   * - If/Else conditional branch (using Filter Builder)
   * - A/B percentage split
   * - Join node (merge paths)
   * - Wait for event node
   * - Update contact field node
   * - Journey versioning
   */
  JOURNEY_MLP: 'journey-mlp',

  /**
   * V2 Phase: Advanced splits and templates.
   * - Multi-way splits (3+ paths)
   * - Webhook action nodes
   * - Advanced reporting and analytics
   * - Journey templates
   */
  JOURNEY_V2: 'journey-v2',
} as const;

export type FeatureFlagName = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
