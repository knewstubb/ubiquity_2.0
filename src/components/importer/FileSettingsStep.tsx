import { useState, useRef } from 'react';
import { UploadSimple, X, FileCsv, WarningCircle } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { PrefixInput } from '@/components/composed/prefix-input';
import { HelpPopover } from '@/components/composed/help-popover';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { parse } from '../../utils/csv-parser';
import type { ImporterConfig, PathMode, ImportDataType, CsvDelimiter, CsvEncoding } from '../../models/importer';

interface FileSettingsStepProps {
  config: ImporterConfig;
  basePath: string;
  connectionName: string;
  onUpdate: (patch: Partial<ImporterConfig>) => void;
  isEditing?: boolean;
}

const PATH_MODES: { value: PathMode; label: string }[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'base', label: 'Shared' },
  { value: 'custom', label: 'Custom' },
];

const DATA_TYPES: { value: ImportDataType; label: string }[] = [
  { value: 'contact', label: 'Contacts' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'both', label: 'Combined' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ACCEPTED_ENCODINGS = ['UTF-8', 'ISO-8859-1', 'Windows-1252'];
const ACCEPTED_DELIMITERS = ['Comma (,)', 'Tab', 'Pipe (|)', 'Semicolon (;)'];

/** Simulates detection of CSV encoding and delimiter from file content */
function detectCsvFormat(content: string): { encoding: string; delimiter: string; valid: boolean } {
  // Detect delimiter by checking the first line for common separators
  const firstLine = content.split('\n')[0] ?? '';
  let delimiter = 'Comma (,)';
  if (firstLine.includes('\t')) delimiter = 'Tab';
  else if (firstLine.includes('|')) delimiter = 'Pipe (|)';
  else if (firstLine.includes(';')) delimiter = 'Semicolon (;)';
  else if (firstLine.includes('~')) delimiter = 'Tilde (~)';

  // For the prototype, assume UTF-8 encoding (real implementation would use chardet)
  const encoding = 'UTF-8';

  const valid = ACCEPTED_ENCODINGS.includes(encoding) && ACCEPTED_DELIMITERS.includes(delimiter);
  return { encoding, delimiter, valid };
}

export function truncateFilename(name: string): string {
  if (name.length <= 40) return name;
  return name.slice(0, 40) + '\u2026';
}

export function FileSettingsStep({
  config,
  basePath,
  connectionName,
  onUpdate,
  isEditing = false,
}: FileSettingsStepProps) {
  const [patternError, setPatternError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [transactionalTable, setTransactionalTable] = useState(config.transactionalTable ?? '');
  const [detectedFormat, setDetectedFormat] = useState<{ encoding: string; delimiter: string; valid: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { filePathConfig, dataType } = config;
  const { pathMode, folderName, readPath, errorFolderPath, archiveFolderPath, fileNamePattern } =
    filePathConfig;

  function toKebabCase(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function handleNameChange(newName: string) {
    const patch: Partial<ImporterConfig> = { name: newName };
    // In automatic mode, sync folder name from the name field
    if (filePathConfig.pathMode === 'automatic') {
      patch.filePathConfig = { ...filePathConfig, folderName: toKebabCase(newName) };
    }
    onUpdate(patch);
  }

  function updatePath(patch: Partial<typeof filePathConfig>) {
    onUpdate({ filePathConfig: { ...filePathConfig, ...patch } });
  }

  function validateFilePattern(value: string) {
    const wildcardCount = (value.match(/\*/g) || []).length;
    if (wildcardCount > 1) {
      setPatternError('Only one wildcard (*) is allowed per pattern');
      return;
    }
    if (value.trim() === '*') {
      setPatternError('A wildcard alone would match every file — add a filename prefix or suffix');
      return;
    }
    setPatternError('');
  }

  function handlePatternBlur(value: string) {
    // Strip .csv from the end if the user typed it (since it's auto-appended)
    const stripped = value.replace(/\.csv$/i, '');
    if (stripped !== value) {
      updatePath({ fileNamePattern: stripped });
    }
    validateFilePattern(stripped);
  }

  function handleFileSelect(file: File) {
    setFileError(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('Only .csv files are accepted');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File is too large (max 5 MB)');
      return;
    }

    // Read and parse
    const reader = new FileReader();
    reader.onload = () => {
      const csvString = reader.result as string;

      // Detect encoding and delimiter
      const format = detectCsvFormat(csvString);
      setDetectedFormat(format);

      if (!format.valid) {
        setUploadedFileName(file.name);
        setFileError(null);
        return;
      }

      const result = parse(csvString);

      if (result.headers.length === 0) {
        setFileError('File has no columns');
        return;
      }

      const isReplacement = uploadedFileName !== null;
      setUploadedFileName(file.name);
      setFileError(null);

      if (isReplacement) {
        // When replacing an existing file, clear all mappings
        onUpdate({
          csvHeaders: result.headers,
          csvExampleValues: result.exampleValues,
          contactMapping: [],
          transactionalMapping: [],
          lookupMappings: [],
        });
      } else {
        onUpdate({ csvHeaders: result.headers, csvExampleValues: result.exampleValues });
      }
    };
    reader.onerror = () => {
      setFileError('Unable to read file');
    };
    reader.readAsText(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  function handleDropzoneClick() {
    fileInputRef.current?.click();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // Only set false if leaving the container entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleRemoveFile() {
    setUploadedFileName(null);
    setFileError(null);
    setDetectedFormat(null);
    onUpdate({
      csvHeaders: undefined,
      csvExampleValues: undefined,
      lookupMappings: [],
      contactMapping: [],
      transactionalMapping: [],
    });
  }

  const effectiveBasePath =
    !basePath || basePath === '/' ? '/company/base-path/' : basePath;

  return (
    <div className="flex flex-col gap-8">

      {/* Name */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <p className="text-sm font-semibold text-foreground m-0">Importer Name <span className="text-destructive">*</span></p>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">A unique name for this importer</p>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <Input
            value={config.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Daily Contact Import"
            aria-label="Automation name"
          />
        </div>
      </div>

      {/* Destination File Path */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">File Path</p>
            <HelpPopover
              title="How do files move through the system?"
              body={
                <>
                  <p className="m-0 mb-2">UbiQuity checks your Base Path every 5 minutes for files matching your File Pattern. When a file is found:</p>
                  <ul className="m-0 pl-4 list-disc flex flex-col gap-1">
                    <li>It's moved to the <strong>Read Path</strong> while being processed</li>
                    <li>If the import succeeds, it's moved to the <strong>Archive Path</strong></li>
                    <li>If it fails, it's moved to the <strong>Error Path</strong></li>
                  </ul>
                </>
              }
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">This must be unique</p>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <SegmentedControl
            options={PATH_MODES}
            value={pathMode}
            onValueChange={(v) => updatePath({ pathMode: v as PathMode })}
          />

          {pathMode === 'automatic' && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Folder Name</p>
                <Input
                  value={folderName}
                  onChange={(e) => updatePath({ folderName: e.target.value })}
                  placeholder="e.g. onboarding-2026"
                  title="Must be unique. Lowercase letters and hyphens only."
                />
              </div>
              <div className="bg-accent rounded-lg py-3 px-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-primary m-0 mb-1">Folders that will be created</p>
                <p className="text-xs text-primary font-normal m-0 leading-relaxed">{`${effectiveBasePath}${folderName || 'your-folder'}/`}</p>
                <p className="text-xs text-primary font-normal m-0 leading-relaxed">{`${effectiveBasePath}${folderName || 'your-folder'}/error/`}</p>
                <p className="text-xs text-primary font-normal m-0 leading-relaxed">{`${effectiveBasePath}${folderName || 'your-folder'}/archive/`}</p>
              </div>
            </>
          )}

          {pathMode === 'base' && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Read Path</p>
                <Input
                  value={effectiveBasePath}
                  disabled
                  aria-label="Read path (inherited from connection)"
                />
              </div>
            </>
          )}

          {pathMode === 'custom' && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Read Path <span className="text-destructive">*</span></p>
                <Input
                  value={readPath}
                  onChange={(e) => {
                    const newReadPath = e.target.value;
                    const basePath = newReadPath.replace(/\/$/, '');
                    const patch: Partial<typeof filePathConfig> = { readPath: newReadPath };
                    // Autocomplete error and archive paths when they're empty or match the previous auto-generated value
                    if (!errorFolderPath || errorFolderPath === readPath.replace(/\/$/, '') + '/error/') {
                      patch.errorFolderPath = basePath ? basePath + '/error/' : '';
                    }
                    if (!archiveFolderPath || archiveFolderPath === readPath.replace(/\/$/, '') + '/archive/') {
                      patch.archiveFolderPath = basePath ? basePath + '/archive/' : '';
                    }
                    updatePath(patch);
                  }}
                  placeholder="/custom/inbound/"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Error Folder Path <span className="text-destructive">*</span></p>
                <Input
                  value={errorFolderPath}
                  onChange={(e) => updatePath({ errorFolderPath: e.target.value })}
                  placeholder="/custom/inbound/error/"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Archive Folder Path <span className="text-destructive">*</span></p>
                <Input
                  value={archiveFolderPath}
                  onChange={(e) => updatePath({ archiveFolderPath: e.target.value })}
                  placeholder="/custom/inbound/archive/"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sample CSV */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Sample CSV {!isEditing && <span className="text-destructive">*</span>}</p>
            <HelpPopover
              title="Why does the sample file matter?"
              body={
                <>
                  <p className="m-0 mb-2">Your sample file defines the permanent column structure for this importer. Every production file you import later must match this exact format — same columns, same order.</p>
                  <p className="m-0 mb-2 font-medium">File requirements:</p>
                  <ul className="m-0 pl-4 list-disc flex flex-col gap-1">
                    <li>Format: CSV (.csv) under 5 MB</li>
                    <li>Encoding: UTF-8, ISO-8859-1, or Windows-1252</li>
                    <li>Delimiter: Comma, Tab, Pipe (|), or Semicolon (;)</li>
                    <li>Must include a header row</li>
                  </ul>
                  <p className="m-0 mt-2 text-muted-foreground">The encoding and delimiter are auto-detected when you upload. If they don't match the accepted options, the file will be rejected.</p>
                </>
              }
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            This file will define all the fields available for mapping
          </p>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="flex flex-col">
            {uploadedFileName ? (
              <div className={cn(
                "border-[1.5px] rounded-md py-2 px-4 flex flex-row items-center gap-2 h-14",
                detectedFormat && !detectedFormat.valid
                  ? "border-destructive bg-destructive-subtle"
                  : "border-border"
              )}>
                <FileCsv size={20} className={cn(
                  "shrink-0",
                  detectedFormat && !detectedFormat.valid ? "text-destructive" : "text-primary"
                )} />
                <p className={cn(
                  "text-sm m-0 flex-1 truncate",
                  detectedFormat && !detectedFormat.valid ? "text-destructive" : "text-foreground"
                )}>
                  {truncateFilename(uploadedFileName)}
                </p>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-tertiary-foreground hover:text-foreground transition-colors p-0.5 rounded"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "border-2 border-dashed rounded-md flex items-center justify-center gap-2 cursor-pointer h-14 transition-colors duration-150 hover:border-primary hover:bg-accent",
                  fileError ? "border-destructive" : "border-border",
                  isDragging && "border-primary bg-accent/50 scale-[1.01]"
                )}
                role="button"
                tabIndex={0}
                aria-label="Upload sample file"
                onClick={handleDropzoneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDropzoneClick(); }}
              >
                <div className="text-tertiary-foreground flex items-center pointer-events-none">
                  <UploadSimple size={20} />
                </div>
                <p className="text-sm text-tertiary-foreground m-0 whitespace-nowrap pointer-events-none">
                  Drag & drop a file here, or{' '}
                  <span className="text-primary font-medium underline cursor-pointer">browse</span>
                </p>
              </div>
            )}

            {/* Detected format error bar — only shown for invalid files */}
            {detectedFormat && !detectedFormat.valid && uploadedFileName && (
              <div
                role="alert"
                className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs bg-destructive-subtle text-destructive border border-destructive/20"
              >
                <WarningCircle size={16} weight="fill" className="text-destructive shrink-0" />
                <span>
                  Detected <strong>{detectedFormat.delimiter}</strong> delimiter — not supported. Accepted: Comma, Tab, Pipe, or Semicolon.
                </span>
              </div>
            )}
          </div>
          {fileError && (
            <p className="text-xs text-destructive -mt-1 mb-0">{fileError}</p>
          )}
        </div>
      </div>

      {/* File Pattern — only for base and custom modes */}
      {pathMode !== 'automatic' && (
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">File Pattern</p>
            <HelpPopover
              title="How does UbiQuity know which files to import?"
              width="wide"
              body={
                <>
                  <p className="m-0 mb-2">UbiQuity looks for files whose name matches the pattern you set here. The .csv extension is added automatically. Use the * character to mean "anything." For example:</p>
                  <ul className="m-0 pl-4 mb-2 list-disc flex flex-col gap-1">
                    <li><strong>sales-*</strong> matches sales-jan.csv, sales-feb.csv, sales-2026.csv</li>
                    <li><strong>daily-export-*</strong> matches daily-export-01.csv, daily-export-02.csv</li>
                    <li><strong>contacts</strong> matches only contacts.csv (exact match)</li>
                  </ul>
                  <p className="m-0">The pattern only checks the filename — not the folder path.</p>
                </>
              }
              details="If multiple connectors share the same Base Path, each one must have a different Filename Filter. Otherwise both connectors will try to import the same files. Use specific prefixes (e.g. sales-*.csv, orders-*.csv) to keep connectors separate within the same directory."
              detailsVariant="caution"
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">This must be unique</p>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className={cn(
            "flex rounded-md border border-input overflow-hidden transition-colors",
            "focus-within:border-ring focus-within:shadow-ring",
            patternError && "border-destructive focus-within:border-destructive focus-within:shadow-ring-destructive"
          )}>
            <Input
              className="rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:shadow-none"
              value={fileNamePattern}
              onChange={(e) => { updatePath({ fileNamePattern: e.target.value }); validateFilePattern(e.target.value); }}
              onBlur={(e) => handlePatternBlur(e.target.value)}
              placeholder="filename*"
              title="Which filenames to look for. Use * to match any characters."
              aria-invalid={!!patternError}
            />
            <span className="inline-flex items-center border-l border-input bg-muted px-3 text-sm text-muted-foreground select-none shrink-0">
              .csv
            </span>
          </div>
          {patternError && (
            <p className="text-xs text-destructive -mt-1 mb-0">{patternError}</p>
          )}
        </div>
      </div>
      )}

      {/* Importing To (Destination) */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Importing To</p>
            <HelpPopover
              title="What's the difference?"
              body={
                <>
                  <ul className="m-0 pl-4 list-disc flex flex-col gap-2">
                    <li><strong>Contacts</strong> – updates the contact database with people records.</li>
                    <li><strong>Transactional</strong> – updates a transactional table with activity data (e.g. purchases, treatments).</li>
                    <li><strong>Combined</strong> – updates both contacts and transactional data in a single import.</li>
                  </ul>
                </>
              }
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">Select the database you want to update</p>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <SegmentedControl
            options={DATA_TYPES}
            value={dataType ?? 'contact'}
            onValueChange={(v) => onUpdate({ dataType: v as ImportDataType })}
          />

          {/* Contacts Database — shown for contact and both */}
          {(dataType === 'contact' || dataType === 'both') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Contacts Database</p>
              <Input value="Customer Contacts" disabled />
            </div>
          )}

          {/* Transactional Database — shown for transactional and both */}
          {(dataType === 'transactional' || dataType === 'both') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Transactional Database</p>
              <Select
                value={transactionalTable || undefined}
                onValueChange={(v) => {
                  setTransactionalTable(v);
                  onUpdate({ transactionalTable: v });
                }}
              >
                <SelectTrigger aria-label="Select transactional table" title="The table where imported records will be stored.">
                  <SelectValue placeholder="Select Database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="treatments">Treatments</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

