import { useState } from 'react';
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
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-semibold text-foreground m-0">Connectors</h1>
          <p className="text-sm text-tertiary-foreground mt-1 mb-0 font-normal">
            {filteredConnections.length} connection{filteredConnections.length !== 1 ? 's' : ''} · {totalAutomations} automation{totalAutomations !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inverse border-none rounded-md text-sm font-medium cursor-pointer no-underline transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:bg-accent-hover"
          onClick={() => {
            setShowCreateConnection(true);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Connection
        </button>
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
                  className="flex items-center justify-center h-11 border border-dashed border-primary/40 rounded-lg bg-transparent text-primary text-sm font-semibold cursor-pointer transition-colors duration-150 hover:bg-[rgba(20,184,138,0.04)] hover:border-primary"
                  onClick={() => handleAddConnector(connection.id)}
                >
                  + Add Automation
                </button>
              )}
            </ConnectionRow>
          );
        })}
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
              <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded cursor-pointer transition-colors duration-150 hover:bg-secondary" onClick={() => setPendingEditConnectionId(null)}>Cancel</button>
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
    <div className="flex flex-col items-center justify-center pt-[120px] pb-20 px-6 text-center">
      <p className="text-base text-tertiary-foreground m-0 mb-6 max-w-[400px] leading-relaxed">
        An active connection is required before your first automation can be created.
      </p>
      <div className="bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)] rounded-lg py-5 px-8 mb-6 max-w-[480px]">
        <p className="text-sm text-tertiary-foreground m-0 mb-2 leading-relaxed">
          Specific access credentials for your external database will be required to establish a connection to UbiQuity.
        </p>
        <p className="text-sm text-tertiary-foreground m-0 mb-2 leading-relaxed">
          Specific requirements can be found{' '}
          <button
            type="button"
            className="bg-none border-none text-primary text-sm font-medium cursor-pointer p-0 underline hover:text-accent-hover"
            onClick={() => setShowRequirements(true)}
          >
            here
          </button>
        </p>
        <p className="text-sm text-tertiary-foreground m-0 leading-relaxed">
          Speak to your technical admin if you need support.
        </p>
      </div>
      <button type="button" className="px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-primary border-none rounded cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" onClick={onCreateConnection}>
        Create Your First Connection
      </button>

      {showRequirements && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setShowRequirements(false)}>
          <div className="bg-primary text-primary-foreground rounded-lg py-5 px-6 w-[580px] max-w-[90vw] text-left shadow-[0px_1px_4px_0px_rgba(0,0,0,0.12),0px_4px_16px_0px_rgba(0,0,0,0.1),0px_8px_32px_0px_rgba(0,0,0,0.08)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-primary-foreground m-0">Connection Requirements</h3>
              <button
                type="button"
                className="bg-none border-none text-primary-foreground cursor-pointer text-lg p-0 leading-none flex items-center justify-center opacity-80 hover:opacity-100"
                onClick={() => setShowRequirements(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-[rgba(250,250,250,0.9)] m-0 mb-3">Before setting up a connection, ensure you have:</p>
            <ul className="m-0 mb-4 pl-5 flex flex-col gap-1.5 list-disc">
              <li className="text-sm text-[rgba(250,250,250,0.9)] leading-relaxed">Access credentials (hostname, username, password or access key)</li>
              <li className="text-sm text-[rgba(250,250,250,0.9)] leading-relaxed">The file path or bucket location where your data resides</li>
              <li className="text-sm text-[rgba(250,250,250,0.9)] leading-relaxed">Network access from UbiQuity's IP range to your server (firewall/whitelist)</li>
              <li className="text-sm text-[rgba(250,250,250,0.9)] leading-relaxed">A sample file in the expected format (CSV, JSON, or delimited text)</li>
              <li className="text-sm text-[rgba(250,250,250,0.9)] leading-relaxed">Knowledge of the file naming pattern used by your system</li>
            </ul>
            <p className="text-[13px] text-[rgba(250,250,250,0.7)] m-0 leading-relaxed">
              Your technical admin or IT team can provide these details. Each protocol (SFTP, AWS S3, Azure Blob) has specific requirements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}