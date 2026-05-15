import { useState } from 'react';
import { UploadSimple } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { PrefixInput } from '@/components/composed/prefix-input';
import { HelpPopover } from '@/components/composed/help-popover';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
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

export function FileSettingsStep({
  config,
  basePath,
  connectionName,
  onUpdate,
}: FileSettingsStepProps) {
  const [patternError, setPatternError] = useState('');
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

  const effectiveBasePath =
    !basePath || basePath === '/' ? '/company/base-path/' : basePath;

  return (
    <div className="flex flex-col gap-8">
      <h3 className="m-0 text-lg font-semibold text-primary">File Settings</h3>
      <p className="mt-[-20px] mb-0 text-sm text-tertiary-foreground">Configure how files are read and where they are stored.</p>

      {/* Name */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <p className="text-sm font-semibold text-foreground m-0">Name</p>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">A unique name for this automation</p>
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
              body="UbiQuity checks your Base Path every 5 minutes for files matching your File Pattern. When a file is found: it's moved to the Read Path while being processed, if the import succeeds it's moved to the Archive Path, if it fails it's moved to the Error Path."
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
          <div className="border-2 border-dashed border-border rounded-md py-2 px-4 flex flex-row items-center gap-2 cursor-pointer h-10 transition-colors duration-150 hover:border-primary hover:bg-accent" role="button" tabIndex={0} aria-label="Upload sample file">
            <div className="text-tertiary-foreground flex items-center">
              <UploadSimple size={20} />
            </div>
            <p className="text-sm text-tertiary-foreground m-0 whitespace-nowrap">
              Drag & drop a file here, or{' '}
              <span className="text-primary font-medium underline cursor-pointer">browse</span>
            </p>
          </div>
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
              body="UbiQuity looks for files whose name matches the pattern you set here. Use * to match any characters. For example: sales-*.csv matches sales-jan.csv, *.csv matches any CSV file."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">This must be unique</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <Input
            className={cn(
              patternError && "border-destructive focus-visible:border-destructive focus-visible:shadow-[--ring-shadow-destructive]"
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
              body="Contacts updates the contact database for people records. Transactional updates a transactional table for activity data. Both updates contacts and transactional data in a single import."
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
              <Select defaultValue="" onValueChange={() => {}}>
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


