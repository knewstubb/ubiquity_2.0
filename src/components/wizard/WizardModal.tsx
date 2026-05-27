import { useState, useEffect, useCallback, useMemo } from 'react';
import { UploadSimple } from '@phosphor-icons/react';
import { useAutomations } from '../../contexts/AutomationsContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { CloseButton } from '../ui/close-button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../ui/alert-dialog';
import { Stepper } from '../composed/stepper';
import { WizardNavButtons } from './WizardNavButtons';
import { SourceSelectionStep } from './SourceSelectionStep';
import { FieldMappingStep } from './FieldMappingStep';
import { OutputConfigStep } from './OutputConfigStep';
import { ScheduleStep } from './ScheduleStep';
import { NotificationsStep } from '../shared/NotificationsStep';
import { ReviewStep } from './ReviewStep';
import type {
  ExporterWizardDraft,
  ExporterType,
  ExporterNotificationConfig,
} from '../../models/wizard';
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard';
import type { SourceConfig } from '../../models/source-selection';
import { validateColumnName, validateColumnNames, validatePrefix } from '../../utils/exporter-utils';
import { isSourceConfigComplete } from '../../utils/source-selection-validation';
import { hydrateSourceConfig, detectStaleReferences } from '../../utils/source-config-utils';

interface WizardModalProps {
  connectionId: string;
  connectorName: string;
  editConnectorId?: string;
  onSave: (draft: ExporterWizardDraft) => void;
  onClose: () => void;
}

interface StepDef {
  label: string;
  description: string;
}

const WIZARD_STEPS: StepDef[] = [
  { label: 'Source', description: 'Choose your data source and configure filters.' },
  { label: 'Field Mapping', description: 'Select and reorder the fields to include in your export.' },
  { label: 'File Configuration', description: 'Configure CSV output format, naming, and delivery options.' },
  { label: 'Schedule', description: 'Configure when and how often this export runs.' },
  { label: 'Notifications', description: 'Configure email notifications for this export.' },
  { label: 'Review', description: 'Review your exporter configuration before saving.' },
];

function createDefaultExporterDraft(
  connectionId: string,
  connectorName: string,
): ExporterWizardDraft {
  return {
    ...DEFAULT_EXPORTER_DRAFT,
    connectionId,
    name: connectorName,
  };
}

/**
 * Returns true when the primary source type or sub-source (tableId/channel) has changed,
 * meaning the available field set has changed and field selections must be cleared.
 */
function didSourceOrSubSourceChange(
  oldConfig: SourceConfig | null,
  newConfig: SourceConfig | null,
): boolean {
  if (!oldConfig || !newConfig) return true;
  if (oldConfig.primarySource !== newConfig.primarySource) return true;
  if (oldConfig.primarySource === 'transactions' && newConfig.primarySource === 'transactions') {
    return oldConfig.tableId !== newConfig.tableId;
  }
  if (oldConfig.primarySource === 'messages' && newConfig.primarySource === 'messages') {
    return oldConfig.channel !== newConfig.channel;
  }
  return false;
}

