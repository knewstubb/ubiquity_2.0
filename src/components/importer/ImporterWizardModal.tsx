import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DownloadSimple } from '@phosphor-icons/react';
import { useConnections } from '../../contexts/ConnectionsContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { CloseButton } from '../ui/close-button';
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed';
import { Stepper } from '../composed/stepper';
import { WizardNavButtons } from '../wizard/WizardNavButtons';
import { FileSettingsStep } from './FileSettingsStep';
import { NotificationsStep } from './NotificationsStep';
import { ImportConfigStep } from './ImportConfigStep';
import { ImportMappingStep } from './ImportMappingStep';
import { ImporterReviewStep } from './ImporterReviewStep';
import type { ImporterConfig, ImportDataType } from '../../models/importer';
import {
  DEFAULT_FILE_PATH_CONFIG,
  DEFAULT_CONTACT_CONFIG,
  DEFAULT_TRANSACTIONAL_CONFIG,
  DEFAULT_NOTIFICATION_CONFIG,
  DEFAULT_CSV_FORMAT_CONFIG,
} from '../../models/importer';

interface ImporterWizardModalProps {
  connectionId: string;
  connectorName: string;
  existingConfig?: ImporterConfig;
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
    csvFormat: { ...DEFAULT_CSV_FORMAT_CONFIG },
    notifications: { ...DEFAULT_NOTIFICATION_CONFIG },
    contactConfig: { ...DEFAULT_CONTACT_CONFIG },
    contactMapping: [],
    transactionalConfig: { ...DEFAULT_TRANSACTIONAL_CONFIG },
    transactionalMapping: [],
  };
}

