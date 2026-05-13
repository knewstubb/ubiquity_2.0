import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { X, DownloadSimple } from '@phosphor-icons/react';
import { useConnections } from '../../contexts/ConnectionsContext';
import { Button } from '../ui/button';
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
              <DownloadSimple size={56} />
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseClick}
              aria-label="Close wizard"
              data-testid="importer-close-button"
            >
              <X weight="bold" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-10 pb-10 flex flex-col gap-6 scrollbar-gutter-stable [&::-webkit-scrollbar]:w-4 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding">
            {stepContent}
          </div>

          <div className="shrink-0 p-4 px-6 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            <WizardNavButtons
              onBack={handleBack}
              onNext={handleNext}
              onCancel={handleCloseClick}
              canProceed={canProceed}
              isLast={currentStep === lastStepIndex}
              showBack={currentStep > 0}
            />
          </div>
        </div>
      </div>

      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
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


