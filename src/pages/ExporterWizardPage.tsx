import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useConnections } from '../contexts/ConnectionsContext';
import { useAutomations } from '../contexts/AutomationsContext';
import { WizardModal } from '../components/wizard/WizardModal';
import { WizardTopBar } from '../components/layout/WizardTopBar';
import type { WizardDraft, ExporterWizardDraft } from '../models/wizard';

export default function ExporterWizardPage() {
  const { connectionId, automationId } = useParams<{ connectionId?: string; automationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getConnectionById } = useConnections();
  const { automations, addAutomation, updateAutomation } = useAutomations();

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

  function handleSave(exporterDraft: ExporterWizardDraft) {
    const draft: WizardDraft = {
      connectionId: exporterDraft.connectionId,
      name: exporterDraft.name,
      dataType: exporterDraft.selectedSources[0] ?? 'contact',
      selectedSources: exporterDraft.selectedSources,
      transactionalSource: exporterDraft.transactionalSource,
      enrichmentKeyField: null,
      selectedFields: exporterDraft.selectedFields,
      fileType: 'csv',
      formatOptions: exporterDraft.formatOptions,
      fileNamingPattern: `${exporterDraft.fileNamingPrefix}{timestamp}.csv`,
      schedule: exporterDraft.schedule.frequency as WizardDraft['schedule'],
      filters: exporterDraft.filters,
      scheduleConfig: {
        frequency: exporterDraft.schedule.frequency,
        starting: '',
        every: '1',
        at: '',
        weeklyDays: exporterDraft.schedule.weeklyDays,
        monthlyPattern: 'day',
        monthlyOrdinal: '1st',
        monthlyDayOfWeek: 'Monday',
        monthlyDates: [],
      },
      notifications: {
        emails: exporterDraft.notifications.failureEmails,
        successEnabled: exporterDraft.notifications.successEnabled,
        failureEnabled: true,
      },
    };

    if (isEditing && automationId) {
      updateAutomation(automationId, draft);
    } else {
      addAutomation(draft);
    }
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
        <WizardModal
          connectionId={resolvedConnectionId}
          connectorName={connectorName}
          editConnectorId={automationId}
          onSave={handleSave}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