export function WizardModal({
  connectionId,
  connectorName,
  editConnectorId,
  onSave,
  onClose,
}: WizardModalProps) {
  const { automations } = useAutomations();
  const { getConnectionById } = useConnections();
  const connection = getConnectionById(connectionId);

  // Build initial draft — from existing automation in edit mode, or defaults
  const initialDraft = useMemo<ExporterWizardDraft>(() => {
    if (editConnectorId) {
      const existing = automations.find((c) => c.id === editConnectorId);
      if (existing) {
        // Attempt to hydrate sourceConfig from persisted data.
        // In a real system, the automation would store sourceConfig as a JSON field.
        // For the prototype, we check if the automation has a `sourceConfigJson` field
        // (it won't yet — this is where hydration would happen once persistence is added).
        const persistedJson = (existing as Record<string, unknown>).sourceConfigJson as string | null ?? null;
        const hydratedConfig = hydrateSourceConfig(persistedJson);

        // If hydration succeeded, detect stale references so the UI can warn the user
        if (hydratedConfig) {
          const staleRefs = detectStaleReferences(hydratedConfig);
          if (staleRefs.length > 0) {
            // Stale references detected — config is hydrated but user will need to fix invalid refs.
            // The SourceSelectionStep can read staleRefs from the config to show validation indicators.
            console.warn('[WizardModal] Stale references detected in hydrated sourceConfig:', staleRefs);
          }
        }

        return {
          connectionId: existing.connectionId,
          name: existing.name,
          sourceConfig: hydratedConfig,
          // Legacy fields (deprecated — kept for backward compat)
          exporterType: 'contact_transactional' as ExporterType,
          selectedSources: [existing.dataType],
          transactionalSource: existing.transactionalSource ?? null,
          filters: { ...existing.filters },
          selectedEventSources: [],
          selectedFields: [...existing.selectedFields],
          columnRenames: [],
          fileNamingPrefix: '',
          formatOptions: {
            delimiter: existing.formatOptions.delimiter,
            includeHeader: existing.formatOptions.includeHeader,
            dateFormat: existing.formatOptions.dateFormat,
            timezone: 'Pacific/Auckland', // Override legacy timezone
          },
          schedule: {
            frequency: (existing.scheduleConfig?.frequency ?? 'daily') as 'hourly' | 'daily' | 'weekly' | 'monthly',
            weeklyDays: existing.scheduleConfig?.weeklyDays ?? [false, false, false, false, false, false, false],
            monthlyDays: [],
          },
          notifications: existing.notifications
            ? {
                failureEmails: existing.notifications.failureEmails ?? [],
                successEnabled: existing.notifications.successEnabled ?? false,
                successEmails: existing.notifications.successEmails ?? [],
                noFileAlertEnabled: existing.notifications.noFileAlertEnabled ?? false,
                noFileAlertEmails: existing.notifications.noFileAlertEmails ?? [],
                noFileSchedule: existing.notifications.noFileSchedule,
              }
            : { ...DEFAULT_EXPORTER_DRAFT.notifications },
        };
      }
    }
    return createDefaultExporterDraft(connectionId, connectorName);
  }, [editConnectorId, automations, connectionId, connectorName]);

  const [draft, setDraft] = useState<ExporterWizardDraft>(initialDraft);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    editConnectorId ? [0, 1, 2, 3, 4, 5] : [],
  );
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [notificationsValid, setNotificationsValid] = useState(
    draft.notifications.failureEmails.length > 0,
  );

  // Dynamic steps — derive stepper label for Step 0 based on source selection
  const steps = useMemo(() => {
    const sourceLabel = draft.sourceConfig
      ? `${draft.sourceConfig.primarySource.charAt(0).toUpperCase() + draft.sourceConfig.primarySource.slice(1)} Source`
      : 'Source';
    return WIZARD_STEPS.map((step, i) =>
      i === 0 ? { ...step, label: sourceLabel } : step
    );
  }, [draft.sourceConfig]);
  const lastStepIndex = steps.length - 1;

  // Track whether draft has been modified from initial state
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );

  // canProceed validation per step
  const canProceed = useMemo(() => {
    // Step 0: Source Selection — uses isSourceConfigComplete
    if (currentStep === 0) {
      return isSourceConfigComplete(draft.sourceConfig);
    }

    // Steps: Source(0) → FieldMapping(1) → FileConfig(2) → Schedule(3) → Notifications(4) → Review(5)
    const stepLabel = steps[currentStep]?.label;

    switch (stepLabel) {
      case 'Field Mapping': {
        if (draft.selectedFields.length === 0) return false;
        // Validate column renames
        for (const field of draft.selectedFields) {
          const rename = draft.columnRenames.find((r) => r.fieldKey === field.key);
          if (rename) {
            const result = validateColumnName(rename.outputName);
            if (!result.valid) return false;
          }
        }
        // Check for duplicate column names
        const resolvedNames = draft.selectedFields.map((f) => {
          const rename = draft.columnRenames.find((r) => r.fieldKey === f.key);
          return rename ? rename.outputName : f.label;
        });
        const dupeResult = validateColumnNames(resolvedNames);
        if (!dupeResult.valid) return false;
        return true;
      }
      case 'File Configuration': {
        return validatePrefix(draft.fileNamingPrefix);
      }
      case 'Schedule': {
        const { frequency, weeklyDays, monthlyDays } = draft.schedule;
        if (frequency === 'weekly' && !weeklyDays.some(Boolean)) return false;
        if (frequency === 'monthly' && monthlyDays.length === 0) return false;
        return true;
      }
      case 'Notifications': {
        return notificationsValid;
      }
      case 'Review': {
        return true;
      }
      default:
        return false;
    }
  }, [currentStep, draft, steps, notificationsValid]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDiscardConfirm) return;
        if (isDirty) {
          setShowDiscardConfirm(true);
        } else {
          onClose();
        }
      }
    },
    [isDirty, onClose, showDiscardConfirm],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCloseClick = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking completed steps or current step
    if (completedSteps.includes(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === lastStepIndex) {
      // Save at review step
      onSave(draft);
      onClose();
      return;
    }
    // Mark current step as completed and advance
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep],
    );
    setCurrentStep(currentStep + 1);
  };

  const handleDraftUpdate = useCallback(
    (patch: Partial<ExporterWizardDraft>) => {
      setDraft((prev) => {
        // If sourceConfig is being updated, apply field clearing logic
        if (patch.sourceConfig !== undefined) {
          const oldConfig = prev.sourceConfig;
          const newConfig = patch.sourceConfig;

          if (didSourceOrSubSourceChange(oldConfig, newConfig)) {
            // Primary source or sub-source changed — clear all field selections
            return {
              ...prev,
              ...patch,
              selectedFields: [],
              columnRenames: [],
            };
          }

          // Only filter or enrichment changed — preserve valid fields
          const oldEnrichmentEntity = oldConfig?.enrichment?.entity ?? null;
          const newEnrichmentEntity = newConfig?.enrichment?.entity ?? null;

          if (oldEnrichmentEntity && oldEnrichmentEntity !== newEnrichmentEntity) {
            // Enrichment was removed or changed — remove fields from old enrichment entity
            const preservedFields = prev.selectedFields.filter(
              (field) => field.source !== oldEnrichmentEntity,
            );
            const preservedFieldKeys = new Set(preservedFields.map((f) => f.key));
            const preservedRenames = prev.columnRenames.filter(
              (rename) => preservedFieldKeys.has(rename.fieldKey),
            );

            return {
              ...prev,
              ...patch,
              selectedFields: preservedFields,
              columnRenames: preservedRenames,
            };
          }

          // Filter-only change or enrichment added (no removal) — preserve all fields
          return { ...prev, ...patch };
        }

        return { ...prev, ...patch };
      });
    },
    [],
  );

  const handleNotificationsUpdate = useCallback(
    (config: ExporterNotificationConfig) => {
      setDraft((prev) => ({ ...prev, notifications: config }));
    },
    [],
  );

  const handleNotificationsValidChange = useCallback((valid: boolean) => {
    setNotificationsValid(valid);
  }, []);

  // Step content based on current step index
  const stepContent = (() => {
    switch (currentStep) {
      case 0:
        return <SourceSelectionStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 1:
        return <FieldMappingStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 2:
        return <OutputConfigStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 3:
        return <ScheduleStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 4:
        return (
          <NotificationsStep
            value={draft.notifications}
            onUpdate={handleNotificationsUpdate}
            onValidChange={handleNotificationsValidChange}
          />
        );
      case 5:
        return <ReviewStep draft={draft} onEditStep={(step) => setCurrentStep(step)} />;
      default:
        return null;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs animate-[fadeIn_200ms_ease]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
      data-testid="wizard-modal"
    >
      <div className="w-[60vw] min-w-[860px] max-w-[1080px] h-[80vh] bg-background rounded-lg border border-border flex overflow-hidden animate-[slideUp_200ms_ease]">
        {/* Left sidebar */}
        <div className="w-[239px] shrink-0 bg-secondary p-8 flex flex-col gap-12 overflow-y-auto">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center text-primary mb-1">
              <UploadSimple size={56} />
            </div>
            <h2 id="wizard-modal-title" className="m-0 text-lg font-bold text-muted-foreground leading-snug">
              {editConnectorId ? 'Edit Exporter' : 'New Exporter'}
            </h2>
            <span className="text-[11px] font-medium text-tertiary-foreground uppercase tracking-wider">
              Connector: {connection?.name ?? connectorName}
            </span>
          </div>
          <Stepper
            steps={steps.map((s) => ({ label: s.label }))}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            orientation="vertical"
          />
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Fixed header — title + close button */}
          <div className="shrink-0 flex items-start justify-between px-8 pt-8 pb-8">
            <div>
              <h3 className="m-0 text-xl font-semibold text-primary">{steps[currentStep]?.label}</h3>
              <p className="mt-1 mb-0 text-sm text-tertiary-foreground">{steps[currentStep]?.description}</p>
            </div>
            <CloseButton
              onClick={handleCloseClick}
              aria-label="Close wizard"
              data-testid="wizard-close-button"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 scrollbar-gutter-stable" data-testid="wizard-step-content">
            {stepContent}
          </div>

          <div className="shrink-0 pt-4 pb-8 px-8">
            <WizardNavButtons
              onBack={handleBack}
              onNext={handleNext}
              onCancel={handleCloseClick}
              canProceed={canProceed}
              isLast={currentStep === lastStepIndex}
              showBack={currentStep > 0}
              submitLabel={editConnectorId ? (isDirty ? 'Save Changes' : 'Done') : 'Create Exporter'}
            />
          </div>
        </div>
      </div>

      {/* Discard changes confirmation */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your unsaved changes will be lost. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
              onClick={onClose}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
