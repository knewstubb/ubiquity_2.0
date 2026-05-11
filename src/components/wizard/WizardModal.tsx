import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAutomations } from '../../contexts/AutomationsContext';
import { useConnections } from '../../contexts/ConnectionsContext';
import { WizardStepper } from './WizardStepper';
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
          scheduleConfig: { ...DEFAULT_SCHEDULE_CONFIG },
          notifications: { ...DEFAULT_NOTIFICATIONS },
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
        return <ReviewStep draft={draft} />;
      default:
        return null;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-[fadeIn_200ms_ease]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-modal-title"
      data-testid="wizard-modal"
    >
      <div className="w-[60vw] max-w-[1080px] h-[80vh] bg-background rounded-lg shadow-xl flex overflow-hidden animate-[slideUp_200ms_ease]">
        {/* Left sidebar */}
        <div className="w-[239px] shrink-0 bg-secondary p-8 flex flex-col gap-12 overflow-y-auto z-[2] relative shadow-[2px_0_8px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center text-primary mb-1">
              <UploadIcon />
            </div>
            <h2 id="wizard-modal-title" className="m-0 text-base font-bold text-foreground leading-tight">
              {connection?.name ?? connectorName}
            </h2>
            <span className="text-[11px] font-medium text-tertiary-foreground uppercase tracking-wider">Exporter</span>
          </div>
          <WizardStepper
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="flex items-center justify-end py-4 px-6 shrink-0">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent text-tertiary-foreground cursor-pointer transition-all duration-150 hover:bg-background-sunken hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              onClick={handleCloseClick}
              aria-label="Close wizard"
              data-testid="wizard-close-button"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-10 pb-10 flex flex-col gap-8 scrollbar-gutter-stable" data-testid="wizard-step-content">
            {stepContent}
          </div>

          <div className="shrink-0 py-4 px-6 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            <WizardNavButtons
              onBack={handleBack}
              onNext={handleNext}
              canProceed={canProceed}
              isLast={currentStep === 4}
              showBack={currentStep > 0}
            />
          </div>
        </div>
      </div>

      {/* Discard changes confirmation */}
      {showDiscardConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-confirm-title"
          data-testid="discard-confirm"
        >
          <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[420px] animate-[slideUp_200ms_ease]">
            <h2 id="discard-confirm-title" className="m-0 mb-3 text-lg font-semibold text-foreground">
              Discard changes?
            </h2>
            <p className="m-0 mb-6 text-sm text-muted-foreground leading-normal">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="py-2 px-4 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="py-2 px-4 border-none rounded-md bg-destructive text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-danger-hover focus-visible:outline-2 focus-visible:outline-destructive focus-visible:outline-offset-2"
                onClick={onClose}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20V8M8 12l4-4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 6h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
