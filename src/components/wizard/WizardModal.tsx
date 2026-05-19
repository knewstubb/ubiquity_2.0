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
import { DataSourceStep } from './DataSourceStep';
import { FieldMappingStep } from './FieldMappingStep';
import { OutputConfigStep } from './OutputConfigStep';
import { DeliveryStep } from './DeliveryStep';
import { ReviewStep } from './ReviewStep';
import type { WizardDraft } from '../../models/wizard';
import {
  DEFAULT_FORMAT_OPTIONS,
  DEFAULT_FILTERS,
  DEFAULT_FILE_NAMING_PATTERN,
  DEFAULT_SCHEDULE_CONFIG,
  DEFAULT_NOTIFICATIONS,
} from '../../models/wizard';

interface WizardModalProps {
  connectionId: string;
  connectorName: string;
  editConnectorId?: string;
  onSave: (draft: WizardDraft) => void;
  onClose: () => void;
}

const STEPS = [
  { label: 'Data Source' },
  { label: 'Field Mapping' },
  { label: 'File Configuration' },
  { label: 'Schedule' },
  { label: 'Review' },
];

function createDefaultDraft(
  connectionId: string,
  connectorName: string,
): WizardDraft {
  return {
    connectionId,
    name: connectorName,
    dataType: 'contact',
    transactionalSource: null,
    enrichmentKeyField: null,
    selectedFields: [],
    fileType: 'csv',
    formatOptions: { ...DEFAULT_FORMAT_OPTIONS },
    fileNamingPattern: DEFAULT_FILE_NAMING_PATTERN,
    schedule: null,
    filters: { ...DEFAULT_FILTERS },
    scheduleConfig: { ...DEFAULT_SCHEDULE_CONFIG },
    notifications: { ...DEFAULT_NOTIFICATIONS },
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

  // Build initial draft — from existing connector in edit mode, or defaults
  const initialDraft = useMemo<WizardDraft>(() => {
    if (editConnectorId) {
      const existing = automations.find((c) => c.id === editConnectorId);
      if (existing) {
        return {
          connectionId: existing.connectionId,
          name: existing.name,
          dataType: existing.dataType,
          transactionalSource: existing.transactionalSource ?? null,
          enrichmentKeyField: existing.enrichmentKeyField ?? null,
          selectedFields: [...existing.selectedFields],
          fileType: existing.fileType,
          formatOptions: { ...existing.formatOptions },
          fileNamingPattern: existing.fileNamingPattern,
          schedule: existing.schedule,
          filters: { ...existing.filters },
          scheduleConfig: existing.scheduleConfig ? { ...existing.scheduleConfig } : { ...DEFAULT_SCHEDULE_CONFIG },
          notifications: existing.notifications ? { ...existing.notifications } : { ...DEFAULT_NOTIFICATIONS },
        };
      }
    }
    return createDefaultDraft(connectionId, connectorName);
  }, [editConnectorId, automations, connectionId, connectorName]);

  const [draft, setDraft] = useState<WizardDraft>(initialDraft);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    editConnectorId ? [0, 1, 2, 3, 4] : [],
  );
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Track whether draft has been modified from initial state
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );

  // canProceed validation per step
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: {
        if (!draft.dataType) return false;
        return true;
      }
      case 1:
        return draft.selectedFields.length >= 1;
      case 2:
        return true;
      case 3:
        return draft.schedule !== null;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, draft]);

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
    setCurrentStep(stepIndex);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === 4) {
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
    (patch: Partial<WizardDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  // Step content with real components
  const stepContent = (() => {
    switch (currentStep) {
      case 0:
        return <DataSourceStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 1:
        return <FieldMappingStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 2:
        return <OutputConfigStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 3:
        return <DeliveryStep draft={draft} onUpdate={handleDraftUpdate} />;
      case 4:
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
      <div className="w-[60vw] max-w-[1080px] h-[80vh] bg-background rounded-lg border border-border flex overflow-hidden animate-[slideUp_200ms_ease]">
        {/* Left sidebar */}
        <div className="w-[239px] shrink-0 bg-secondary p-8 flex flex-col gap-12 overflow-y-auto">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center text-primary mb-1">
              <UploadSimple size={56} />
            </div>
            <h2 id="wizard-modal-title" className="m-0 text-base font-bold text-muted-foreground leading-tight">
              Exporter
            </h2>
            <span className="text-[11px] font-medium text-tertiary-foreground uppercase tracking-wider">{connection?.name ?? connectorName}</span>
          </div>
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            orientation="vertical"
          />
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          <CloseButton
            onClick={handleCloseClick}
            aria-label="Close wizard"
            data-testid="wizard-close-button"
            className="absolute top-8 right-8 z-10"
          />

          <div className="flex-1 overflow-y-auto px-8 pt-8 pb-8 flex flex-col gap-8 scrollbar-gutter-stable" data-testid="wizard-step-content">
            {stepContent}
          </div>

          <div className="shrink-0 pt-4 pb-8 px-8">
            <WizardNavButtons
              onBack={handleBack}
              onNext={handleNext}
              onCancel={handleCloseClick}
              canProceed={canProceed}
              isLast={currentStep === 4}
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


