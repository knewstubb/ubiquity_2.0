import { PencilSimple } from '@phosphor-icons/react';
import { useConnections } from '../../contexts/ConnectionsContext';
import { Button } from '../ui/button';
import type { WizardDraft } from '../../models/wizard';
import type { ExportDataType, ScheduleFrequency, FileType } from '../../models/automation';
import { summariseFilterGroup, hasCompleteRules } from '../../utils/filterSummary';
import type { GroupSummary, RuleSummary } from '../../utils/filterSummary';
import { getFieldByKey } from '../../data/fieldRegistry';

interface ReviewStepProps {
  draft: WizardDraft;
  onEditStep?: (step: number) => void;
}

const DATA_TYPE_LABELS: Record<ExportDataType, string> = {
  contact: 'Contacts',
  transactional: 'Transactional',
  transactional_with_contact: 'Combined',
};

const SCHEDULE_LABELS: Record<ScheduleFrequency, string> = {
  every_15_min: 'Every 15 minutes',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const DELIMITER_LABELS: Record<string, string> = {
  ',': 'Comma',
  '|': 'Pipe',
  '\t': 'Tab',
  ';': 'Semicolon',
};

const DATE_FORMAT_LABELS: Record<string, string> = {
  ISO8601: 'ISO 8601',
  US: 'US (MM/DD/YYYY)',
  EU: 'EU (DD/MM/YYYY)',
  UNIX: 'UNIX Timestamp',
};

function getFileTypeLabel(ft: FileType): string {
  if (ft === 'csv') return 'CSV';
  return 'XLSX';
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isGroupSummary(item: RuleSummary | GroupSummary): item is GroupSummary {
  return 'combinator' in item && 'items' in item;
}

function renderSummaryItems(summary: GroupSummary): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  summary.items.forEach((item, i) => {
    if (i > 0) {
      nodes.push(
        <span key={`comb-${i}`} className="text-xs font-semibold text-tertiary-foreground uppercase"> {summary.combinator} </span>
      );
    }
    if (isGroupSummary(item)) {
      nodes.push(
        <span key={`group-${i}`}>({renderSummaryItems(item)})</span>
      );
    } else {
      nodes.push(<span key={`rule-${i}`}>{item.text}</span>);
    }
  });
  return nodes;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const UNIT_MAP: Record<string, string> = {
  hourly: 'hours',
  daily: 'day/s',
  weekly: 'week/s',
  monthly: 'month/s',
};

export function ReviewStep({ draft, onEditStep }: ReviewStepProps) {
  const { getConnectionById } = useConnections();
  const connection = draft.connectionId ? getConnectionById(draft.connectionId) : undefined;

  const fileExtension = draft.fileType === 'csv' ? 'csv' : 'xlsx';
  const connectorSlug = draft.name ? toKebabCase(draft.name) : 'export';
  const basePath = '/company/base-path/';
  const defaultFolder = `${basePath}${connectorSlug}/`;
  const resolvedFileName = (draft.fileNamingPattern || '{connector_name}_{date}')
    .replace(/\{connector_name\}/g, connectorSlug)
    .replace(/\{date\}/g, '2025-05-09')
    .replace(/\{timestamp\}/g, '1746835200');

  return (
    <div className="flex flex-col gap-6" data-testid="review-step">

      {/* Data Source — Step 0 */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Data Source</h4>
          {onEditStep && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(0)}><PencilSimple size={12} weight="bold" className="mr-1" />Edit</Button>}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Connection</span>
            <span className="text-sm text-foreground font-medium">{connection ? connection.name : 'None selected'}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Exporting From</span>
            <span className="text-sm text-foreground font-medium">{draft.dataType ? DATA_TYPE_LABELS[draft.dataType] : 'None selected'}</span>
          </div>
          {(draft.dataType === 'contact' || draft.dataType === 'transactional_with_contact') && (
            <div className="flex justify-between py-0.5">
              <span className="text-sm text-muted-foreground">Contacts Database</span>
              <span className="text-sm text-foreground font-medium">Customer Contacts</span>
            </div>
          )}
          {draft.enrichmentKeyField && (
            <div className="flex justify-between py-0.5">
              <span className="text-sm text-muted-foreground">Key Field</span>
              <span className="text-sm text-foreground font-medium">{draft.enrichmentKeyField} → ContactRecord.id</span>
            </div>
          )}
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Filters</span>
            <span className="text-sm text-foreground font-medium">
              {hasCompleteRules(draft.filters)
                ? renderSummaryItems(summariseFilterGroup(draft.filters, getFieldByKey))
                : 'No filters applied'}
            </span>
          </div>
        </div>
      </div>

      {/* Field Mapping — Step 1 */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Field Mapping</h4>
          {onEditStep && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(1)}><PencilSimple size={12} weight="bold" className="mr-1" />Edit</Button>}
        </div>
        {draft.selectedFields.length > 0 ? (
          <ol className="list-none m-0 p-0 flex flex-col gap-1">
            {draft.selectedFields.map((field, index) => (
              <li key={field.key} className="text-sm text-foreground">
                <span className="text-muted-foreground mr-2 min-w-5 inline-block">{index + 1}.</span>
                {field.label}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground m-0">No fields selected</p>
        )}
      </div>

      {/* File Configuration — Step 2 */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">File Configuration</h4>
          {onEditStep && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(2)}><PencilSimple size={12} weight="bold" className="mr-1" />Edit</Button>}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">File Type</span>
            <span className="text-sm text-foreground font-medium">{getFileTypeLabel(draft.fileType)}</span>
          </div>
          {draft.fileType === 'csv' && (
            <div className="flex justify-between py-0.5">
              <span className="text-sm text-muted-foreground">Delimiter</span>
              <span className="text-sm text-foreground font-medium">{DELIMITER_LABELS[draft.formatOptions.delimiter] ?? draft.formatOptions.delimiter}</span>
            </div>
          )}
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Header Row</span>
            <span className="text-sm text-foreground font-medium">{draft.formatOptions.includeHeader ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Date Format</span>
            <span className="text-sm text-foreground font-medium">{DATE_FORMAT_LABELS[draft.formatOptions.dateFormat] ?? draft.formatOptions.dateFormat}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Timezone</span>
            <span className="text-sm text-foreground font-medium">{draft.formatOptions.timezone}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">File Naming</span>
            <span className="text-sm text-foreground font-medium">{draft.fileNamingPattern}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Output Path</span>
            <span className="text-sm text-foreground font-medium font-mono break-all">{defaultFolder}</span>
          </div>
        </div>
      </div>

      {/* Schedule — Step 3 */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Schedule</h4>
          {onEditStep && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(3)}><PencilSimple size={12} weight="bold" className="mr-1" />Edit</Button>}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Frequency</span>
            <span className="text-sm text-foreground font-medium">{draft.schedule ? SCHEDULE_LABELS[draft.schedule] : 'None selected'}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Starting</span>
            <span className="text-sm text-foreground font-medium">{draft.scheduleConfig.starting}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Every</span>
            <span className="text-sm text-foreground font-medium">{draft.scheduleConfig.every} {UNIT_MAP[draft.scheduleConfig.frequency]}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">At</span>
            <span className="text-sm text-foreground font-medium">{draft.scheduleConfig.at}</span>
          </div>
          {draft.scheduleConfig.frequency === 'weekly' && (
            <div className="flex justify-between py-0.5">
              <span className="text-sm text-muted-foreground">On</span>
              <span className="text-sm text-foreground font-medium">
                {DAY_NAMES.filter((_, i) => draft.scheduleConfig.weeklyDays[i]).join(', ') || 'None'}
              </span>
            </div>
          )}
          {draft.scheduleConfig.frequency === 'monthly' && (
            <div className="flex justify-between py-0.5">
              <span className="text-sm text-muted-foreground">On the</span>
              <span className="text-sm text-foreground font-medium">
                {draft.scheduleConfig.monthlyPattern === 'day'
                  ? `${draft.scheduleConfig.monthlyOrdinal} ${draft.scheduleConfig.monthlyDayOfWeek}`
                  : draft.scheduleConfig.monthlyDates.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications — Step 3 */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Notifications</h4>
          {onEditStep && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEditStep(3)}><PencilSimple size={12} weight="bold" className="mr-1" />Edit</Button>}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Email Address</span>
            <span className="text-sm text-foreground font-medium">{draft.notifications.emails.join(', ') || 'None'}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Successful Export</span>
            <span className="text-sm text-foreground font-medium">{draft.notifications.successEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Failed Export</span>
            <span className="text-sm text-foreground font-medium">{draft.notifications.failureEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
