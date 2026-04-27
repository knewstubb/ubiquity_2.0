import { useState } from 'react';
import { Toggle } from '../shared/Toggle';
import { FileNamingInput } from './FileNamingInput';
import type { WizardDraft } from '../../models/wizard';
import type { FormatOptions, FileType } from '../../models/connector';
import styles from './OutputConfigStep.module.css';

interface OutputConfigStepProps {
  draft: WizardDraft;
  onUpdate: (patch: Partial<WizardDraft>) => void;
}

type PathMode = 'automatic' | 'shared' | 'custom';

const PATH_MODES: { value: PathMode; label: string }[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'shared', label: 'Shared' },
  { value: 'custom', label: 'Custom' },
];

const FILE_TYPES: { value: FileType; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'json' as FileType, label: 'XLSX' },
];

const DELIMITERS: { value: FormatOptions['delimiter']; label: string }[] = [
  { value: ',', label: 'Comma' },
  { value: '|', label: 'Pipe' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: 'Semicolon' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'ISO8601', label: 'ISO 8601' },
  { value: 'US', label: 'US (MM/DD/YYYY)' },
  { value: 'EU', label: 'EU (DD/MM/YYYY)' },
  { value: 'UNIX', label: 'UNIX Timestamp' },
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
];

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function OutputConfigStep({ draft, onUpdate }: OutputConfigStepProps) {
  const { formatOptions } = draft;
  const defaultFolderName = draft.name ? toKebabCase(draft.name) : 'export-folder';
  const [pathMode, setPathMode] = useState<PathMode>('automatic');
  const [folderName, setFolderName] = useState(defaultFolderName);
  const [readPath, setReadPath] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const basePath = '/company/base-path/';

  const fileExtension = draft.fileType === 'csv' ? 'csv' : 'xlsx';
  const effectiveFolder = pathMode === 'automatic'
    ? `${basePath}${folderName || 'your-folder'}/`
    : pathMode === 'shared'
    ? basePath
    : `${basePath}${readPath || 'custom/outbound/'}`;

  // Resolve file naming pattern tokens for preview
  const connectorSlug = draft.name ? toKebabCase(draft.name) : 'export';
  const resolvedFileName = (draft.fileNamingPattern || '{connector_name}_{date}')
    .replace(/\{connector_name\}/g, connectorSlug)
    .replace(/\{date\}/g, '2025-05-09')
    .replace(/\{timestamp\}/g, '1746835200');
  const effectiveFileName = `${resolvedFileName}.${fileExtension}`;

  const updateFormat = (patch: Partial<FormatOptions>) => {
    onUpdate({ formatOptions: { ...formatOptions, ...patch } });
  };

  return (
    <div className={styles.container} data-testid="output-config-step">
      <h3 className={styles.title}>File Configuration</h3>
      <p className={styles.subtitle}>Configure file format, destination folder, and output settings.</p>

      {/* Destination Folder */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <p className={styles.labelText}>Destination Folder</p>
          <p className={styles.labelHint}>Where exported files will be written</p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.segmented}>
            {PATH_MODES.map((mode) => (
              <button key={mode.value} type="button"
                className={`${styles.segmentBtn} ${pathMode === mode.value ? styles.segmentBtnActive : ''}`}
                onClick={() => setPathMode(mode.value)}>{mode.label}</button>
            ))}
          </div>
          {pathMode === 'automatic' && (
            <div>
              <p className={styles.inputLabel}>Folder Name</p>
              <div className={styles.prefixedInput}>
                <span className={styles.inputPrefix}>{basePath}</span>
                <input className={styles.prefixedField} type="text" value={folderName}
                  onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. daily-export" />
              </div>
            </div>
          )}
          {pathMode === 'shared' && (
            <div>
              <p className={styles.inputLabel}>Destination Path</p>
              <input className={styles.textInput} type="text" value={basePath} disabled />
            </div>
          )}
          {pathMode === 'custom' && (
            <div>
              <p className={styles.inputLabel}>Destination Path</p>
              <div className={styles.prefixedInput}>
                <span className={styles.inputPrefix}>{basePath}</span>
                <input className={styles.prefixedField} type="text" value={readPath}
                  onChange={(e) => setReadPath(e.target.value)} placeholder="custom/outbound/" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Type */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <p className={styles.labelText}>File Type</p>
          <p className={styles.labelHint}>The format of the exported file</p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.segmented}>
            {FILE_TYPES.map((ft) => (
              <button key={ft.value} type="button"
                className={`${styles.segmentBtn} ${draft.fileType === ft.value ? styles.segmentBtnActive : ''}`}
                onClick={() => onUpdate({ fileType: ft.value })}>{ft.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Preview */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <p className={styles.labelText}>Output Preview</p>
          <p className={styles.labelHint}>Full path and filename of the exported file</p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.filePreview}>
            <p className={styles.filePreviewPath}>{effectiveFolder}{effectiveFileName}</p>
          </div>
        </div>
      </div>

      {/* Advanced toggle */}
      <button type="button" className={styles.advancedToggle} onClick={() => setShowAdvanced(!showAdvanced)}>
        <span className={styles.advancedChevron} style={{ transform: showAdvanced ? 'rotate(90deg)' : 'none' }}>›</span>
        Advanced options
      </button>

      {showAdvanced && (
        <>
          {/* Delimiter (CSV only) */}
          {draft.fileType === 'csv' && (
            <div className={styles.row}>
              <div className={styles.labelCol}>
                <p className={styles.labelText}>Delimiter</p>
                <p className={styles.labelHint}>Character used to separate columns</p>
              </div>
              <div className={styles.inputCol}>
                <select
                  className={styles.select}
                  value={formatOptions.delimiter}
                  onChange={(e) => updateFormat({ delimiter: e.target.value as FormatOptions['delimiter'] })}
                  aria-label="Delimiter"
                >
                  {DELIMITERS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Header Row */}
          <div className={styles.row}>
            <div className={styles.labelCol}>
              <p className={styles.labelText}>Header Row</p>
              <p className={styles.labelHint}>Include column names in the first row</p>
            </div>
            <div className={styles.inputCol}>
              <Toggle checked={formatOptions.includeHeader}
                onChange={(checked) => updateFormat({ includeHeader: checked })}
                label="Enable" id="header-row-toggle-adv" />
            </div>
          </div>

          {/* Date Format */}
          <div className={styles.row}>
            <div className={styles.labelCol}>
              <p className={styles.labelText}>Date Format</p>
              <p className={styles.labelHint}>How dates are formatted in the export</p>
            </div>
            <div className={styles.inputCol}>
              <select className={styles.select} value={formatOptions.dateFormat}
                onChange={(e) => updateFormat({ dateFormat: e.target.value as FormatOptions['dateFormat'] })} aria-label="Date format">
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timezone */}
          <div className={styles.row}>
            <div className={styles.labelCol}>
              <p className={styles.labelText}>Timezone</p>
              <p className={styles.labelHint}>Timezone for date values</p>
            </div>
            <div className={styles.inputCol}>
              <select className={styles.select} value={formatOptions.timezone}
                onChange={(e) => updateFormat({ timezone: e.target.value })} aria-label="Timezone">
                {TIMEZONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Naming */}
          <div className={styles.row}>
            <div className={styles.labelCol}>
              <p className={styles.labelText}>File Naming</p>
              <p className={styles.labelHint}>Pattern for exported file names</p>
            </div>
            <div className={styles.inputCol}>
              <FileNamingInput value={draft.fileNamingPattern}
                onChange={(pattern) => onUpdate({ fileNamingPattern: pattern })} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
