import React from 'react';
import type { ExporterWizardDraft } from '../../models/wizard';
import { resolveColumnName, resolveTimestamp } from '../../utils/exporter-utils';
import { formatSourceConfigSummary } from '../../utils/source-config-utils';
import { useAccount } from '../../contexts/AccountContext';
import { transactionalDatabases } from '../../data/transactionalData';

interface ReviewStepProps {
  draft: ExporterWizardDraft;
  onEditStep?: (step: number) => void;
}

function getSourceLabel(source: string, accountName: string): string {
  if (source === 'contacts') return accountName;
  if (source === 'mailout') return 'Mailout';
  if (source.startsWith('txn:')) {
    const tableId = source.slice(4);
    const table = transactionalDatabases.find((t) => t.id === tableId);
    return table?.name ?? tableId;
  }
  return source.charAt(0).toUpperCase() + source.slice(1);
}

const FREQUENCY_LABELS: Record<string, string> = {
  '10_minute': '10 Minute',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
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
  const { selectedAccount } = useAccount();
  const timestamp = resolveTimestamp(new Date());
  const filenamePreview = draft.fileNamingPrefix
    ? `${draft.fileNamingPrefix}${timestamp}.csv`
    : `${timestamp}.csv`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl" data-testid="review-step">

      {/* File Settings */}
      <div className="border-l-2 border-primary pl-4">
        <h4 className="text-sm font-semibold text-foreground m-0 mb-2">File Settings</h4>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Exporter Name</span>
          <span className="text-sm text-foreground font-medium">{draft.name || '(none)'}</span>
          <span className="text-sm text-muted-foreground">File Name</span>
          <span className="text-sm text-foreground font-medium font-mono">{filenamePreview}</span>
          <span className="text-sm text-muted-foreground">Format</span>
          <span className="text-sm text-foreground font-medium">CSV</span>
          <span className="text-sm text-muted-foreground">Delimiter</span>
          <span className="text-sm text-foreground font-medium">
            {draft.formatOptions.delimiter === ',' ? 'Comma (,)' : draft.formatOptions.delimiter === '|' ? 'Pipe (|)' : draft.formatOptions.delimiter === '\t' ? 'Tab' : draft.formatOptions.delimiter}
          </span>
          <span className="text-sm text-muted-foreground">Header Row</span>
          <span className="text-sm text-foreground font-medium">{draft.formatOptions.includeHeader ? 'Enabled' : 'Disabled'}</span>
          <span className="text-sm text-muted-foreground">Timezone</span>
          <span className="text-sm text-foreground font-medium">{draft.formatOptions.timezone}</span>
          <span className="text-sm text-muted-foreground">Destination</span>
          <span className="text-sm text-foreground font-medium">{draft.destinationPath || '/'}</span>
        </div>
      </div>

      {/* Data Source */}
      <div className="border-l-2 border-primary pl-4">
        <h4 className="text-sm font-semibold text-foreground m-0 mb-2">Data Source</h4>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Source</span>
          <span className="text-sm text-foreground font-medium">
            {draft.sourceConfig ? formatSourceConfigSummary(draft.sourceConfig) : 'Not configured'}
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="border-l-2 border-primary pl-4">
        <h4 className="text-sm font-semibold text-foreground m-0 mb-2">Filter</h4>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Conditions</span>
          <span className="text-sm text-foreground font-medium">
            {draft.dataSourceFilter && draft.dataSourceFilter.conditions.length > 0
              ? `${draft.dataSourceFilter.conditions.length} condition${draft.dataSourceFilter.conditions.length !== 1 ? 's' : ''} applied`
              : 'No filters applied'}
          </span>
        </div>
      </div>

      {/* Export Fields */}
      <div className="border-l-2 border-primary pl-4">
        <h4 className="text-sm font-semibold text-foreground m-0 mb-2">Export Fields</h4>
        {draft.selectedFields.length > 0 ? (
          <>
            <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
              {draft.selectedFields.map((field) => {
                const columnName = resolveColumnName(field.key, draft.columnRenames, field.label);
                const prefix = getSourceLabel(field.source, selectedAccount.name);
                return (
                  <React.Fragment key={field.key}>
                    <span className="text-sm text-muted-foreground truncate" title={prefix}>{prefix}</span>
                    <span className="text-sm text-foreground font-medium truncate" title={columnName}>{columnName}</span>
                  </React.Fragment>
                );
              })}
            </div>
            <p className="mt-2 mb-0 text-xs text-muted-foreground">{draft.selectedFields.length} field{draft.selectedFields.length !== 1 ? 's' : ''} selected</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground m-0">No fields selected</p>
        )}
      </div>

      {/* Schedule */}
      <div className="border-l-2 border-primary pl-4">
        <h4 className="text-sm font-semibold text-foreground m-0 mb-2">Schedule</h4>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Frequency</span>
          <span className="text-sm text-foreground font-medium">{formatScheduleSummary(draft.schedule)}</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="border-l-2 border-primary pl-4">
        <h4 className="text-sm font-semibold text-foreground m-0 mb-2">Notifications</h4>
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
