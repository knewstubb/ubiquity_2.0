import { PencilSimple } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import type { ExporterWizardDraft, EventSource } from '../../models/wizard';
import type { ExportDataType } from '../../models/automation';
import { resolveColumnName, resolveTimestamp } from '../../utils/exporter-utils';
import { formatSourceConfigSummary } from '../../utils/source-config-utils';

interface ReviewStepProps {
  draft: ExporterWizardDraft;
  onEditStep?: (step: number) => void;
}

const EXPORTER_TYPE_LABELS: Record<string, string> = {
  contact_transactional: 'Contact / Transactional',
  event_based: 'Event-based',
};

const DATA_SOURCE_LABELS: Record<ExportDataType, string> = {
  contact: 'Contacts',
  transactional: 'Transactional',
  mailout: 'Mailout Data',
};

const EVENT_SOURCE_LABELS: Record<EventSource, string> = {
  mailout_sends: 'Mailouts from this send',
  campaign_events: 'All event channels from this campaign',
  failed_sends: 'All failed sends from this send',
};

const FREQUENCY_LABELS: Record<string, string> = {
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Returns a human-readable schedule summary string.
 */
function formatScheduleSummary(schedule: ExporterWizardDraft['schedule']): string {
  const freq = FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency;

  if (schedule.frequency === 'weekly') {
    const days = DAY_NAMES.filter((_, i) => schedule.weeklyDays[i]).join(', ');
    return days ? `${freq} on ${days}` : freq;
  }

  if (schedule.frequency === 'monthly') {
    const days = schedule.monthlyDays.join(', ');
    return days ? `${freq} on day${schedule.monthlyDays.length > 1 ? 's' : ''} ${days}` : freq;
  }

  return freq;
}

/**
 * Returns the step index for each section's edit link based on the exporter type.
 * Contact/Transactional: Type(0) → DataSource(1) → FieldMapping(2) → FileConfig(3) → Schedule(4) → Notifications(5) → Review(6)
 * Event-based: Type(0) → EventSource(1) → FieldMapping(2) → FileConfig(3) → Schedule(4) → Notifications(5) → Review(6)
 */
function getStepIndices() {
  return {
    type: 0,
    source: 1,       // DataSource or EventSource
    fields: 2,       // FieldMapping
    fileConfig: 3,   // OutputConfigStep
    schedule: 4,     // ScheduleStep
    notifications: 5, // NotificationsStep
  };
}

export function ReviewStep({ draft, onEditStep }: ReviewStepProps) {
  const steps = getStepIndices();
  const isEventBased = draft.exporterType === 'event_based';
  const timestamp = resolveTimestamp(new Date());
  const filenamePreview = draft.fileNamingPrefix
    ? `${draft.fileNamingPrefix}${timestamp}.csv`
    : `${timestamp}.csv`;

  return (
    <div className="flex flex-col gap-6" data-testid="review-step">

      {/* Exporter Type */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Exporter Type</h4>
          {onEditStep && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(steps.type)}>
              <PencilSimple size={12} weight="bold" className="mr-1" />Edit
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="text-sm text-foreground font-medium">
              {draft.exporterType ? EXPORTER_TYPE_LABELS[draft.exporterType] : 'Not selected'}
            </span>
          </div>
        </div>
      </div>

      {/* Sources — uses formatSourceConfigSummary when sourceConfig is available */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">
            {isEventBased ? 'Event Sources' : 'Data Sources'}
          </h4>
          {onEditStep && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(steps.source)}>
              <PencilSimple size={12} weight="bold" className="mr-1" />Edit
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {draft.sourceConfig ? (
            <div className="flex justify-between py-0.5">
              <span className="text-sm text-foreground">
                {formatSourceConfigSummary(draft.sourceConfig)}
              </span>
            </div>
          ) : isEventBased ? (
            draft.selectedEventSources.length > 0 ? (
              draft.selectedEventSources.map((source) => (
                <div key={source} className="flex justify-between py-0.5">
                  <span className="text-sm text-foreground">{EVENT_SOURCE_LABELS[source]}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground m-0">No event sources selected</p>
            )
          ) : (
            <>
              {draft.selectedSources.length > 0 ? (
                draft.selectedSources.map((source) => (
                  <div key={source} className="flex justify-between py-0.5">
                    <span className="text-sm text-foreground">{DATA_SOURCE_LABELS[source]}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground m-0">No sources selected</p>
              )}
              {draft.selectedSources.length > 1 && (
                <div className="flex justify-between py-0.5 mt-1">
                  <span className="text-sm text-muted-foreground">Join Key</span>
                  <span className="text-sm text-foreground font-medium">Email Address</span>
                </div>
              )}
            </>
          )}
          {!isEventBased && draft.name && (
            <div className="flex justify-between py-0.5">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm text-foreground font-medium">{draft.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Field Mapping */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Fields</h4>
          {onEditStep && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(steps.fields)}>
              <PencilSimple size={12} weight="bold" className="mr-1" />Edit
            </Button>
          )}
        </div>
        {draft.selectedFields.length > 0 ? (
          <ol className="list-none m-0 p-0 flex flex-col gap-1">
            {draft.selectedFields.map((field, index) => {
              const columnName = resolveColumnName(field.key, draft.columnRenames, field.label);
              const isRenamed = columnName !== field.label;
              return (
                <li key={field.key} className="text-sm text-foreground">
                  <span className="text-muted-foreground mr-2 min-w-5 inline-block">{index + 1}.</span>
                  <span>{columnName}</span>
                  {isRenamed && (
                    <span className="text-xs text-muted-foreground ml-2">(from: {field.label})</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground m-0">No fields selected</p>
        )}
      </div>

      {/* File Configuration */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Output Configuration</h4>
          {onEditStep && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(steps.fileConfig)}>
              <PencilSimple size={12} weight="bold" className="mr-1" />Edit
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">File Name</span>
            <span className="text-sm text-foreground font-medium font-mono">{filenamePreview}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Prefix</span>
            <span className="text-sm text-foreground font-medium">{draft.fileNamingPrefix || '(none)'}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Format</span>
            <span className="text-sm text-foreground font-medium">CSV</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Timezone</span>
            <span className="text-sm text-foreground font-medium">{draft.formatOptions.timezone}</span>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Schedule</h4>
          {onEditStep && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(steps.schedule)}>
              <PencilSimple size={12} weight="bold" className="mr-1" />Edit
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Frequency</span>
            <span className="text-sm text-foreground font-medium">{formatScheduleSummary(draft.schedule)}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Notifications</h4>
          {onEditStep && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(steps.notifications)}>
              <PencilSimple size={12} weight="bold" className="mr-1" />Edit
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Failure Emails</span>
            <span className="text-sm text-foreground font-medium">
              {draft.notifications.failureEmails.length > 0
                ? draft.notifications.failureEmails.join(', ')
                : 'None configured'}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Success Notifications</span>
            <span className="text-sm text-foreground font-medium">
              {draft.notifications.successEnabled
                ? draft.notifications.successEmails.join(', ') || 'Enabled (no emails)'
                : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">No File Alerts</span>
            <span className="text-sm text-foreground font-medium">
              {draft.notifications.noFileAlertEnabled
                ? draft.notifications.noFileAlertEmails.join(', ') || 'Enabled (no emails)'
                : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
