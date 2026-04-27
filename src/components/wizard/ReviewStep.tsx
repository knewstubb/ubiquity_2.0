import { useConnections } from '../../contexts/ConnectionsContext';
import type { WizardDraft } from '../../models/wizard';
import type { ExportDataType, ScheduleFrequency, FileType } from '../../models/connector';
import { summariseFilterGroup, hasCompleteRules } from '../../utils/filterSummary';
import type { GroupSummary, RuleSummary } from '../../utils/filterSummary';
import { getFieldByKey } from '../../data/fieldRegistry';
import styles from './ReviewStep.module.css';

interface ReviewStepProps {
  draft: WizardDraft;
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
  // The XLSX option is stored as 'json' due to the FileType union — display as XLSX
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
        <span key={`comb-${i}`} className={styles.combinator}> {summary.combinator} </span>
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

export function ReviewStep({ draft }: ReviewStepProps) {
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
    <div className={styles.step} data-testid="review-step">
      <h3 className={styles.heading}>Review</h3>
      <p className={styles.description}>Review your automation configuration before saving.</p>

      {/* Data Source — Step 0 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Data Source</h3>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Connection</span>
          <span className={styles.optionValue}>{connection ? connection.name : 'None selected'}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Exporting From</span>
          <span className={styles.optionValue}>{draft.dataType ? DATA_TYPE_LABELS[draft.dataType] : 'None selected'}</span>
        </div>
        {(draft.dataType === 'contact' || draft.dataType === 'transactional_with_contact') && (
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Contacts Database</span>
            <span className={styles.optionValue}>Customer Contacts</span>
          </div>
        )}
        {draft.enrichmentKeyField && (
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Key Field</span>
            <span className={styles.optionValue}>{draft.enrichmentKeyField} → ContactRecord.id</span>
          </div>
        )}
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Filters</span>
          <span className={styles.optionValue}>
            {hasCompleteRules(draft.filters)
              ? renderSummaryItems(summariseFilterGroup(draft.filters, getFieldByKey))
              : 'No filters applied'}
          </span>
        </div>
      </div>

      {/* Field Mapping — Step 1 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Field Mapping</h3>
        {draft.selectedFields.length > 0 ? (
          <ol className={styles.fieldList}>
            {draft.selectedFields.map((field, index) => (
              <li key={field.key} className={styles.fieldItem}>
                <span className={styles.fieldIndex}>{index + 1}.</span>
                {field.label}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.sectionValue}>No fields selected</p>
        )}
      </div>

      {/* File Configuration — Step 2 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>File Configuration</h3>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>File Type</span>
          <span className={styles.optionValue}>{getFileTypeLabel(draft.fileType)}</span>
        </div>
        {draft.fileType === 'csv' && (
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Delimiter</span>
            <span className={styles.optionValue}>{DELIMITER_LABELS[draft.formatOptions.delimiter] ?? draft.formatOptions.delimiter}</span>
          </div>
        )}
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Header Row</span>
          <span className={styles.optionValue}>{draft.formatOptions.includeHeader ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Date Format</span>
          <span className={styles.optionValue}>{DATE_FORMAT_LABELS[draft.formatOptions.dateFormat] ?? draft.formatOptions.dateFormat}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Timezone</span>
          <span className={styles.optionValue}>{draft.formatOptions.timezone}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>File Naming</span>
          <span className={styles.optionValue}>{draft.fileNamingPattern}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Output Path</span>
          <span className={styles.optionValueMono}>{defaultFolder}</span>
        </div>
      </div>

      {/* Schedule — Step 3 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Schedule</h3>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Frequency</span>
          <span className={styles.optionValue}>{draft.schedule ? SCHEDULE_LABELS[draft.schedule] : 'None selected'}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Starting</span>
          <span className={styles.optionValue}>{draft.scheduleConfig.starting}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Every</span>
          <span className={styles.optionValue}>{draft.scheduleConfig.every} {UNIT_MAP[draft.scheduleConfig.frequency]}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>At</span>
          <span className={styles.optionValue}>{draft.scheduleConfig.at}</span>
        </div>
        {draft.scheduleConfig.frequency === 'weekly' && (
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>On</span>
            <span className={styles.optionValue}>
              {DAY_NAMES.filter((_, i) => draft.scheduleConfig.weeklyDays[i]).join(', ') || 'None'}
            </span>
          </div>
        )}
        {draft.scheduleConfig.frequency === 'monthly' && (
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>On the</span>
            <span className={styles.optionValue}>
              {draft.scheduleConfig.monthlyPattern === 'day'
                ? `${draft.scheduleConfig.monthlyOrdinal} ${draft.scheduleConfig.monthlyDayOfWeek}`
                : draft.scheduleConfig.monthlyDates.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Notifications — Step 3 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Notifications</h3>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Email Address</span>
          <span className={styles.optionValue}>{draft.notifications.emails.join(', ') || 'None'}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Successful Export</span>
          <span className={styles.optionValue}>{draft.notifications.successEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Failed Export</span>
          <span className={styles.optionValue}>{draft.notifications.failureEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </div>
  );
}
