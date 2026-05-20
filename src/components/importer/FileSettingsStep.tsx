import { useState, useRef } from 'react';
import { UploadSimple, X, FileCsv } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { PrefixInput } from '@/components/composed/prefix-input';
import { HelpPopover } from '@/components/composed/help-popover';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { parse } from '../../utils/csv-parser';
import type { ImporterConfig, PathMode, ImportDataType } from '../../models/importer';

interface FileSettingsStepProps {
  config: ImporterConfig;
  basePath: string;
  connectionName: string;
  onUpdate: (patch: Partial<ImporterConfig>) => void;
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

export function truncateFilename(name: string): string {
  if (name.length <= 40) return name;
  return name.slice(0, 40) + '\u2026';
}

export function FileSettingsStep({
  config,
  basePath,
  connectionName,
  onUpdate,
}: FileSettingsStepProps) {
  const [patternError, setPatternError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [transactionalTable, setTransactionalTable] = useState(config.transactionalTable ?? '');
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
    if (!value.includes('*')) {
      setPatternError('');
      return;
    }
    const beforeWildcard = value.split('*')[0];
    if (beforeWildcard.length === 0) {
      setPatternError('A filename must be included when using a wildcard');
    } else {
      setPatternError('');
    }
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
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleRemoveFile() {
    setUploadedFileName(null);
    setFileError(null);
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
      <h3 className="m-0 text-xl font-semibold text-primary">File Settings</h3>
      <p className="-mt-6 mb-2 text-sm text-tertiary-foreground">Configure how files are read and where they are stored.</p>

      {/* Name */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <p className="text-sm font-semibold text-foreground m-0">Importer Name</p>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">A unique name for this importer</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
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
        <div className="w-[552px] flex flex-col gap-3">
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
              <div className="bg-accent border border-primary rounded-lg py-3 px-4 flex flex-col gap-1">
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
                <p className="text-xs font-medium text-muted-foreground m-0">Read Path</p>
                <Input
                  value={readPath}
                  onChange={(e) => updatePath({ readPath: e.target.value })}
                  placeholder="/custom/inbound/"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Error Folder Path</p>
                <Input
                  value={errorFolderPath}
                  onChange={(e) => updatePath({ errorFolderPath: e.target.value })}
                  placeholder="/custom/inbound/error/"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Archive Folder Path</p>
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

      {/* Sample File */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Sample File</p>
            <HelpPopover
              title="Why does the sample file matter?"
              body="Your sample file defines the permanent column structure for this importer. Every production file you import later must match this exact format — same columns, same order. The file must be a CSV and under 50MB."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            This file will define all the fields available for mapping
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />
          {uploadedFileName ? (
            <div className="border border-border rounded-md py-2 px-4 flex flex-row items-center gap-2 h-10">
              <FileCsv size={20} className="text-primary shrink-0" />
              <p className="text-sm text-foreground m-0 flex-1 truncate">
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
                "border-2 border-dashed rounded-md py-2 px-4 flex flex-row items-center gap-2 cursor-pointer h-10 transition-colors duration-150 hover:border-primary hover:bg-accent",
                fileError ? "border-destructive" : "border-border"
              )}
              role="button"
              tabIndex={0}
              aria-label="Upload sample file"
              onClick={handleDropzoneClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDropzoneClick(); }}
            >
              <div className="text-tertiary-foreground flex items-center">
                <UploadSimple size={20} />
              </div>
              <p className="text-sm text-tertiary-foreground m-0 whitespace-nowrap">
                Drag & drop a file here, or{' '}
                <span className="text-primary font-medium underline cursor-pointer">browse</span>
              </p>
            </div>
          )}
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
                  <p className="m-0 mb-2">UbiQuity looks for files whose name matches the pattern you set here. Use the * character to mean "anything." For example:</p>
                  <ul className="m-0 pl-4 mb-2 list-disc flex flex-col gap-1">
                    <li><strong>sales-*.csv</strong> matches sales-jan.csv, sales-feb.csv, sales-2026.csv</li>
                    <li><strong>*.csv</strong> matches any CSV file in the folder</li>
                    <li><strong>daily-export-*.csv</strong> matches daily-export-01.csv, daily-export-02.csv</li>
                  </ul>
                  <p className="m-0">The pattern only checks the filename — not the folder path. If you're only ever placing one type of file in the folder, *.csv is the simplest option.</p>
                </>
              }
              details="If multiple connectors share the same Base Path, each one must have a different Filename Filter. Otherwise both connectors will try to import the same files. Use specific prefixes (e.g. sales-*.csv, orders-*.csv) to keep connectors separate within the same directory."
              detailsVariant="caution"
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">This must be unique</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <Input
            className={cn(
              patternError && "border-destructive focus-visible:border-destructive focus-visible:shadow-ring-destructive"
            )}
            value={fileNamePattern}
            onChange={(e) => updatePath({ fileNamePattern: e.target.value })}
            onBlur={(e) => validateFilePattern(e.target.value)}
            placeholder="filename*.csv"
            title="Which filenames to look for. Use * to match any characters."
            aria-invalid={!!patternError}
          />
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
        <div className="w-[552px] flex flex-col gap-3">
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


