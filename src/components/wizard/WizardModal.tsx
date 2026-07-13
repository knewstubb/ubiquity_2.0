import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UploadSimple } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAutomations } from '../../contexts/AutomationsContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
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
import { DataSourceFilterStep } from './DataSourceFilterStep';
import { FieldMappingStep } from './FieldMappingStep';
import { OutputConfigStep } from './OutputConfigStep';
import { ScheduleStep } from './ScheduleStep';
import { ReviewStep } from './ReviewStep';
import { PhaseToggle } from '../layout/PhaseToggle';
import type {
  ExporterWizardDraft,
  ExporterScheduleConfig,
  ExporterType,
} from '../../models/wizard';
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard';
import type { SourceConfig } from '../../models/source-selection';
import { enrichmentKey, getSourceTag } from '../../models/source-selection';
import { validateColumnName, validateColumnNames, validatePrefix } from '../../utils/exporter-utils';
import { hydrateSourceConfig, detectStaleReferences } from '../../utils/source-config-utils';
import { didSourceOrSubSourceChange, populateFieldsForTransition } from '../../utils/populate-fields';
import { usePrototypePhases } from '../../contexts/PrototypePhaseContext';

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
  { label: 'File Settings', description: 'Name your export and configure output file options.' },
  { label: 'Data Source', description: 'Choose your primary data source.' },
  { label: 'Filter', description: 'Define which records to include in the export.' },
  { label: 'Export Fields', description: 'Select and reorder the fields to include in your export.' },
  { label: 'Schedule', description: 'Configure when and how often this export runs.' },
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
          dataSourceFilter: null,
          dataSourceMode: null,
          destinationPath: '/exports/',
          // Legacy fields (deprecated — kept for backward compat)
          exporterType: 'contact_transactional' as ExporterType,
          selectedSources: [existing.dataType],
          transactionalSource: existing.transactionalSource ?? null,
          filters: { ...existing.filters },
          selectedEventSources: [],
          selectedFields: [...existing.selectedFields],
          columnRenames: [],
          fileNamingPrefix: existing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100),
          formatOptions: {
            delimiter: existing.formatOptions.delimiter,
            includeHeader: existing.formatOptions.includeHeader,
            dateFormat: existing.formatOptions.dateFormat,
            timezone: 'Pacific/Auckland', // Override legacy timezone
          },
          schedule: {
            frequency: (existing.scheduleConfig?.frequency ?? 'daily') as ExporterScheduleConfig['frequency'],
            weeklyDays: existing.scheduleConfig?.weeklyDays ?? [false, false, false, false, false, false, false],
            monthlyDays: [],
            timeOfDay: null,
          },
          notifications: existing.notifications
            ? {
                failureEmails: existing.notifications.failureEmails ?? [],
                successEnabled: existing.notifications.successEnabled ?? false,
                successEmails: existing.notifications.successEmails ?? [],
              }
            : { ...DEFAULT_EXPORTER_DRAFT.notifications },
        };
      }
    }
    return createDefaultExporterDraft(connectionId, connectorName);
  }, [editConnectorId, automations, connectionId, connectorName]);

  const [draft, setDraft] = useState<ExporterWizardDraft>(initialDraft);
  const previousSourceConfigRef = useRef<SourceConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    editConnectorId ? Array.from({ length: WIZARD_STEPS.length }, (_, i) => i) : [],
  );
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [notificationsValid, setNotificationsValid] = useState(
    draft.notifications.failureEmails.length > 0,
  );

  // Dynamic steps — derive stepper label for Step 0 based on source selection
  const { phases } = usePrototypePhases();
  const exporterPhase = phases.exporterPhase;

  const steps = useMemo(() => {
    return WIZARD_STEPS;
  }, []);
  const lastStepIndex = steps.length - 1;

  // Track whether draft has been modified from initial state
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );

  // canProceed validation per step
  const canProceed = useMemo(() => {
    // Steps: FileSettings(0) → DataSource(1) → FieldMapping(2) → Schedule(3) → Review(4)
    const stepLabel = steps[currentStep]?.label;

    switch (stepLabel) {
      case 'Data Source': {
        // Allow proceeding when a source is selected
        return draft.sourceConfig !== null;
      }
      case 'Filter': {
        // Filter is always valid — empty means "all changes since last export"
        return true;
      }
      case 'Export Fields': {
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
      case 'File Settings': {
        // Use the effective prefix — if user hasn't manually set one, fall back to slugified name
        const effectivePrefix = draft.fileNamingPrefix || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
        return validatePrefix(effectivePrefix);
      }
      case 'Schedule': {
        const { frequency, weeklyDays } = draft.schedule;
        if (frequency === 'weekly' && !weeklyDays.some(Boolean)) return false;
        // Notifications validation only applies in Phase 2+ (when notifications section is visible)
        if (exporterPhase >= 2 && !notificationsValid) return false;
        return true;
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

    // Auto-populate fields when transitioning to Export Fields
    // This happens from Filter (Phase 3) or from Data Source (Phase 1–2 when Filter is hidden)
    const nextStepLabel = steps[currentStep + 1]?.label;
    if (nextStepLabel === 'Export Fields') {
      const patch = populateFieldsForTransition(draft, previousSourceConfigRef.current);
      if (patch) {
        setDraft(prev => ({ ...prev, ...patch }));
      }
      previousSourceConfigRef.current = draft.sourceConfig;
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

          // Multi-enrichment array diff — detect removed enrichments and clean up their fields
          const oldEnrichments = oldConfig?.enrichments ?? [];
          const newEnrichments = newConfig?.enrichments ?? [];

          const removedSources = oldEnrichments.filter(
            (old) => !newEnrichments.some((ne) => enrichmentKey(ne) === enrichmentKey(old))
          );

          if (removedSources.length > 0) {
            // Build set of source tags being removed
            const removedTags = new Set(removedSources.map((r) => getSourceTag(r)));

            // Filter out selected fields belonging to removed enrichments
            const preservedFields = prev.selectedFields.filter(
              (field) => !removedTags.has(field.source),
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

          // Legacy single enrichment change — preserve valid fields
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

  const handleNotificationsValidChange = useCallback((valid: boolean) => {
    setNotificationsValid(valid);
  }, []);

  // Step content based on current step label
  const stepContent = (() => {
    const stepLabel = steps[currentStep]?.label;
    switch (stepLabel) {
      case 'File Settings':
        return <OutputConfigStep draft={draft} onUpdate={handleDraftUpdate} connectionBasePath={connection?.basePath ?? ''} />;
      case 'Data Source':
        return <DataSourceFilterStep key="data-source" draft={draft} onUpdate={handleDraftUpdate} />;
      case 'Filter':
        return <DataSourceFilterStep key="filter" draft={{ ...draft, dataSourceMode: 'filtered' }} onUpdate={handleDraftUpdate} />;
      case 'Export Fields':
        return <FieldMappingStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 'Schedule':
        return <ScheduleStep draft={draft} onUpdate={handleDraftUpdate} onNotificationsValidChange={handleNotificationsValidChange} />;
      case 'Review':
        return <ReviewStep draft={draft} onEditStep={(step) => setCurrentStep(step)} />;
      default:
        return null;
    }
  })();

  return (
    <div
      className="flex-1 w-full bg-background flex"
      aria-labelledby="wizard-modal-title"
      data-testid="wizard-modal"
    >
      <div className="w-full flex flex-1 min-h-0">
        {/* Left sidebar */}
        <div className="w-[280px] shrink-0 bg-secondary p-8 flex flex-col gap-12 overflow-y-auto">
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
          {/* Phase toggle — bottom of sidebar */}
          <div className="mt-auto pt-4">
            <PhaseToggle />
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background relative p-6">
          <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 min-h-0 rounded-lg bg-card overflow-hidden">
          {/* Breadcrumb */}
          <div className="shrink-0 px-8 pt-6 pb-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/audiences/databases">Audience</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Connectors</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* Fixed header — title */}
          <div className="shrink-0 flex items-start px-8 pt-4 pb-8">
            <div>
              <h3 className="m-0 text-xl font-semibold text-primary">{steps[currentStep]?.label}</h3>
              <p className="mt-1 mb-0 text-sm text-tertiary-foreground">{steps[currentStep]?.description}</p>
            </div>
          </div>

          <div className={cn("flex-1 px-8 flex flex-col gap-6 scrollbar-gutter-stable min-h-0", steps[currentStep]?.label !== 'Data Source' && steps[currentStep]?.label !== 'Filter' && "overflow-y-auto pb-8")} data-testid="wizard-step-content">
            {stepContent}
          </div>

          <div className="shrink-0 pt-4 pb-6 px-8">
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
