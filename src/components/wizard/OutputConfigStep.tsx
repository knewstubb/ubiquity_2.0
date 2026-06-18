import { useMemo, useState } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { resolveTimestamp } from '../../utils/exporter-utils';
import type { ExporterWizardDraft } from '../../models/wizard';
import type { FormatOptions } from '../../models/automation';

interface OutputConfigStepProps {
  draft: ExporterWizardDraft;
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void;
}

const DELIMITER_OPTIONS: { value: FormatOptions['delimiter']; label: string }[] = [
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab' },
  { value: '|', label: 'Pipe (|)' },
  { value: ';', label: 'Semicolon (;)' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'ISO8601', label: 'ISO 8601 (2025-05-09)' },
  { value: 'US', label: 'US (05/09/2025)' },
  { value: 'EU', label: 'EU (09/05/2025)' },
  { value: 'UNIX', label: 'UNIX Timestamp' },
];

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export function OutputConfigStep({ draft, onUpdate }: OutputConfigStepProps) {
  const { formatOptions, fileNamingPrefix, name } = draft;
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fileNameManuallyEdited, setFileNameManuallyEdited] = useState(false);

  const autoFileName = useMemo(() => slugifyName(name || 'export'), [name]);
  const effectivePrefix = fileNameManuallyEdited ? fileNamingPrefix : autoFileName;

  // Strip .csv if user types it manually
  const cleanedPrefix = effectivePrefix.replace(/\.csv$/i, '');

  // Validate prefix — only show error when manually edited and invalid
  const prefixHasError = fileNameManuallyEdited && cleanedPrefix.length > 0 && !/^[a-z0-9][a-z0-9_-]*$/i.test(cleanedPrefix);

  const previewFilename = useMemo(() => {
    const timestamp = resolveTimestamp(new Date());
    const prefix = cleanedPrefix || 'export';
    return `${prefix}-${timestamp}.csv`;
  }, [cleanedPrefix]);

  const updateFormat = (patch: Partial<FormatOptions>) => {
    onUpdate({ formatOptions: { ...formatOptions, ...patch } });
  };

  const handleNameChange = (value: string) => {
    if (!fileNameManuallyEdited) {
      onUpdate({ name: value, fileNamingPrefix: slugifyName(value || 'export') });
    } else {
      onUpdate({ name: value });
    }
  };

  const handleFilePrefixChange = (value: string) => {
    setFileNameManuallyEdited(true);
    onUpdate({ fileNamingPrefix: value });
  };

  return (
    <div className="flex flex-col gap-9" data-testid="output-config-step">

      {/* Exporter Name */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">
            Exporter Name <span className="text-destructive">*</span>
          </p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">A unique name for this exporter</p>
        </div>
        <div className="flex-1">
          <Input
            data-testid="exporter-name-input"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Daily Contact Export"
            aria-label="Exporter name"
          />
        </div>
      </div>

      {/* File Name + Advanced Options below */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">File Name</p>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 hover:opacity-80">?</button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-xs" align="start">
                Only letters, numbers, hyphens (-) and underscores (_) are allowed. A timestamp and .csv extension are appended automatically. If you type .csv it will be removed.
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">System filename prefix</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className={cn(
            "flex items-center gap-0 rounded-md border overflow-hidden",
            "focus-within:shadow-ring",
            prefixHasError
              ? 'border-destructive focus-within:border-destructive focus-within:shadow-ring-destructive'
              : 'border-input focus-within:border-ring'
          )}>
            <Input
              data-testid="file-prefix-input"
              value={effectivePrefix}
              onChange={(e) => handleFilePrefixChange(e.target.value)}
              placeholder="e.g. daily-contact-export"
              className="flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent"
              aria-label="File name prefix"
              aria-invalid={prefixHasError}
            />
            <span className="flex items-center h-9 px-3 text-sm text-muted-foreground bg-secondary border-l border-input whitespace-nowrap select-none">
              -{'{timestamp}'}.csv
            </span>
          </div>
          {prefixHasError && (
            <p className="text-xs text-destructive m-0">
              Only letters, numbers, hyphens (-) and underscores (_) allowed. Max 100 characters.
            </p>
          )}

          {/* Advanced options toggle — matches importer style */}
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 text-sm text-primary font-medium mt-1"
          >
            <CaretRight
              size={12}
              weight="bold"
              className={cn(
                "transition-transform duration-150",
                advancedOpen && "rotate-90"
              )}
            />
            {advancedOpen ? 'Hide advanced options' : 'Advanced options'}
          </button>

          {/* Advanced options content — left border accent */}
          {advancedOpen && (
            <div className="border-l-2 border-border pl-4 mt-1">
              <div className="flex items-start gap-5">
              {/* Delimiter */}
              <div className="flex-1">
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

              {/* Date Format */}
              <div className="flex-1">
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

              {/* Header Row */}
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground m-0 mb-1.5">Header Row</p>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    id="header-row-toggle"
                    data-testid="header-row-toggle"
                    checked={formatOptions.includeHeader}
                    onCheckedChange={(checked) => updateFormat({ includeHeader: checked })}
                  />
                  <Label htmlFor="header-row-toggle" className="text-sm">Include</Label>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Preview</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Generated filename</p>
        </div>
        <div className="flex-1">
          <div className="bg-accent rounded-lg py-3 px-4">
            <p className="text-xs text-primary font-mono m-0 break-all" data-testid="filename-preview">
              {previewFilename}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
