import { useState } from 'react';
import { useConnections } from '../contexts/ConnectionsContext';
import { useConnectors } from '../contexts/ConnectorsContext';
import { useAccount } from '../contexts/AccountContext';
import { ConnectionRow } from '../components/dashboard/ConnectionRow';
import { ConnectorCard } from '../components/dashboard/ConnectorCard';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { CreateConnectionModal } from '../components/dashboard/CreateConnectionModal';
import { InitialModal } from '../components/dashboard/InitialModal';
import { WizardModal } from '../components/wizard/WizardModal';
import { ImporterWizardModal } from '../components/importer/ImporterWizardModal';
import type { Connector } from '../models/connector';
import type { WizardDraft } from '../models/wizard';
import type { ImporterConfig } from '../models/importer';
import styles from './DashboardPage.module.css';

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
  const { connections, getConnectionById, addConnection } = useConnections();
  const { connectors, addConnector, updateConnector, toggleConnectorStatus, deleteConnector } =
    useConnectors();
  const { selectedAccountId } = useAccount();

  const filteredConnections = connections.filter((c) => c.accountId === selectedAccountId);

  const [showCreateConnection, setShowCreateConnection] = useState(false);
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Connector | null>(null);
  const [initialModalConnectionId, setInitialModalConnectionId] = useState<string | null>(null);
  const [wizardModalState, setWizardModalState] = useState<WizardModalState | null>(null);
  const [importerModalState, setImporterModalState] = useState<ImporterModalState | null>(null);

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
    const connector = connectors.find((c) => c.id === connectorId);
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
      updateConnector(wizardModalState.editConnectorId, draft);
    } else {
      addConnector(draft);
    }
  }

  function handleWizardClose() {
    setWizardModalState(null);
  }

  // --- ImporterWizardModal save ---
  function handleImporterSave(_config: ImporterConfig) {
    // Prototype: just close the modal. Real implementation would persist.
  }

  function handleImporterClose() {
    setImporterModalState(null);
  }

  // --- Delete flow ---
  function handleDeleteRequest(connector: Connector) {
    setPendingDelete(connector);
  }

  function handleDeleteConfirm() {
    if (pendingDelete) {
      deleteConnector(pendingDelete.id);
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
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Integrations</h1>
        <button
          type="button"
          className={styles.newButton}
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

      <div className={styles.connectionList}>
        {filteredConnections.map((connection) => {
          const childConnectors = connectors.filter(
            (c) => c.connectionId === connection.id,
          );

          return (
            <ConnectionRow
              key={connection.id}
              connection={connection}
              connectors={childConnectors}
              onAddConnector={handleAddConnector}
              onEditConnection={(id) => setEditingConnection(id)}
            >
              {childConnectors.map((connector) => (
                <ConnectorCard
                  key={connector.id}
                  connector={connector}
                  connectionError={connection.status === 'error'}
                  onToggleStatus={() => toggleConnectorStatus(connector.id)}
                  onEdit={() => handleEdit(connector.id)}
                  onDelete={() => handleDeleteRequest(connector)}
                />
              ))}
              {!connection.status.includes('error') && (
                <button
                  type="button"
                  className={styles.addAutomationCard}
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

      {/* EditConnectionModal — shown when user clicks "Edit Connection" from meatball menu */}
      {editingConnection && getConnectionById(editingConnection) && (
        <CreateConnectionModal
          editConnection={getConnectionById(editingConnection)}
          onClose={() => setEditingConnection(null)}
          onCreate={(connection) => {
            // Prototype: replace in local state. Real implementation would call update API.
            addConnection(connection);
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

      {/* Delete confirmation */}
      {pendingDelete && (
        <DeleteConfirmModal
          connectorName={pendingDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
