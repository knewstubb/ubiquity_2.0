import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useConnections } from '../../contexts/ConnectionsContext';
import { Stepper } from '../composed/stepper';
import { WizardNavButtons } from '../wizard/WizardNavButtons';
import { FileSettingsStep } from './FileSettingsStep';
import { NotificationsStep } from './NotificationsStep';
import { ImportConfigStep } from './ImportConfigStep';
import { ImportMappingStep } from './ImportMappingStep';
import { ImporterReviewStep } from './ImporterReviewStep';
import type { ImporterConfig, ImportDataType } from '../../models/importer';
import { DEFAULT_FILE_PATH_CONFIG } from '../../models/importer';

interface ImporterWizardModalProps {
  connectionId: string;
  connectorName: string;
  onSave: (config: ImporterConfig) => void;
  onClose: () => void;
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getStepsForDataType(dataType: ImportDataType | null) {
  if (dataType === 'both') {
    return [
      { label: 'File Settings' },
      { label: 'Contact Configuration' },
      { label: 'Contact Mapping' },
      { label: 'Transactional Configuration' },
      { label: 'Transactional Mapping' },
      { label: 'Notifications' },
      { label: 'Review' },
    ];
  }

  if (dataType === 'contact') {
    return [
      { label: 'File Settings' },
      { label: 'Contact Configuration' },
      { label: 'Contact Mapping' },
      { label: 'Notifications' },
      { label: 'Review' },
    ];
  }

  if (dataType === 'transactional') {
    return [
      { label: 'File Settings' },
      { label: 'Transactional Configuration' },
      { label: 'Transactional Mapping' },
      { label: 'Notifications' },
      { label: 'Review' },
    ];
  }

  // Default before selection — show contact flow
  return [
    { label: 'File Settings' },
    { label: 'Configuration' },
    { label: 'Mapping' },
    { label: 'Notifications' },
    { label: 'Review' },
  ];
}

function createDefaultConfig(
  connectionId: string,
  name: string,
): ImporterConfig {
  return {
    connectionId,
    name,
    dataType: 'contact',
    filePathConfig: {
      ...DEFAULT_FILE_PATH_CONFIG,
      folderName: toKebabCase(name),
    },
    notifications: {},
    contactConfig: {},
    contactMapping: {},
    transactionalConfig: {},
    transactionalMapping: {},
  };
}

export function ImporterWizardModal({
  connectionId,
  connectorName,
  onSave,
  onClose,
}: ImporterWizardModalProps) {
  const { getConnectionById } = useConnections();
  const connection = getConnectionById(connectionId);

  const basePath = connection?.basePath ?? '/company/base-path/';

  const initialConfig = useMemo(
    () => createDefaultConfig(connectionId, connectorName),
    [connectionId, connectorName],
  );

  const [config, setConfig] = useState<ImporterConfig>(initialConfig);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const steps = useMemo(
    () => getStepsForDataType(config.dataType),
    [config.dataType],
  );

  const lastStepIndex = steps.length - 1;

  const isDirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(initialConfig),
    [config, initialConfig],
  );

  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return config.dataType !== null;
    }
    return true;
  }, [currentStep, config.dataType]);

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
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (currentStep === lastStepIndex) {
      onSave(config);
      toast.success('Automation saved successfully');
      onClose();
      return;
    }
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep],
    );
    setCurrentStep(currentStep + 1);
  };

  const handleStepDirty = useCallback(
    (stepIndex: number) => {
      setCompletedSteps((prev) => prev.filter((s) => s <= stepIndex));
    },
    [],
  );

  const handleConfigUpdate = useCallback(
    (patch: Partial<ImporterConfig>) => {
      setConfig((prev) => ({ ...prev, ...patch }));
      handleStepDirty(currentStep);
    },
    [currentStep, handleStepDirty],
  );

  // When dataType changes, clamp currentStep if it exceeds new step count
  useEffect(() => {
    const maxStep = steps.length - 1;
    if (currentStep > maxStep) {
      setCurrentStep(maxStep);
    }
    // Also prune completedSteps beyond new range
    setCompletedSteps((prev) => prev.filter((s) => s <= maxStep));
  }, [steps.length, currentStep]);

  const stepContent = (() => {
    const stepLabel = steps[currentStep]?.label;

    if (currentStep === 0) {
      return (
        <FileSettingsStep
          config={config}
          basePath={basePath}
          connectionName={connection?.name ?? ''}
          onUpdate={handleConfigUpdate}
        />
      );
    }

    if (stepLabel === 'Notifications') {
      return <NotificationsStep />;
    }
    if (stepLabel === 'Contact Configuration') {
      return <ImportConfigStep type="contact" />;
    }
    if (stepLabel === 'Contact Mapping') {
      return <ImportMappingStep type="contact" />;
    }
    if (stepLabel === 'Transactional Configuration') {
      return <ImportConfigStep type="transactional" />;
    }
    if (stepLabel === 'Transactional Mapping') {
      return <ImportMappingStep type="transactional" />;
    }
    if (stepLabel === 'Review') {
      return <ImporterReviewStep />;
    }

    // Fallback for generic labels before dataType is selected
    if (stepLabel === 'Configuration') return <ImportConfigStep type="contact" />;
    if (stepLabel === 'Mapping') return <ImportMappingStep type="contact" />;

    return null;
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-[fadeIn_200ms_ease]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="importer-wizard-title"
      data-testid="importer-wizard-modal"
    >
      <div className="w-[60vw] min-w-[860px] max-w-[1080px] h-[80vh] bg-background rounded-lg shadow-xl flex overflow-hidden animate-[slideUp_200ms_ease]">
        {/* Left sidebar */}
        <div className="w-[239px] shrink-0 bg-secondary p-8 flex flex-col gap-12 overflow-y-auto z-[2] relative shadow-[2px_0_8px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center text-primary mb-1">
              <DownloadIcon />
            </div>
            <h2 id="importer-wizard-title" className="m-0 text-base font-bold text-foreground leading-snug">
              {connectorName}
            </h2>
            <span className="text-[11px] font-medium text-tertiary-foreground uppercase tracking-wider">
              {connection?.name ?? ''}
            </span>
          </div>
          <Stepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            orientation="vertical"
          />
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="flex items-center justify-end py-4 px-6 shrink-0">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent text-tertiary-foreground cursor-pointer transition-colors duration-150 hover:bg-background-sunken hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              onClick={handleCloseClick}
              aria-label="Close wizard"
              data-testid="importer-close-button"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-10 pb-10 flex flex-col gap-6 scrollbar-gutter-stable [&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding">
            {stepContent}
          </div>

          <div className="shrink-0 p-4 px-6 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            <WizardNavButtons
              onBack={handleBack}
              onNext={handleNext}
              canProceed={canProceed}
              isLast={currentStep === lastStepIndex}
              showBack={currentStep > 0}
            />
          </div>
        </div>
      </div>

      {showDiscardConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-confirm-title"
          data-testid="importer-discard-confirm"
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
                className="py-2 px-4 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="py-2 px-4 border-none rounded-md bg-destructive text-sm font-medium text-text-inverse cursor-pointer transition-colors duration-150 hover:bg-danger-hover"
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

function DownloadIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v12M8 12l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 18h16"
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
