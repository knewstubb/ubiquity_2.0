import { useState } from 'react';
import { PlugsConnected, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useConnections } from '../contexts/ConnectionsContext';
import { useAutomations } from '../contexts/AutomationsContext';
import { useAccount } from '../contexts/AccountContext';
import { ConnectionRow } from '../components/dashboard/ConnectionRow';
import { AutomationCard } from '../components/dashboard/AutomationCard';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { CreateConnectionModal } from '../components/dashboard/CreateConnectionModal';
import { InitialModal } from '../components/dashboard/InitialModal';
import { WizardModal } from '../components/wizard/WizardModal';
import { ImporterWizardModal } from '../components/importer/ImporterWizardModal';
import { AutomationSettingsModal } from '../components/dashboard/AutomationSettingsModal';
import { ActivityLogModal } from '../components/dashboard/ActivityLogModal';
import { HistoryModal } from '../components/dashboard/HistoryModal';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { Automation } from '../models/automation';
import type { WizardDraft } from '../models/wizard';
import type { ImporterConfig } from '../models/importer';

interface WizardModalState {
  open: boolean;
  connectionId: string;
  connectorName: string;
  editConnectorId: string | null;
}

interface ImporterModalState {
  open: boolean;
  connectionId: string;
  connectorName: string;
  existingConfig?: ImporterConfig;
}

