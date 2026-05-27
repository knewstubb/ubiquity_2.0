import { useMemo } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { resolveTimestamp, validatePrefix } from '../../utils/exporter-utils';
import type { ExporterWizardDraft } from '../../models/wizard';
import type { FormatOptions } from '../../models/automation';
import { useState } from 'react';

interface OutputConfigStepProps {
  draft: ExporterWizardDraft;
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void;
}

type FileFormat = 'csv' | 'tsv' | 'pipe';

const FILE_FORMATS: { value: FileFormat; label: string; delimiter: FormatOptions['delimiter']; extension: string }[] = [
  { value: 'csv', label: 'CSV (Comma-separated)', delimiter: ',', extension: 'csv' },
  { value: 'tsv', label: 'TSV (Tab-separated)', delimiter: '\t', extension: 'tsv' },
  { value: 'pipe', label: 'Pipe-delimited', delimiter: '|', extension: 'csv' },
];

const DELIMITER_OPTIONS: { value: FormatOptions['delimiter']; label: string }[] = [
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
  { value: ';', label: 'Semicolon (;)' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'ISO8601', label: 'ISO 8601 (2025-05-09)' },
  { value: 'US', label: 'US (05/09/2025)' },
  { value: 'EU', label: 'EU (09/05/2025)' },
  { value: 'UNIX', label: 'UNIX Timestamp' },
];

/**
 * Derives the file format selection from the current delimiter value.
 */
function getFileFormatFromDelimiter(delimiter: FormatOptions['delimiter']): FileFormat {
  switch (delimiter) {
    case '\t':
      return 'tsv';
    case '|':
      return 'pipe';
    default:
      return 'csv';
  }
}

/**
 * Gets the file extension based on the current format.
 */
function getFileExtension(delimiter: FormatOptions['delimiter']): string {
  if (delimiter === '\t') return 'tsv';
  return 'csv';
}

export function OutputConfigStep({ draft, onUpdate }: OutputConfigStepProps) {
  const { formatOptions, fileNamingPrefix } = draft;
  const [formatOpen, setFormatOpen] = useState(false);

  const isPrefixValid = fileNamingPrefix.length === 0 ? false : validatePrefix(fileNamingPrefix);
  const showPrefixError = fileNamingPrefix.length > 0 && !isPrefixValid;

  // Resolve the live preview filename
  const previewFilename = useMemo(() => {
    const timestamp = resolveTimestamp(new Date());
    const extension = getFileExtension(formatOptions.delimiter);
    const prefix = fileNamingPrefix || 'export';
    return `${prefix}-${timestamp}.${extension}`;
  }, [fileNamingPrefix, formatOptions.delimiter]);

  const currentFileFormat = getFileFormatFromDelimiter(formatOptions.delimiter);

  const updateFormat = (patch: Partial<FormatOptions>) => {
    onUpdate({ formatOptions: { ...formatOptions, ...patch } });
  };

  const handleFileFormatChange = (format: FileFormat) => {
    const formatDef = FILE_FORMATS.find((f) => f.value === format);
    if (formatDef) {
      updateFormat({ delimiter: formatDef.delimiter });
    }
  };

  const handlePrefixChange = (value: string) => {
    onUpdate({ fileNamingPrefix: value });
  };

  // Summary of current format settings for collapsed state
  const formatSummary = [
    FILE_FORMATS.find((f) => f.value === currentFileFormat)?.label.split(' ')[0] || 'CSV',
    formatOptions.includeHeader ? 'Headers on' : 'No headers',
    formatOptions.timezone || 'Pacific/Auckland',
  ].join(' · ');

  return (
    <div className="flex flex-col gap-6" data-testid="output-config-step">

      {/* File Naming */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">File Name</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Prefix for exported file names</p>
        </div>
        <div className="w-[552px] flex flex-col gap-2">
          <div className="flex items-center gap-0">
            <Input
              data-testid="file-prefix-input"
              value={fileNamingPrefix}
              onChange={(e) => handlePrefixChange(e.target.value)}
              placeholder="e.g. daily-export"
              className={cn(
                'flex-1 rounded-r-none border-r-0',
                showPrefixError && 'border-destructive focus-visible:border-destructive'
              )}
              aria-label="File name prefix"
              aria-invalid={showPrefixError}
            />
            <span className="flex items-center h-9 px-3 text-sm text-muted-foreground bg-secondary border border-input rounded-r-md whitespace-nowrap select-none">
              -{'{timestamp}'}.{getFileExtension(formatOptions.delimiter)}
            </span>
          </div>
          {showPrefixError && (
            <p className="text-xs text-destructive m-0" data-testid="prefix-error">
              Prefix must be 1–100 characters using only letters, numbers, hyphens, and underscores
            </p>
          )}
          <p className="text-xs text-muted-foreground m-0">
            Only letters, numbers, hyphens (-) and underscores (_) allowed. Max 100 characters.
          </p>
        </div>
      </div>

      {/* File Format Selection */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">File Format</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Output file type</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <Select
            value={currentFileFormat}
            onValueChange={(v) => handleFileFormatChange(v as FileFormat)}
          >
            <SelectTrigger aria-label="File format" data-testid="file-format-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILE_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timezone */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Timezone</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">For datetime values in export</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <Select
            value={formatOptions.timezone}
            onValueChange={(v) => updateFormat({ timezone: v })}
          >
            <SelectTrigger aria-label="Timezone" data-testid="timezone-select">
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

      {/* Format Options — collapsible */}
      <div className="border-t border-border pt-5">
        <div className="flex items-start gap-14">
          <div className="w-40 shrink-0">
            <p className="text-sm font-semibold text-foreground m-0">Format Options</p>
            <p className="text-xs text-tertiary-foreground mt-1 m-0">Advanced format settings</p>
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
                  <Select
                    value={formatOptions.delimiter}
                    onValueChange={(v) => updateFormat({ delimiter: v as FormatOptions['delimiter'] })}
                  >
                    <SelectTrigger aria-label="Delimiter" data-testid="delimiter-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIMITER_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Header Row */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="header-row-toggle"
                    data-testid="header-row-toggle"
                    checked={formatOptions.includeHeader}
                    onCheckedChange={(checked) => updateFormat({ includeHeader: checked })}
                  />
                  <Label htmlFor="header-row-toggle">Include header row</Label>
                </div>

                {/* Date Format */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground m-0 mb-1.5">Date Format</p>
                  <Select
                    value={formatOptions.dateFormat}
                    onValueChange={(v) => updateFormat({ dateFormat: v as FormatOptions['dateFormat'] })}
                  >
                    <SelectTrigger aria-label="Date format" data-testid="date-format-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMAT_OPTIONS.map((opt) => (
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

      {/* Filename Preview — always visible */}
      <div className="flex items-start gap-14 border-t border-border pt-5">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Preview</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Generated filename</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="bg-muted rounded-lg py-2.5 px-3.5">
            <p className="text-xs text-foreground font-mono m-0 break-all" data-testid="filename-preview">
              {previewFilename}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