export function ImporterWizardModal({
  connectionId,
  connectorName,
  existingConfig,
  onSave,
  onClose,
}: ImporterWizardModalProps) {
  const { getConnectionById } = useConnections();
  const { users } = usePermissions();
  const connection = getConnectionById(connectionId);

  const basePath = connection?.basePath ?? '/company/base-path/';
  const teamEmails = useMemo(() => users.map((u) => u.email), [users]);

  const initialConfig = useMemo(
    () => {
      if (!existingConfig) return createDefaultConfig(connectionId, connectorName);
      // When editing, strip csvHeaders/csvExampleValues so the mapping step
      // shows the empty state until a new file is uploaded
      const { csvHeaders, csvExampleValues, ...rest } = existingConfig;
      return rest as ImporterConfig;
    },
    [connectionId, connectorName, existingConfig],
  );

  const [config, setConfig] = useState<ImporterConfig>(initialConfig);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showMappingAlert, setShowMappingAlert] = useState(false);
  const [mappingAlertMessage, setMappingAlertMessage] = useState('');
  const [notificationsValid, setNotificationsValid] = useState(true);

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
    const stepLabel = steps[currentStep]?.label;

    // Step 0: File Settings — name is required, and file upload is required for new importers
    if (currentStep === 0) {
      const hasName = config.name.trim().length > 0 && config.dataType !== null;
      const fileRequired = !existingConfig; // Only required when creating new
      if (fileRequired) {
        return hasName && (config.csvHeaders?.length ?? 0) > 0;
      }
      return hasName;
    }

    // Mapping steps — at least one field must be mapped (placeholder: always valid for now)
    if (stepLabel === 'Contact Mapping' || stepLabel === 'Mapping') {
      return true;
    }

    // Transactional Mapping — always allow Next, validate on click
    if (stepLabel === 'Transactional Mapping') {
      return true;
    }

    // Notifications step — failure email is required
    if (stepLabel === 'Notifications') {
      return notificationsValid;
    }

    return true;
  }, [currentStep, config.name, config.dataType, config.csvHeaders, config.notifications, steps, notificationsValid]);

  const disabledReason = useMemo(() => {
    if (canProceed) return undefined;
    const stepLabel = steps[currentStep]?.label;

    if (currentStep === 0) {
      if (!config.name.trim()) return 'Importer name is required';
      if (!config.dataType) return 'Select a data type';
      if (!existingConfig && (config.csvHeaders?.length ?? 0) === 0) return 'Upload a sample CSV file';
    }

    if (stepLabel === 'Notifications') {
      return 'At least one failure notification email is required';
    }

    return 'Complete all required fields to continue';
  }, [canProceed, currentStep, config.name, config.dataType, config.csvHeaders, steps, existingConfig]);

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
    const stepLabel = steps[currentStep]?.label;

    // Validate Transactional Mapping step before proceeding
    if (stepLabel === 'Transactional Mapping') {
      const lookups = config.lookupMappings ?? [];
      const hasCompleteLookup = lookups.some(
        (m) => m.sourceField.trim() !== '' && m.contactField.trim() !== ''
      );
      if (!hasCompleteLookup) {
        setMappingAlertMessage('At least one Lookup Mapping is required. Select a File Column and Contact Table Column to link transactions to contacts.');
        setShowMappingAlert(true);
        return;
      }

      // Check for duplicate target mappings in the field mapping
      const mappedTargets = config.transactionalMapping
        .filter((m) => m.targetField && m.targetField !== '[[Ignore Field]]')
        .map((m) => m.targetField);
      const duplicates = mappedTargets.filter((t, i) => mappedTargets.indexOf(t) !== i);
      if (duplicates.length > 0) {
        setMappingAlertMessage(`Duplicate field mapping detected: "${duplicates[0]}" is mapped more than once. Each UbiQuity field can only be mapped to one file column.`);
        setShowMappingAlert(true);
        return;
      }
    }

    if (currentStep === lastStepIndex) {
      if (existingConfig && !isDirty) {
        onClose();
        return;
      }
      onSave(config);
      toast.success(existingConfig ? 'Changes saved successfully' : 'Automation saved successfully');
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

  const stepDescriptions: Record<string, string> = {
    'File Settings': 'Configure how files are read and where they are stored.',
    'Contact Configuration': 'Set how records are matched, updated, and deduplicated.',
    'Transactional Configuration': 'Set how records are matched, updated, and deduplicated.',
    'Configuration': 'Set how records are matched, updated, and deduplicated.',
    'Contact Mapping': 'Map the columns from your sample file to the columns in your Ubiquity database.',
    'Transactional Mapping': 'Map the columns from your sample file to the columns in your Ubiquity database.',
    'Mapping': 'Map the columns from your sample file to the columns in your Ubiquity database.',
    'Notifications': 'Configure who gets notified about import results.',
    'Review': 'Review your importer configuration before saving.',
  };
  const stepDescription = stepDescriptions[steps[currentStep]?.label] ?? '';

  const stepContent = (() => {
    const stepLabel = steps[currentStep]?.label;

    if (currentStep === 0) {
      return (
        <FileSettingsStep
          config={config}
          basePath={basePath}
          connectionName={connection?.name ?? ''}
          onUpdate={handleConfigUpdate}
          isEditing={!!existingConfig}
        />
      );
    }

    if (stepLabel === 'Notifications') {
      return <NotificationsStep value={config.notifications} onUpdate={(notifications) => handleConfigUpdate({ notifications })} onValidChange={setNotificationsValid} teamEmails={teamEmails} />;
    }
    if (stepLabel === 'Contact Configuration') {
      return <ImportConfigStep type="contact" value={config.contactConfig} onUpdate={(contactConfig) => handleConfigUpdate({ contactConfig })} />;
    }
    if (stepLabel === 'Contact Mapping') {
      return <ImportMappingStep type="contact" value={config.contactMapping} onUpdate={(contactMapping) => handleConfigUpdate({ contactMapping })} csvHeaders={config.csvHeaders} csvExampleValues={config.csvExampleValues} onGoToFileSettings={() => setCurrentStep(0)} />;
    }
    if (stepLabel === 'Transactional Configuration') {
      return <ImportConfigStep type="transactional" value={config.transactionalConfig} onUpdate={(transactionalConfig) => handleConfigUpdate({ transactionalConfig })} />;
    }
    if (stepLabel === 'Transactional Mapping') {
      return <ImportMappingStep type="transactional" value={config.transactionalMapping} onUpdate={(transactionalMapping) => handleConfigUpdate({ transactionalMapping })} csvHeaders={config.csvHeaders} csvExampleValues={config.csvExampleValues} lookupMappings={config.lookupMappings} onLookupUpdate={(lookupMappings) => handleConfigUpdate({ lookupMappings })} onGoToFileSettings={() => setCurrentStep(0)} />;
    }
    if (stepLabel === 'Review') {
      return <ImporterReviewStep config={config} />;
    }

    // Fallback for generic labels before dataType is selected
    if (stepLabel === 'Configuration') return <ImportConfigStep type="contact" value={config.contactConfig} onUpdate={(contactConfig) => handleConfigUpdate({ contactConfig })} />;
    if (stepLabel === 'Mapping') return <ImportMappingStep type="contact" value={config.contactMapping} onUpdate={(contactMapping) => handleConfigUpdate({ contactMapping })} csvHeaders={config.csvHeaders} csvExampleValues={config.csvExampleValues} onGoToFileSettings={() => setCurrentStep(0)} />;

    return null;
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs animate-[fadeIn_200ms_ease]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="importer-wizard-title"
      data-testid="importer-wizard-modal"
    >
      <div className="w-[60vw] min-w-[860px] max-w-[1080px] h-[80vh] bg-background rounded-lg border border-border flex overflow-hidden animate-[slideUp_200ms_ease]">
        {/* Left sidebar */}
        <div className="w-[239px] shrink-0 bg-secondary p-8 flex flex-col gap-12 overflow-y-auto">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center text-primary mb-1">
              <DownloadSimple size={56} />
            </div>
            <h2 id="importer-wizard-title" className="m-0 text-lg font-bold text-muted-foreground leading-snug">
              {existingConfig ? 'Edit Importer' : 'New Importer'}
            </h2>
            <span className="text-[11px] font-medium text-tertiary-foreground uppercase tracking-wider">
              Connector: {connection?.name ?? ''}
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
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* Fixed header — title + close button */}
          <div className="shrink-0 flex items-start justify-between px-8 pt-8 pb-8">
            <div>
              <h3 className="m-0 text-xl font-semibold text-primary">{steps[currentStep]?.label}</h3>
              <p className="mt-1 mb-0 text-sm text-tertiary-foreground">{stepDescription}</p>
            </div>
            <CloseButton
              onClick={handleCloseClick}
              aria-label="Close wizard"
              data-testid="importer-close-button"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-6 scrollbar-gutter-stable">
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
              submitLabel={existingConfig ? (isDirty ? 'Save Changes' : 'Done') : 'Create Importer'}
              disabledReason={disabledReason}
            />
          </div>
        </div>
      </div>

      <AlertDialogComposed
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        intent="destructive"
        title="Discard changes?"
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={onClose}
      >
        Your unsaved changes will be lost. This cannot be undone.
      </AlertDialogComposed>

      <AlertDialogComposed
        open={showMappingAlert}
        onOpenChange={setShowMappingAlert}
        intent="neutral"
        title="Mapping incomplete"
        confirmLabel="OK"
        onConfirm={() => setShowMappingAlert(false)}
        showCancel={false}
      >
        {mappingAlertMessage}
      </AlertDialogComposed>
    </div>
  );
}


