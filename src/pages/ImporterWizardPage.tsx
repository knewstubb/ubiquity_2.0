import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useConnections } from '../contexts/ConnectionsContext';
import { useAutomations } from '../contexts/AutomationsContext';
import { ImporterWizardModal } from '../components/importer/ImporterWizardModal';
import { WizardTopBar } from '../components/layout/WizardTopBar';
import type { ImporterConfig } from '../models/importer';
import type { Automation } from '../models/automation';

export default function ImporterWizardPage() {
  const { connectionId, automationId } = useParams<{ connectionId?: string; automationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getConnectionById } = useConnections();
  const { automations, addAutomationDirect, deleteAutomation } = useAutomations();

  // Derive props from route params + location state
  const isEditing = !!automationId;
  const automation = isEditing ? automations.find((a) => a.id === automationId) : undefined;

  const resolvedConnectionId = automation?.connectionId ?? connectionId ?? '';
  const connection = getConnectionById(resolvedConnectionId);

  // connectorName: from location state (passed during navigation), or from existing automation name
  const connectorName = (location.state as { connectorName?: string })?.connectorName
    ?? automation?.name
    ?? connection?.name
    ?? '';

  // For editing, pass the existing importer config
  const existingConfig = useMemo(() => {
    if (!isEditing || !automation?.importerConfig) return undefined;
    return {
      ...automation.importerConfig,
      transactionalTable: automation.transactionalSource ?? automation.importerConfig.transactionalTable,
    };
  }, [isEditing, automation]);

  function handleSave(config: ImporterConfig) {
    const now = new Date().toISOString();
    const dataType = config.dataType === 'both' ? 'transactional_with_contact' as const
      : config.dataType === 'transactional' ? 'transactional' as const
      : 'contact' as const;

    if (isEditing && automationId) {
      const existingConnector = automations.find((c) => c.id === automationId);
      if (existingConnector) {
        const updated: Automation = {
          ...existingConnector,
          name: config.name,
          dataType,
          ...(config.transactionalTable ? { transactionalSource: config.transactionalTable } : { transactionalSource: undefined }),
          fileNamingPattern: config.filePathConfig.fileNamePattern || existingConnector.fileNamingPattern,
          updatedAt: now,
          importerConfig: config,
        };
        deleteAutomation(existingConnector.id);
        addAutomationDirect(updated);
      }
    } else {
      const connector: Automation = {
        id: crypto.randomUUID(),
        connectionId: config.connectionId,
        name: config.name,
        direction: 'import',
        dataType,
        ...(config.transactionalTable ? { transactionalSource: config.transactionalTable } : {}),
        selectedFields: [],
        fileType: 'csv',
        formatOptions: { delimiter: ',', includeHeader: true, dateFormat: 'ISO8601', timezone: 'Pacific/Auckland' },
        fileNamingPattern: config.filePathConfig.fileNamePattern || `${config.name.toLowerCase().replace(/\s+/g, '_')}_{date}.csv`,
        schedule: 'daily',
        filters: { combinator: 'AND', rules: [], groups: [] },
        status: 'paused',
        createdAt: now,
        updatedAt: now,
        importerConfig: config,
      };
      addAutomationDirect(connector);
    }

    toast.success(isEditing ? 'Changes saved successfully' : 'Automation saved successfully');
  }

  function handleClose() {
    navigate('/');
  }

  if (!resolvedConnectionId) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <WizardTopBar />
      <div className="flex-1 flex min-h-0">
        <ImporterWizardModal
          connectionId={resolvedConnectionId}
          connectorName={connectorName}
          existingConfig={existingConfig}
          onSave={handleSave}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
