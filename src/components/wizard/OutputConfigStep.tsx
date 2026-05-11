import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Toggle } from '../shared/Toggle';
import { FileNamingInput } from './FileNamingInput';
import type { WizardDraft } from '../../models/wizard';
import type { FormatOptions, FileType } from '../../models/automation';

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

  const selectClass = "w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-no-repeat bg-[right_12px_center] pr-8 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]";
  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` };

  return (
    <div className="flex flex-col gap-8" data-testid="output-config-step">
      <h3 className="m-0 text-lg font-semibold text-primary">File Configuration</h3>
      <p className="-mt-5 text-sm text-tertiary-foreground">Configure file format, destination folder, and output settings.</p>

      {/* Destination Folder */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Destination Folder</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Where exported files will be written</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex border border-border rounded-md overflow-hidden w-full">
            {PATH_MODES.map((mode, i) => (
              <button key={mode.value} type="button"
                className={cn(
                  "flex-1 py-2 px-4 text-[13px] font-medium text-tertiary-foreground bg-secondary border-none border-b-2 border-b-transparent cursor-pointer transition-all duration-150 whitespace-nowrap uppercase flex items-center justify-center",
                  i < PATH_MODES.length - 1 && "border-r border-r-border",
                  pathMode === mode.value && "text-primary font-semibold bg-background border-b-2 border-b-primary",
                  pathMode !== mode.value && "hover:text-muted-foreground"
                )}
                onClick={() => setPathMode(mode.value)}>{mode.label}</button>
            ))}
          </div>
          {pathMode === 'automatic' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Folder Name</p>
              <div className="flex border border-border rounded-md overflow-hidden">
                <span className="flex items-center py-2 px-3 text-sm text-tertiary-foreground bg-secondary border-r border-border whitespace-nowrap">{basePath}</span>
                <input className="flex-1 py-2 px-3 text-sm text-foreground bg-background border-none outline-none box-border focus:shadow-[inset_0_0_0_1px_var(--primary)] placeholder:text-tertiary-foreground" type="text" value={folderName}
                  onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. daily-export" />
              </div>
            </div>
          )}
          {pathMode === 'shared' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Destination Path</p>
              <input className="w-full py-2 px-3 text-sm border border-border rounded-md bg-secondary text-tertiary-foreground outline-none transition-colors duration-150 box-border cursor-not-allowed" type="text" value={basePath} disabled />
            </div>
          )}
          {pathMode === 'custom' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Destination Path</p>
              <div className="flex border border-border rounded-md overflow-hidden">
                <span className="flex items-center py-2 px-3 text-sm text-tertiary-foreground bg-secondary border-r border-border whitespace-nowrap">{basePath}</span>
                <input className="flex-1 py-2 px-3 text-sm text-foreground bg-background border-none outline-none box-border focus:shadow-[inset_0_0_0_1px_var(--primary)] placeholder:text-tertiary-foreground" type="text" value={readPath}
                  onChange={(e) => setReadPath(e.target.value)} placeholder="custom/outbound/" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Type */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">File Type</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">The format of the exported file</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex border border-border rounded-md overflow-hidden w-full">
            {FILE_TYPES.map((ft, i) => (
              <button key={ft.value} type="button"
                className={cn(
                  "flex-1 py-2 px-4 text-[13px] font-medium text-tertiary-foreground bg-secondary border-none border-b-2 border-b-transparent cursor-pointer transition-all duration-150 whitespace-nowrap uppercase flex items-center justify-center",
                  i < FILE_TYPES.length - 1 && "border-r border-r-border",
                  draft.fileType === ft.value && "text-primary font-semibold bg-background border-b-2 border-b-primary",
                  draft.fileType !== ft.value && "hover:text-muted-foreground"
                )}
                onClick={() => onUpdate({ fileType: ft.value })}>{ft.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Preview */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Output Preview</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Full path and filename of the exported file</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="bg-background border border-border rounded-md py-2.5 px-3.5">
            <p className="text-xs text-foreground font-mono m-0 break-all">{effectiveFolder}{effectiveFileName}</p>
          </div>
        </div>
      </div>

      {/* Advanced toggle */}
      <button type="button" className="flex items-center gap-1.5 bg-transparent border-none text-primary text-sm font-medium cursor-pointer p-0 hover:text-accent-hover hover:underline" onClick={() => setShowAdvanced(!showAdvanced)}>
        <span className="text-base font-bold transition-transform duration-150 inline-block" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'none' }}>›</span>
        Advanced options
      </button>

      {showAdvanced && (
        <>
          {/* Delimiter (CSV only) */}
          {draft.fileType === 'csv' && (
            <div className="flex items-start gap-14">
              <div className="w-40 shrink-0">
                <p className="text-sm font-semibold text-foreground m-0">Delimiter</p>
                <p className="text-xs text-tertiary-foreground mt-1 m-0">Character used to separate columns</p>
              </div>
              <div className="w-[552px] flex flex-col gap-3">
                <select
                  className={selectClass}
                  style={selectStyle}
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
          <div className="flex items-start gap-14">
            <div className="w-40 shrink-0">
              <p className="text-sm font-semibold text-foreground m-0">Header Row</p>
              <p className="text-xs text-tertiary-foreground mt-1 m-0">Include column names in the first row</p>
            </div>
            <div className="w-[552px] flex flex-col gap-3">
              <Toggle checked={formatOptions.includeHeader}
                onChange={(checked) => updateFormat({ includeHeader: checked })}
                label="Enable" id="header-row-toggle-adv" />
            </div>
          </div>

          {/* Date Format */}
          <div className="flex items-start gap-14">
            <div className="w-40 shrink-0">
              <p className="text-sm font-semibold text-foreground m-0">Date Format</p>
              <p className="text-xs text-tertiary-foreground mt-1 m-0">How dates are formatted in the export</p>
            </div>
            <div className="w-[552px] flex flex-col gap-3">
              <select className={selectClass} style={selectStyle} value={formatOptions.dateFormat}
                onChange={(e) => updateFormat({ dateFormat: e.target.value as FormatOptions['dateFormat'] })} aria-label="Date format">
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timezone */}
          <div className="flex items-start gap-14">
            <div className="w-40 shrink-0">
              <p className="text-sm font-semibold text-foreground m-0">Timezone</p>
              <p className="text-xs text-tertiary-foreground mt-1 m-0">Timezone for date values</p>
            </div>
            <div className="w-[552px] flex flex-col gap-3">
              <select className={selectClass} style={selectStyle} value={formatOptions.timezone}
                onChange={(e) => updateFormat({ timezone: e.target.value })} aria-label="Timezone">
                {TIMEZONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Naming */}
          <div className="flex items-start gap-14">
            <div className="w-40 shrink-0">
              <p className="text-sm font-semibold text-foreground m-0">File Naming</p>
              <p className="text-xs text-tertiary-foreground mt-1 m-0">Pattern for exported file names</p>
            </div>
            <div className="w-[552px] flex flex-col gap-3">
              <FileNamingInput value={draft.fileNamingPattern}
                onChange={(pattern) => onUpdate({ fileNamingPattern: pattern })} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
