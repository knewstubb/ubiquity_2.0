import { useState, useEffect, useCallback, useMemo } from 'react';
import { useConnections } from '../../contexts/ConnectionsContext';
import { WizardStepper } from '../wizard/WizardStepper';
import { WizardNavButtons } from '../wizard/WizardNavButtons';
import { FileSettingsStep } from './FileSettingsStep';
import { NotificationsStep } from './NotificationsStep';
import { ImportConfigStep } from './ImportConfigStep';
import { ImportMappingStep } from './ImportMappingStep';
import { ImporterReviewStep } from './ImporterReviewStep';
import type { ImporterConfig, ImportDataType } from '../../models/importer';
import { DEFAULT_FILE_PATH_CONFIG } from '../../models/importer';
import styles from './ImporterWizardModal.module.css';

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
      onClose();
      return;
    }
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep],
    );
    setCurrentStep(currentStep + 1);
  };

  const handleConfigUpdate = useCallback(
    (patch: Partial<ImporterConfig>) => {
      setConfig((prev) => ({ ...prev, ...patch }));
    },
    [],
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
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="importer-wizard-title"
      data-testid="importer-wizard-modal"
    >
      <div className={styles.modal}>
        {/* Left sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarIcon}>
              <DownloadIcon />
            </div>
            <h2 id="importer-wizard-title" className={styles.sidebarConnectionName}>
              {connectorName}
            </h2>
            <span className={styles.sidebarLabel}>Importer</span>
          </div>
          <WizardStepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Right content area */}
        <div className={styles.contentArea}>
          <div className={styles.contentHeader}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCloseClick}
              aria-label="Close wizard"
              data-testid="importer-close-button"
            >
              <CloseIcon />
            </button>
          </div>

          <div className={styles.contentBody}>
            {stepContent}
          </div>

          <div className={styles.navBar}>
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
          className={styles.confirmBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-confirm-title"
          data-testid="importer-discard-confirm"
        >
          <div className={styles.confirmDialog}>
            <h2 id="discard-confirm-title" className={styles.confirmTitle}>
              Discard changes?
            </h2>
            <p className={styles.confirmMessage}>
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setShowDiscardConfirm(false)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className={styles.confirmDiscard}
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