export default function DashboardPage() {
  const { connections, getConnectionById, addConnection, updateConnection, deleteConnection } = useConnections();
  const { automations, addAutomation, addAutomationDirect, updateAutomation, toggleAutomationStatus, deleteAutomation } =
    useAutomations();
  const { selectedAccountId } = useAccount();

  const filteredConnections = connections.filter((c) => c.accountId === selectedAccountId);

  const totalAutomations = automations.filter((c) =>
    filteredConnections.some((conn) => conn.id === c.connectionId),
  ).length;

  const [showCreateConnection, setShowCreateConnection] = useState(false);
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  const [pendingEditConnectionId, setPendingEditConnectionId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Automation | null>(null);
  const [pendingDeleteConnectionId, setPendingDeleteConnectionId] = useState<string | null>(null);
  const [initialModalConnectionId, setInitialModalConnectionId] = useState<string | null>(null);
  const [wizardModalState, setWizardModalState] = useState<WizardModalState | null>(null);
  const [importerModalState, setImporterModalState] = useState<ImporterModalState | null>(null);
  const [settingsConnectorId, setSettingsConnectorId] = useState<string | null>(null);
  const [activityLogConnectorId, setActivityLogConnectorId] = useState<string | null>(null);
  const [historyConnectorId, setHistoryConnectorId] = useState<string | null>(null);

  // --- Add Connector flow (InitialModal → WizardModal or ImporterWizardModal) ---
  function handleAddConnector(connectionId: string) {
    setInitialModalConnectionId(connectionId);
  }

  function handleInitialModalProceed(name: string, direction: 'import' | 'export') {
    if (!initialModalConnectionId) return;

    if (direction === 'export') {
      setWizardModalState({
        open: true,
        connectionId: initialModalConnectionId,
        connectorName: name,
        editConnectorId: null,
      });
    } else {
      setImporterModalState({
        open: true,
        connectionId: initialModalConnectionId,
        connectorName: name,
      });
    }

    setInitialModalConnectionId(null);
  }

  function handleInitialModalClose() {
    setInitialModalConnectionId(null);
  }

  // --- Edit flow (WizardModal directly, skip InitialModal) ---
  function handleEdit(connectorId: string) {
    const connector = automations.find((c) => c.id === connectorId);
    if (!connector) return;

    if (connector.direction === 'import') {
      setImporterModalState({
        open: true,
        connectionId: connector.connectionId,
        connectorName: connector.name,
        existingConfig: connector.importerConfig ?? undefined,
      });
    } else {
      setWizardModalState({
        open: true,
        connectionId: connector.connectionId,
        connectorName: connector.name,
        editConnectorId: connector.id,
      });
    }
  }

  // --- WizardModal save ---
  function handleWizardSave(draft: WizardDraft) {
    if (wizardModalState?.editConnectorId) {
      updateAutomation(wizardModalState.editConnectorId, draft);
    } else {
      addAutomation(draft);
    }
  }

  function handleWizardClose() {
    setWizardModalState(null);
  }

  // --- ImporterWizardModal save ---
  function handleImporterSave(config: ImporterConfig) {
    const now = new Date().toISOString();
    const dataType = config.dataType === 'both' ? 'transactional_with_contact' as const
      : config.dataType === 'transactional' ? 'transactional' as const
      : 'contact' as const;

    const connector: Automation = {
      id: crypto.randomUUID(),
      connectionId: config.connectionId,
      name: config.name,
      direction: 'import',
      dataType,
      selectedFields: [],
      fileType: 'csv',
      formatOptions: { delimiter: ',', includeHeader: true, dateFormat: 'ISO8601', timezone: 'Pacific/Auckland' },
      fileNamingPattern: config.filePathConfig.fileNamePattern || `${config.name.toLowerCase().replace(/\s+/g, '_')}_{date}.csv`,
      schedule: 'daily',
      filters: { combinator: 'AND', rules: [], groups: [] },
      status: 'active',
      createdAt: now,
      updatedAt: now,
      importerConfig: config,
    };

    addAutomationDirect(connector);
  }

  function handleImporterClose() {
    setImporterModalState(null);
  }

  // --- Delete flow ---
  function handleDeleteRequest(connector: Automation) {
    setPendingDelete(connector);
  }

  function handleDeleteConfirm() {
    if (pendingDelete) {
      deleteAutomation(pendingDelete.id);
      setPendingDelete(null);
    }
  }

  function handleDeleteCancel() {
    setPendingDelete(null);
  }

  // Resolve the connection for InitialModal
  const initialModalConnection = initialModalConnectionId
    ? getConnectionById(initialModalConnectionId)
    : undefined;

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] py-7 px-6 bg-background">
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/audiences/databases">Audience</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Connectors</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-foreground m-0">Connectors</h1>
          <p className="text-sm text-tertiary-foreground mt-1 mb-0 font-normal">
            {filteredConnections.length} connection{filteredConnections.length !== 1 ? 's' : ''} · {totalAutomations} automation{totalAutomations !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        {filteredConnections.length === 0 ? (
          <EmptyConnectionState onCreateConnection={() => setShowCreateConnection(true)} />
        ) : filteredConnections.map((connection) => {
          const childConnectors = automations.filter(
            (c) => c.connectionId === connection.id,
          );

          return (
            <ConnectionRow
              key={connection.id}
              connection={connection}
              connectors={childConnectors}
              onAddConnector={handleAddConnector}
              onEditConnection={(id) => setPendingEditConnectionId(id)}
              onDeleteConnection={(id) => setPendingDeleteConnectionId(id)}
            >
              {childConnectors.map((connector) => (
                <AutomationCard
                  key={connector.id}
                  connector={connector}
                  connectionError={connection.status === 'error'}
                  onToggleStatus={() => toggleAutomationStatus(connector.id)}
                  onViewSettings={() => setSettingsConnectorId(connector.id)}
                  onEditWizard={() => handleEdit(connector.id)}
                  onDelete={() => handleDeleteRequest(connector)}
                  onActivityLog={() => setActivityLogConnectorId(connector.id)}
                  onHistory={() => setHistoryConnectorId(connector.id)}
                />
              ))}
              {!connection.status.includes('error') && (
                <button
                  type="button"
                  className="flex items-center justify-center h-11 border border-dashed border-primary/40 rounded-lg bg-surface text-primary text-base font-semibold cursor-pointer transition-colors duration-150 hover:bg-accent/40 hover:border-primary"
                  onClick={() => handleAddConnector(connection.id)}
                >
                  + Add Automation
                </button>
              )}
            </ConnectionRow>
          );
        })}
        {filteredConnections.length > 0 && (
          <button
            type="button"
            className="flex items-center justify-center border border-dashed border-primary/40 rounded-lg bg-surface/50 text-primary text-base font-semibold cursor-pointer transition-colors duration-150 hover:bg-accent/40 hover:border-primary p-4 min-h-[64px]"
            onClick={() => setShowCreateConnection(true)}
          >
            + Add New Connection
          </button>
        )}
      </div>

      {/* CreateConnectionModal — shown when user clicks "New Connection" */}
      {showCreateConnection && (
        <CreateConnectionModal
          onClose={() => setShowCreateConnection(false)}
          onCreate={(connection) => {
            addConnection(connection);
            setShowCreateConnection(false);
          }}
        />
      )}

      {/* Edit Connection Warning — shown before opening the edit modal */}
      {pendingEditConnectionId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={() => setPendingEditConnectionId(null)}>
          <div className="bg-background rounded-lg shadow-xl p-6 w-[400px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground m-0 mb-2">Edit Connection</h3>
            <p className="text-sm text-muted-foreground m-0 mb-5 leading-relaxed">
              Changes to a connection may affect all linked automations. Proceed only if you understand the impact.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground bg-transparent border-none rounded cursor-pointer transition-colors duration-150 hover:bg-accent hover:text-accent-foreground" onClick={() => setPendingEditConnectionId(null)}>Cancel</button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-warning border-none rounded cursor-pointer transition-colors duration-150 hover:bg-warning-foreground"
                onClick={() => {
                  setEditingConnection(pendingEditConnectionId);
                  setPendingEditConnectionId(null);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EditConnectionModal — shown when user clicks "Edit Connection" from meatball menu */}
      {editingConnection && getConnectionById(editingConnection) && (
        <CreateConnectionModal
          editConnection={getConnectionById(editingConnection)}
          onClose={() => setEditingConnection(null)}
          onCreate={(connection) => {
            updateConnection(editingConnection, connection);
            setEditingConnection(null);
          }}
        />
      )}

      {/* InitialModal — shown when user clicks "+ Add Connector" */}
      {initialModalConnection && (
        <InitialModal
          connection={initialModalConnection}
          onProceed={handleInitialModalProceed}
          onClose={handleInitialModalClose}
        />
      )}

      {/* WizardModal — shown after InitialModal proceed or on edit */}
      {wizardModalState && (
        <WizardModal
          connectionId={wizardModalState.connectionId}
          connectorName={wizardModalState.connectorName}
          editConnectorId={wizardModalState.editConnectorId ?? undefined}
          onSave={handleWizardSave}
          onClose={handleWizardClose}
        />
      )}

      {/* ImporterWizardModal — shown when user selects Importer */}
      {importerModalState && (
        <ImporterWizardModal
          connectionId={importerModalState.connectionId}
          connectorName={importerModalState.connectorName}
          existingConfig={importerModalState.existingConfig}
          onSave={handleImporterSave}
          onClose={handleImporterClose}
        />
      )}

      {/* Delete automation confirmation */}
      {pendingDelete && (
        <DeleteConfirmModal
          objectType="Automation"
          objectName={pendingDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Delete connection confirmation */}
      {pendingDeleteConnectionId && (() => {
        const conn = getConnectionById(pendingDeleteConnectionId);
        if (!conn) return null;
        return (
          <DeleteConfirmModal
            objectType="Connection"
            objectName={conn.name}
            onConfirm={() => {
              deleteConnection(pendingDeleteConnectionId);
              setPendingDeleteConnectionId(null);
            }}
            onCancel={() => setPendingDeleteConnectionId(null)}
          />
        );
      })()}

      {/* Automation Settings Modal — shown when user clicks an automation card */}
      {settingsConnectorId && (() => {
        const connector = automations.find((c) => c.id === settingsConnectorId);
        const connection = connector ? getConnectionById(connector.connectionId) : undefined;
        if (!connector || !connection) return null;
        return (
          <AutomationSettingsModal
            connector={connector}
            connection={connection}
            onClose={() => setSettingsConnectorId(null)}
            onEdit={() => {
              setSettingsConnectorId(null);
              setTimeout(() => handleEdit(connector.id), 150);
            }}
          />
        );
      })()}

      {/* Activity Log Modal */}
      {activityLogConnectorId && (() => {
        const connector = automations.find((c) => c.id === activityLogConnectorId);
        if (!connector) return null;
        return (
          <ActivityLogModal
            connector={connector}
            onClose={() => setActivityLogConnectorId(null)}
          />
        );
      })()}

      {/* History Modal */}
      {historyConnectorId && (() => {
        const connector = automations.find((c) => c.id === historyConnectorId);
        if (!connector) return null;
        return (
          <HistoryModal
            connector={connector}
            onClose={() => setHistoryConnectorId(null)}
          />
        );
      })()}
    </div>
  );
}

/* ── Empty state when no connections exist ── */

function EmptyConnectionState({ onCreateConnection }: { onCreateConnection: () => void }) {
  const [showRequirements, setShowRequirements] = useState(false);

  return (
    <div className="flex flex-col items-center pt-[20vh] px-6 text-center">
      {/* Visual anchor */}
      <div className="text-zinc-300 dark:text-zinc-600 mb-4">
        <PlugsConnected size={48} weight="light" />
      </div>

      {/* Headline */}
      <h2 className="text-xl font-medium text-foreground m-0 mb-2">
        Connect your data source
      </h2>

      {/* Supporting line */}
      <p className="text-sm text-muted-foreground m-0 mb-6 max-w-[360px]">
        Automations require an active connection to your database or file storage.
      </p>

      {/* CTA */}
      <Button size="lg" className="mb-4" onClick={onCreateConnection}>
        Create Your First Connection
      </Button>

      {/* Help links */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Popover open={showRequirements} onOpenChange={setShowRequirements}>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              className="p-0 h-auto font-medium"
            >
              View connection requirements
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px]" sideOffset={8}>
            <div className="grid gap-3">
              <h4 className="text-lg font-bold leading-tight">Connection Requirements</h4>
              <p className="text-sm text-muted-foreground m-0">
                Before setting up a connection, ensure you have:
              </p>
              <ul className="m-0 pl-5 flex flex-col gap-1.5 list-disc">
                <li className="text-sm text-muted-foreground leading-relaxed">Access credentials (hostname, username, password or access key)</li>
                <li className="text-sm text-muted-foreground leading-relaxed">The file path or bucket location where your data resides</li>
                <li className="text-sm text-muted-foreground leading-relaxed">Network access from UbiQuity's IP range to your server (firewall/whitelist)</li>
                <li className="text-sm text-muted-foreground leading-relaxed">A sample file in the expected format (CSV, JSON, or delimited text)</li>
                <li className="text-sm text-muted-foreground leading-relaxed">Knowledge of the file naming pattern used by your system</li>
              </ul>
              <div className="bg-emerald-50 rounded-md p-3 text-sm text-emerald-800">
                Your technical admin or IT team can provide these details. Each protocol (SFTP, AWS S3, Azure Blob) has specific requirements.
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="ghost" className="h-7 text-sm" onClick={() => setShowRequirements(false)}>
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <span className="text-border">·</span>
        <span className="text-tertiary-foreground">Need help? Talk to your IT team</span>
      </div>
    </div>
  );
}