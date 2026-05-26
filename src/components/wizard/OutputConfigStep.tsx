import { useState } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { PrefixInput } from '@/components/composed/prefix-input';
import { SectionDivider } from '@/components/composed/section-divider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { FileNamingInput } from './FileNamingInput';
import type { WizardDraft } from '../../models/wizard';
import type { FormatOptions } from '../../models/automation';

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

const DELIMITERS: { value: FormatOptions['delimiter']; label: string }[] = [
  { value: ',', label: 'Comma (,)' },
  { value: '|', label: 'Pipe (|)' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: 'Semicolon (;)' },
];

const DELIMITER_LABELS: Record<string, string> = {
  ',': 'Comma',
  '|': 'Pipe',
  '\t': 'Tab',
  ';': 'Semicolon',
};

const DATE_FORMAT_OPTIONS = [
  { value: 'ISO8601', label: 'ISO 8601 (2025-05-09)' },
  { value: 'US', label: 'US (05/09/2025)' },
  { value: 'EU', label: 'EU (09/05/2025)' },
  { value: 'UNIX', label: 'UNIX Timestamp' },
];

const DATE_FORMAT_SHORT: Record<string, string> = {
  'ISO8601': 'ISO 8601',
  'US': 'US',
  'EU': 'EU',
  'UNIX': 'UNIX',
};

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
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
  const [formatOpen, setFormatOpen] = useState(false);
  const basePath = '/company/base-path/';

  const effectiveFolder = pathMode === 'automatic'
    ? `${basePath}${folderName || 'your-folder'}/`
    : pathMode === 'shared'
    ? basePath
    : `${basePath}${readPath || 'custom/outbound/'}`;

  const connectorSlug = draft.name ? toKebabCase(draft.name) : 'export';
  const resolvedFileName = (draft.fileNamingPattern || '{connector_name}_{date}')
    .replace(/\{connector_name\}/g, connectorSlug)
    .replace(/\{date\}/g, '2025-05-09')
    .replace(/\{timestamp\}/g, '1746835200');
  const effectiveFileName = `${resolvedFileName}.csv`;

  // Summary of current format settings for collapsed state
  const formatSummary = [
    DELIMITER_LABELS[formatOptions.delimiter] || 'Comma',
    formatOptions.includeHeader ? 'Headers on' : 'No headers',
    DATE_FORMAT_SHORT[formatOptions.dateFormat] || 'ISO 8601',
    formatOptions.timezone || 'UTC',
  ].join(' · ');

  const updateFormat = (patch: Partial<FormatOptions>) => {
    onUpdate({ formatOptions: { ...formatOptions, ...patch } });
  };

  return (
    <div className="flex flex-col gap-6" data-testid="output-config-step">

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
              <p className="text-xs font-medium text-muted-foreground m-0">Destination Path</p>
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

      {/* File Naming Pattern */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">File Naming Pattern</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Pattern for exported file names</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <FileNamingInput value={draft.fileNamingPattern || '{connector_name}_{date}'}
            onChange={(pattern) => onUpdate({ fileNamingPattern: pattern })} />
        </div>
      </div>

      {/* Format Options — collapsible */}
      <div className="border-t border-border pt-5">
        <div className="flex items-start gap-14">
          <div className="w-40 shrink-0">
            <p className="text-sm font-semibold text-foreground m-0">Format Options</p>
            <p className="text-xs text-tertiary-foreground mt-1 m-0">CSV format settings</p>
          </div>
          <div className="w-[552px] flex flex-col gap-3">
            <Collapsible open={formatOpen} onOpenChange={setFormatOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left bg-transparent border-none cursor-pointer p-0">
                <CaretRight
                  size={14}
                  weight="bold"
                  className={cn(
                    "text-muted-foreground transition-transform duration-150",
                    formatOpen && "rotate-90"
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {formatOpen ? 'Hide options' : formatSummary}
                </span>
              </CollapsibleTrigger>

              <CollapsibleContent className="pt-4 flex flex-col gap-4">
                {/* Delimiter */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground m-0 mb-1.5">Delimiter</p>
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

                {/* Header Row */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="header-row-toggle"
                    checked={formatOptions.includeHeader}
                    onCheckedChange={(checked) => updateFormat({ includeHeader: checked })}
                  />
                  <Label htmlFor="header-row-toggle">Include header row</Label>
                </div>

                {/* Date Format */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground m-0 mb-1.5">Date Format</p>
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

                {/* Timezone */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground m-0 mb-1.5">Timezone</p>
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
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Output Preview — always visible at the bottom */}
      <div className="flex items-start gap-14 border-t border-border pt-5">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Output Preview</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Full path and filename</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="bg-muted rounded-lg py-2.5 px-3.5">
            <p className="text-xs text-foreground font-mono m-0 break-all">{effectiveFolder}{effectiveFileName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
