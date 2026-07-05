import { TruncatedText } from '../shared/TruncatedText';
import type { ExporterWizardDraft, EventSource } from '../../models/wizard';
import { resolveColumnName, resolveTimestamp } from '../../utils/exporter-utils';
import { formatSourceConfigSummary } from '../../utils/source-config-utils';

interface ReviewStepProps {
  draft: ExporterWizardDraft;
  onEditStep?: (step: number) => void;
}

function getSourceLabel(source: string): string {
  if (source === 'mailout') return 'Mailout';
  if (source === 'contacts') return 'Contact';
  if (source === 'messages') return 'Message';
  if (source.startsWith('txn:')) return source.slice(4); // table name
  return source.charAt(0).toUpperCase() + source.slice(1);
}

const EVENT_SOURCE_LABELS: Record<EventSource, string> = {
  mailout_sends: 'Mailouts from this send',
  campaign_events: 'All event channels from this campaign',
  failed_sends: 'All failed sends from this send',
};

const FREQUENCY_LABELS: Record<string, string> = {
  '10_minute': '10 Minute',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatScheduleSummary(schedule: ExporterWizardDraft['schedule']): string {
  const freq = FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency;

  if (schedule.frequency === 'weekly') {
    const days = DAY_NAMES.filter((_, i) => schedule.weeklyDays[i]).join(', ');
    return days ? `${freq} on ${days}` : freq;
  }

  return freq;
}

export function ReviewStep({ draft }: ReviewStepProps) {
  const isEventBased = draft.exporterType === 'event_based';
  const timestamp = resolveTimestamp(new Date());
  const filenamePreview = draft.fileNamingPrefix
    ? `${draft.fileNamingPrefix}${timestamp}.csv`
    : `${timestamp}.csv`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl" data-testid="review-step">

      {/* Data Sources */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">
            {isEventBased ? 'Event Sources' : 'Data Sources'}
          </h4>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          {draft.sourceConfig ? (
            <>
              <span className="text-sm text-muted-foreground">Source</span>
              <span className="text-sm text-foreground font-medium">
                {formatSourceConfigSummary(draft.sourceConfig)}
              </span>
            </>
          ) : isEventBased ? (
            draft.selectedEventSources.length > 0 ? (
              draft.selectedEventSources.map((source) => (
                <span key={source} className="text-sm text-foreground col-span-2">{EVENT_SOURCE_LABELS[source]}</span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground col-span-2">No event sources selected</span>
            )
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Source</span>
              <span className="text-sm text-foreground font-medium">Not configured</span>
            </>
          )}
          {draft.name && (
            <>
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm text-foreground font-medium">{draft.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Fields</h4>
        </div>
        {draft.selectedFields.length > 0 ? (
          <>
            <ol className="list-none m-0 p-0 flex flex-col gap-1">
              {draft.selectedFields.map((field, index) => {
                const columnName = resolveColumnName(field.key, draft.columnRenames, field.label);
                const isRenamed = columnName !== field.label;
                const prefix = getSourceLabel(field.source);
                return (
                  <li key={field.key} className="text-sm text-foreground">
                    <span className="text-muted-foreground mr-2 min-w-5 inline-block">{index + 1}.</span>
                    <TruncatedText className="max-w-[300px]">
                      {prefix}: {columnName}
                    </TruncatedText>
                    {isRenamed && (
                      <TruncatedText className="text-xs text-muted-foreground ml-2 max-w-[120px]">{`(from: ${field.label})`}</TruncatedText>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 mb-0 text-xs text-muted-foreground">{draft.selectedFields.length} field{draft.selectedFields.length !== 1 ? 's' : ''} mapped</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground m-0">No fields selected</p>
        )}
      </div>

      {/* Output Configuration */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Output Configuration</h4>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">File Name</span>
          <span className="text-sm text-foreground font-medium font-mono">{filenamePreview}</span>
          <span className="text-sm text-muted-foreground">Prefix</span>
          <span className="text-sm text-foreground font-medium">{draft.fileNamingPrefix || '(none)'}</span>
          <span className="text-sm text-muted-foreground">Format</span>
          <span className="text-sm text-foreground font-medium">CSV</span>
          <span className="text-sm text-muted-foreground">Timezone</span>
          <span className="text-sm text-foreground font-medium">{draft.formatOptions.timezone}</span>
        </div>
      </div>

      {/* Schedule */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Schedule</h4>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Frequency</span>
          <span className="text-sm text-foreground font-medium">{formatScheduleSummary(draft.schedule)}</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Notifications</h4>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Failure</span>
          <span className="text-sm text-foreground font-medium">
            {draft.notifications.failureEmails.length > 0
              ? draft.notifications.failureEmails.join(', ')
              : 'None configured'}
          </span>
          <span className="text-sm text-muted-foreground">Success</span>
          <span className="text-sm text-foreground font-medium">
            {draft.notifications.successEnabled
              ? draft.notifications.successEmails.join(', ') || 'Enabled (no emails)'
              : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
}
