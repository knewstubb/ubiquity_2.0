import { useState } from 'react';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { PrefixInput } from '@/components/composed/prefix-input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
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
          <SegmentedControl
            options={PATH_MODES}
            value={pathMode}
            onValueChange={(v) => setPathMode(v as PathMode)}
          />
          {pathMode === 'automatic' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Folder Name</p>
              <PrefixInput prefix={basePath} value={folderName}
                onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. daily-export" />
            </div>
          )}
          {pathMode === 'shared' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Destination Path</p>
              <Input value={basePath} disabled />
            </div>
          )}
          {pathMode === 'custom' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Destination Path</p>
              <PrefixInput prefix={basePath} value={readPath}
                onChange={(e) => setReadPath(e.target.value)} placeholder="custom/outbound/" />
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
          <SegmentedControl
            options={FILE_TYPES}
            value={draft.fileType}
            onValueChange={(v) => onUpdate({ fileType: v as FileType })}
          />
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
                <Select value={formatOptions.delimiter} onValueChange={(v) => updateFormat({ delimiter: v as FormatOptions['delimiter'] })}>
                  <SelectTrigger aria-label="Delimiter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIMITERS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="flex items-center gap-2">
                <Switch
                  id="header-row-toggle-adv"
                  checked={formatOptions.includeHeader}
                  onCheckedChange={(checked) => updateFormat({ includeHeader: checked })}
                />
                <Label htmlFor="header-row-toggle-adv">Enable</Label>
              </div>
            </div>
          </div>

          {/* Date Format */}
          <div className="flex items-start gap-14">
            <div className="w-40 shrink-0">
              <p className="text-sm font-semibold text-foreground m-0">Date Format</p>
              <p className="text-xs text-tertiary-foreground mt-1 m-0">How dates are formatted in the export</p>
            </div>
            <div className="w-[552px] flex flex-col gap-3">
              <Select value={formatOptions.dateFormat} onValueChange={(v) => updateFormat({ dateFormat: v as FormatOptions['dateFormat'] })}>
                <SelectTrigger aria-label="Date format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timezone */}
          <div className="flex items-start gap-14">
            <div className="w-40 shrink-0">
              <p className="text-sm font-semibold text-foreground m-0">Timezone</p>
              <p className="text-xs text-tertiary-foreground mt-1 m-0">Timezone for date values</p>
            </div>
            <div className="w-[552px] flex flex-col gap-3">
              <Select value={formatOptions.timezone} onValueChange={(v) => updateFormat({ timezone: v })}>
                <SelectTrigger aria-label="Timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
