import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/**
 * Journey Builder development phases.
 * Each phase builds on the previous — enabling a phase enables all features from earlier phases.
 */
export enum JourneyPhase {
  /** WS (Walking Skeleton): Start, Email, Delay, End nodes. Linear flow only. Manual trigger. */
  WS = 'WS',
  /** MVP (Minimum Viable Product): Multiple trigger types, draft/active status, SMS, email builder integration */
  MVP = 'MVP',
  /** MLP (Minimum Lovable Product): Branch nodes, A/B splits, Join nodes, wait-for-event, versioning */
  MLP = 'MLP',
  /** V2: Multi-way splits, webhooks, advanced reporting, templates */
  V2 = 'V2',
  /** V3: AI suggestions, predictive optimisation, cross-journey orchestration */
  V3 = 'V3',
}

/** Ordered list of phases for comparison */
const PHASE_ORDER: JourneyPhase[] = [
  JourneyPhase.WS,
  JourneyPhase.MVP,
  JourneyPhase.MLP,
  JourneyPhase.V2,
  JourneyPhase.V3,
];

/**
 * Feature flags keyed by the minimum phase required to enable them.
 * Features are cumulative — enabling V1 includes all WALKING_SKELETON features.
 */
export const JOURNEY_FEATURES = {
  // WS (Walking Skeleton)
  startNode: JourneyPhase.WS,
  emailNode: JourneyPhase.WS,
  delayNode: JourneyPhase.WS,
  endNode: JourneyPhase.WS,
  linearFlow: JourneyPhase.WS,
  manualTrigger: JourneyPhase.WS,
  autoSave: JourneyPhase.WS,
  basicValidation: JourneyPhase.WS,

  // MVP
  segmentTrigger: JourneyPhase.MVP,
  eventTrigger: JourneyPhase.MVP,
  scheduledTrigger: JourneyPhase.MVP,
  journeyStatus: JourneyPhase.MVP,
  smsNode: JourneyPhase.MVP,
  emailBuilderIntegration: JourneyPhase.MVP,
  multipleEndNodes: JourneyPhase.MVP,
  exitReasons: JourneyPhase.MVP,
  basicReporting: JourneyPhase.MVP,

  // MLP
  branchNode: JourneyPhase.MLP,
  abSplitNode: JourneyPhase.MLP,
  joinNode: JourneyPhase.MLP,
  waitForEventNode: JourneyPhase.MLP,
  updateContactNode: JourneyPhase.MLP,
  journeyVersioning: JourneyPhase.MLP,

  // V2
  multiWaySplit: JourneyPhase.V2,
  webhookNode: JourneyPhase.V2,
  advancedReporting: JourneyPhase.V2,
  journeyTemplates: JourneyPhase.V2,

  // V3
  aiSuggestions: JourneyPhase.V3,
  predictiveOptimisation: JourneyPhase.V3,
  crossJourneyOrchestration: JourneyPhase.V3,
} as const;

export type JourneyFeature = keyof typeof JOURNEY_FEATURES;

interface JourneyPhaseContextValue {
  /** Current active phase */
  currentPhase: JourneyPhase;
  /** Set the active phase */
  setPhase: (phase: JourneyPhase) => void;
  /** Check if a specific feature is enabled at the current phase */
  isFeatureEnabled: (feature: JourneyFeature) => boolean;
  /** Check if the current phase is at least the specified phase */
  isPhaseEnabled: (phase: JourneyPhase) => boolean;
  /** Get all enabled features at the current phase */
  enabledFeatures: JourneyFeature[];
  /** Get all available phases */
  allPhases: JourneyPhase[];
}

const JourneyPhaseContext = createContext<JourneyPhaseContextValue | undefined>(undefined);

const STORAGE_KEY = 'ubiquity:journey-phase';

function getPhaseIndex(phase: JourneyPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

interface JourneyPhaseProviderProps {
  children: ReactNode;
  /** Override the default phase (useful for testing) */
  defaultPhase?: JourneyPhase;
}

export function JourneyPhaseProvider({ children, defaultPhase }: JourneyPhaseProviderProps) {
  const [currentPhase, setCurrentPhase] = useState<JourneyPhase>(() => {
    if (defaultPhase) return defaultPhase;
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.values(JourneyPhase).includes(stored as JourneyPhase)) {
        return stored as JourneyPhase;
      }
    }
    // Default to WS (Walking Skeleton)
    return JourneyPhase.WS;
  });

  const setPhase = useCallback((phase: JourneyPhase) => {
    setCurrentPhase(phase);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, phase);
    }
  }, []);

  const isPhaseEnabled = useCallback(
    (phase: JourneyPhase): boolean => {
      return getPhaseIndex(currentPhase) >= getPhaseIndex(phase);
    },
    [currentPhase]
  );

  const isFeatureEnabled = useCallback(
    (feature: JourneyFeature): boolean => {
      const requiredPhase = JOURNEY_FEATURES[feature];
      return isPhaseEnabled(requiredPhase);
    },
    [isPhaseEnabled]
  );

  const enabledFeatures = useMemo((): JourneyFeature[] => {
    return (Object.keys(JOURNEY_FEATURES) as JourneyFeature[]).filter((feature) =>
      isFeatureEnabled(feature)
    );
  }, [isFeatureEnabled]);

  const value = useMemo<JourneyPhaseContextValue>(
    () => ({
      currentPhase,
      setPhase,
      isFeatureEnabled,
      isPhaseEnabled,
      enabledFeatures,
      allPhases: PHASE_ORDER,
    }),
    [currentPhase, setPhase, isFeatureEnabled, isPhaseEnabled, enabledFeatures]
  );

  return <JourneyPhaseContext.Provider value={value}>{children}</JourneyPhaseContext.Provider>;
}

export function useJourneyPhase(): JourneyPhaseContextValue {
  const context = useContext(JourneyPhaseContext);
  if (!context) {
    throw new Error('useJourneyPhase must be used within a JourneyPhaseProvider');
  }
  return context;
}

/**
 * Helper hook for conditional rendering based on journey phase.
 * Returns true if the feature is enabled at the current phase.
 *
 * @example
 * const showBranchNode = useJourneyFeature('branchNode');
 * {showBranchNode && <BranchNodeOption />}
 */
export function useJourneyFeature(feature: JourneyFeature): boolean {
  const { isFeatureEnabled } = useJourneyPhase();
  return isFeatureEnabled(feature);
}
